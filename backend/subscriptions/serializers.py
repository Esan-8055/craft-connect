from rest_framework import serializers
from .models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = Subscription
        fields = [
            "id",
            "consumer",
            "course",
            "course_title",
            "start_date",
            "end_date",
            "is_active",
            "days_remaining",
            "auto_renew",
            "created_at",
        ]
        read_only_fields = ["id", "consumer", "start_date", "end_date", "created_at"]


class EnrollSerializer(serializers.Serializer):
    """Input serializer for enrollment."""

    course_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(
        choices=["card", "upi", "net_banking", "wallet"],
        default="card",
    )
