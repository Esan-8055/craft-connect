from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsArtisan, IsOwnerOrReadOnly
from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    """
    CRUD for products.
    - Public list/retrieve: only published + active products (buyer view).
    - Artisans: create / update / delete their own products.
    """

    serializer_class = ProductSerializer
    filterset_fields = ["category", "artisan"]
    search_fields = ["title", "description"]
    ordering_fields = ["price", "created_at", "title"]

    def get_queryset(self):
        """
        Default queryset returns only published & active products.
        Seller-specific actions override this with their own querysets.
        """
        return Product.objects.filter(
            is_published=True, is_active=True
        ).select_related("artisan")

    def get_permissions(self):
        if self.action in ("create",):
            return [permissions.IsAuthenticated(), IsArtisan()]
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsArtisan(), IsOwnerOrReadOnly()]
        if self.action in ("publish", "unpublish", "my_products"):
            return [permissions.IsAuthenticated(), IsArtisan()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(artisan=self.request.user)

    def perform_destroy(self, instance):
        """Soft-delete: mark as inactive instead of deleting."""
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    # ─── Custom Actions ──────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="my-products")
    def my_products(self, request):
        """Return ALL products owned by the requesting artisan (drafts + published)."""
        qs = Product.objects.filter(
            artisan=request.user, is_active=True
        ).select_related("artisan").order_by("-created_at")
        serializer = ProductSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """Set a product as published (visible to buyers)."""
        product = Product.objects.filter(
            pk=pk, artisan=request.user, is_active=True
        ).first()
        if not product:
            return Response(
                {"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND
            )
        product.is_published = True
        product.save(update_fields=["is_published", "updated_at"])
        serializer = ProductSerializer(product, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        """Revert a product to draft (hidden from buyers)."""
        product = Product.objects.filter(
            pk=pk, artisan=request.user, is_active=True
        ).first()
        if not product:
            return Response(
                {"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND
            )
        product.is_published = False
        product.save(update_fields=["is_published", "updated_at"])
        serializer = ProductSerializer(product, context={"request": request})
        return Response(serializer.data)
