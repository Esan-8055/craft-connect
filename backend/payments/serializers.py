from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "user",
            "order",
            "subscription",
            "amount",
            "method",
            "status",
            "upi_id",
            "transaction_id",
            "created_at",
        ]
        read_only_fields = ["id", "user", "transaction_id", "created_at"]
