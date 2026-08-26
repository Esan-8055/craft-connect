from django.db.models import Count, Q
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import viewsets

from products.models import Product
from products.serializers import ProductSerializer
from courses.models import Course
from courses.serializers import CourseSerializer
from .models import UserActivity
from .serializers import UserActivitySerializer


class UserActivityViewSet(viewsets.ModelViewSet):
    """Track user activities (views, purchases, etc.)."""

    serializer_class = UserActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        return UserActivity.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RecommendationView(APIView):
    """
    Basic recommendation engine.

    Strategy:
    1. Personalized: Find categories the user has interacted with,
       then recommend products/courses in those categories they haven't
       seen yet.
    2. Popular: Fall back to globally popular items based on
       activity counts.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        limit = int(request.query_params.get("limit", 10))

        # ── Gather user's preferred categories ──────────────────────
        # Products the user has interacted with
        interacted_product_ids = UserActivity.objects.filter(
            user=user, content_type="product"
        ).values_list("object_id", flat=True)

        interacted_course_ids = UserActivity.objects.filter(
            user=user, content_type="course"
        ).values_list("object_id", flat=True)

        # Categories the user likes
        preferred_categories = (
            Product.objects.filter(id__in=interacted_product_ids)
            .values_list("category", flat=True)
            .distinct()
        )

        preferred_course_categories = (
            Course.objects.filter(id__in=interacted_course_ids)
            .values_list("category", flat=True)
            .distinct()
        )

        # ── Personalized recommendations ────────────────────────────
        recommended_products = Product.objects.filter(
            is_active=True,
        ).exclude(
            id__in=interacted_product_ids
        )

        if preferred_categories:
            # Prioritize products in preferred categories
            recommended_products = recommended_products.filter(
                category__in=preferred_categories
            )

        recommended_courses = Course.objects.filter(
            is_published=True,
        ).exclude(
            id__in=interacted_course_ids
        )

        if preferred_course_categories:
            recommended_courses = recommended_courses.filter(
                category__in=preferred_course_categories
            )

        # ── Popularity fallback ─────────────────────────────────────
        # If not enough personalized results, fill with popular items
        if recommended_products.count() < limit:
            popular_product_ids = (
                UserActivity.objects.filter(content_type="product")
                .values("object_id")
                .annotate(count=Count("id"))
                .order_by("-count")
                .values_list("object_id", flat=True)[:limit]
            )
            popular_products = Product.objects.filter(
                id__in=popular_product_ids, is_active=True
            ).exclude(id__in=interacted_product_ids)
            recommended_products = (recommended_products | popular_products).distinct()

        if recommended_courses.count() < limit:
            popular_course_ids = (
                UserActivity.objects.filter(content_type="course")
                .values("object_id")
                .annotate(count=Count("id"))
                .order_by("-count")
                .values_list("object_id", flat=True)[:limit]
            )
            popular_courses = Course.objects.filter(
                id__in=popular_course_ids, is_published=True
            ).exclude(id__in=interacted_course_ids)
            recommended_courses = (recommended_courses | popular_courses).distinct()

        # ── Serialize & return ──────────────────────────────────────
        products_data = ProductSerializer(
            recommended_products[:limit], many=True, context={"request": request}
        ).data
        courses_data = CourseSerializer(
            recommended_courses[:limit], many=True, context={"request": request}
        ).data

        return Response(
            {
                "recommended_products": products_data,
                "recommended_courses": courses_data,
            }
        )
