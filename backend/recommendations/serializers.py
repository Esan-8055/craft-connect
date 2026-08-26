from rest_framework import serializers
from products.serializers import ProductSerializer
from courses.serializers import CourseSerializer
from .models import UserActivity


class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = ["id", "user", "content_type", "object_id", "action", "timestamp"]
        read_only_fields = ["id", "user", "timestamp"]


class RecommendationResponseSerializer(serializers.Serializer):
    """Response serializer for recommendations."""

    recommended_products = ProductSerializer(many=True)
    recommended_courses = CourseSerializer(many=True)
