from datetime import timedelta

from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsConsumer
from courses.models import Course
from payments.models import Payment
from .models import Subscription
from .serializers import SubscriptionSerializer, EnrollSerializer


class SubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Subscriptions API.
    - Consumers: list own subscriptions, enroll in a course, check access.
    """

    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Subscription.objects.all().select_related("course")
        return Subscription.objects.filter(consumer=user).select_related("course")

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsConsumer])
    def enroll(self, request):
        """
        Enroll the current consumer in a course.
        Creates a 30-day subscription and a payment record.
        """
        serializer = EnrollSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        course_id = serializer.validated_data["course_id"]
        payment_method = serializer.validated_data["payment_method"]

        try:
            course = Course.objects.get(pk=course_id, is_published=True)
        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found or not published."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check for existing active subscription
        existing = Subscription.objects.filter(
            consumer=request.user,
            course=course,
            end_date__gte=timezone.now().date(),
        ).first()

        if existing:
            return Response(
                {
                    "error": "You already have an active subscription for this course.",
                    "subscription": SubscriptionSerializer(existing).data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create subscription (30 days)
        start = timezone.now().date()
        end = start + timedelta(days=30)

        sub, created = Subscription.objects.update_or_create(
            consumer=request.user,
            course=course,
            defaults={"start_date": start, "end_date": end},
        )

        # Create payment record
        Payment.objects.create(
            user=request.user,
            subscription=sub,
            amount=course.monthly_price,
            method=payment_method,
            status="completed",
        )

        return Response(
            {
                "message": "Enrollment successful.",
                "subscription": SubscriptionSerializer(sub).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def check_access(self, request):
        """Check if the user has active access to a specific course."""
        course_id = request.query_params.get("course_id")
        if not course_id:
            return Response(
                {"error": "course_id query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        has_access = Subscription.objects.filter(
            consumer=request.user,
            course_id=course_id,
            end_date__gte=timezone.now().date(),
        ).exists()

        return Response({"course_id": int(course_id), "has_access": has_access})
