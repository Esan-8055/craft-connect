from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsConsumer, IsAdminUser, IsArtisan
from .models import Order
from .serializers import OrderSerializer, OrderStatusSerializer


class IsAdminOrArtisan(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.is_staff or getattr(request.user, "role", None) == "artisan")


class OrderViewSet(viewsets.ModelViewSet):
    """
    Orders API.
    - Consumers: create orders, view own orders.
    - Admins/Artisans: view all orders, update status.
    """

    serializer_class = OrderSerializer
    filterset_fields = ["status"]
    ordering_fields = ["created_at", "total_amount"]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, "role", None) == "artisan":
            return Order.objects.all().prefetch_related("items__product")
        return Order.objects.filter(consumer=user).prefetch_related("items__product")

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsConsumer()]
        if self.action in ("update", "partial_update", "update_status"):
            return [permissions.IsAuthenticated(), IsAdminOrArtisan()]
        if self.action == "destroy":
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        order = serializer.save(consumer=self.request.user)
        # Publish event to Aiven Kafka
        try:
            from craft_connect.kafka_producer import publish_kafka_event
            publish_kafka_event(
                topic="order-events",
                event_type="ORDER_CREATED",
                payload={
                    "order_id": order.id,
                    "consumer_id": order.consumer.id,
                    "consumer_username": order.consumer.username,
                    "total_amount": str(order.total_amount),
                    "status": order.status,
                    "items_count": order.items.count()
                }
            )
        except Exception as e:
            print(f"[KAFKA] Non-blocking event dispatch warning: {e}")

    @action(detail=True, methods=["patch"], permission_classes=[permissions.IsAuthenticated, IsAdminOrArtisan])
    def update_status(self, request, pk=None):
        """Admin/Artisan endpoint to update order status."""
        order = self.get_object()
        serializer = OrderStatusSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
