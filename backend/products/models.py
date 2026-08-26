from django.conf import settings
from django.db import models


class Product(models.Model):
    """Handmade product listed by an artisan."""

    class Category(models.TextChoices):
        WEAVING = "weaving", "Weaving"
        PAINTING = "painting", "Painting"
        HANDICRAFT = "handicraft", "Handicraft"
        POTTERY = "pottery", "Pottery"
        JEWELRY = "jewelry", "Jewelry"
        TEXTILE = "textile", "Textile"
        WOODWORK = "woodwork", "Woodwork"
        OTHER = "other", "Other"

    artisan = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="products",
        limit_choices_to={"role": "artisan"},
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to="product_images/", blank=True, null=True)
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER,
    )
    stock = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(
        default=False,
        help_text="Draft until explicitly published by the artisan.",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def in_stock(self):
        return self.stock > 0
