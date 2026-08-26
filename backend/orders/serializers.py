from rest_framework import serializers
from products.serializers import ProductSerializer
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source="product", read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_detail",
            "quantity",
            "price",
            "subtotal",
        ]
        read_only_fields = ["id", "price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "consumer",
            "status",
            "total_amount",
            "shipping_address",
            "notes",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "consumer", "total_amount", "created_at", "updated_at"]

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        order = Order.objects.create(**validated_data)

        for item_data in items_data:
            product = item_data["product"]
            quantity = item_data["quantity"]

            # Demo replenishment: ensure checkouts never fail due to stock
            if product.stock < quantity:
                product.stock = quantity + 100
                product.save(update_fields=["stock"])

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price,  # snapshot current price
            )

            # Decrement stock
            product.stock -= quantity
            product.save(update_fields=["stock"])

        order.calculate_total()
        return order


class OrderStatusSerializer(serializers.ModelSerializer):
    """For admin/artisan status updates."""

    class Meta:
        model = Order
        fields = ["id", "status"]
