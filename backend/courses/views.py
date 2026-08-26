from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsArtisan, IsOwnerOrReadOnly
from subscriptions.models import Subscription
from django.utils import timezone
from .models import Course, Video
from .serializers import (
    CourseSerializer,
    CourseDetailSerializer,
    VideoSerializer,
    VideoListSerializer,
)


class CourseViewSet(viewsets.ModelViewSet):
    """
    CRUD for courses.
    - Public list/retrieve: only published courses (buyer view).
    - Artisans: create / update / delete their own courses.
    - Custom actions: my-courses, publish, unpublish.
    """

    serializer_class = CourseSerializer
    filterset_fields = ["category", "artisan"]
    search_fields = ["title", "description"]
    ordering_fields = ["monthly_price", "created_at", "title"]

    def get_queryset(self):
        """
        Default queryset returns only published courses.
        Seller-specific actions override this with their own querysets.
        """
        return Course.objects.filter(is_published=True).select_related("artisan")

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CourseDetailSerializer
        return CourseSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsArtisan()]
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsArtisan(), IsOwnerOrReadOnly()]
        if self.action in ("publish", "unpublish", "my_courses"):
            return [permissions.IsAuthenticated(), IsArtisan()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(artisan=self.request.user)

    # ─── Custom Actions ──────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="my-courses")
    def my_courses(self, request):
        """Return ALL courses owned by the requesting artisan (drafts + published)."""
        qs = (
            Course.objects.filter(artisan=request.user)
            .select_related("artisan")
            .order_by("-created_at")
        )
        serializer = CourseSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """Set a course as published (visible to buyers)."""
        course = Course.objects.filter(pk=pk, artisan=request.user).first()
        if not course:
            return Response(
                {"detail": "Course not found."}, status=status.HTTP_404_NOT_FOUND
            )
        course.is_published = True
        course.save(update_fields=["is_published", "updated_at"])
        serializer = CourseSerializer(course, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        """Revert a course to draft (hidden from buyers)."""
        course = Course.objects.filter(pk=pk, artisan=request.user).first()
        if not course:
            return Response(
                {"detail": "Course not found."}, status=status.HTTP_404_NOT_FOUND
            )
        course.is_published = False
        course.save(update_fields=["is_published", "updated_at"])
        serializer = CourseSerializer(course, context={"request": request})
        return Response(serializer.data)


class VideoViewSet(viewsets.ModelViewSet):
    """
    Manage videos within a course.
    - Artisans (course owner): full CRUD.
    - Subscribed consumers: read-only with video URLs.
    - Others: list metadata only (no video URLs).
    """

    def get_queryset(self):
        return Video.objects.filter(
            course_id=self.kwargs["course_pk"]
        ).select_related("course")

    def get_serializer_class(self):
        user = self.request.user
        course_pk = self.kwargs["course_pk"]

        # Course owner always gets full access
        if user.is_authenticated and user.role == "artisan":
            try:
                course = Course.objects.get(pk=course_pk)
                if course.artisan == user:
                    return VideoSerializer
            except Course.DoesNotExist:
                pass

        # Subscribed consumer gets full access
        if user.is_authenticated:
            has_active_sub = Subscription.objects.filter(
                consumer=user,
                course_id=course_pk,
                end_date__gte=timezone.now().date(),
            ).exists()
            if has_active_sub:
                return VideoSerializer

        # Everyone else gets metadata only (no video_url)
        return VideoListSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsArtisan()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        course = Course.objects.get(pk=self.kwargs["course_pk"])
        if course.artisan != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only add videos to your own courses.")
        serializer.save(course=course)
