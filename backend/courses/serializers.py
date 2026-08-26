from rest_framework import serializers
from accounts.serializers import ArtisanListSerializer
from .models import Course, Video


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = [
            "id",
            "course",
            "title",
            "description",
            "video_url",
            "order",
            "duration_minutes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class VideoListSerializer(serializers.ModelSerializer):
    """Serializer that hides video_url for non-subscribers."""

    class Meta:
        model = Video
        fields = [
            "id",
            "course",
            "title",
            "description",
            "order",
            "duration_minutes",
            "created_at",
        ]


class CourseSerializer(serializers.ModelSerializer):
    artisan_detail = ArtisanListSerializer(source="artisan", read_only=True)
    total_videos = serializers.IntegerField(read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "artisan",
            "artisan_detail",
            "title",
            "description",
            "monthly_price",
            "thumbnail",
            "category",
            "is_published",
            "total_videos",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "artisan", "is_published", "created_at", "updated_at"]


class CourseDetailSerializer(CourseSerializer):
    """Includes video list (without URLs) for course detail."""

    videos = VideoListSerializer(many=True, read_only=True)

    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ["videos"]
