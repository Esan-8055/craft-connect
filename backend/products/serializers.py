from rest_framework import serializers
from accounts.serializers import ArtisanListSerializer
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    artisan_detail = ArtisanListSerializer(source="artisan", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "artisan",
            "artisan_detail",
            "title",
            "description",
            "price",
            "image",
            "category",
            "stock",
            "in_stock",
            "is_published",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "artisan", "is_published", "is_active", "created_at", "updated_at"]
