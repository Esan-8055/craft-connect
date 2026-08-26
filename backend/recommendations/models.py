from django.conf import settings
from django.db import models


class UserActivity(models.Model):
    """Tracks user interactions for recommendation engine."""

    class ActionType(models.TextChoices):
        VIEW = "view", "Viewed"
        PURCHASE = "purchase", "Purchased"
        ENROLL = "enroll", "Enrolled"
        WISHLIST = "wishlist", "Wishlisted"

    class ContentType(models.TextChoices):
        PRODUCT = "product", "Product"
        COURSE = "course", "Course"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="activities",
    )
    content_type = models.CharField(max_length=10, choices=ContentType.choices)
    object_id = models.PositiveIntegerField()
    action = models.CharField(max_length=10, choices=ActionType.choices)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name_plural = "User Activities"
        indexes = [
            models.Index(fields=["user", "content_type"]),
            models.Index(fields=["content_type", "object_id"]),
        ]

    def __str__(self):
        return f"{self.user.username} {self.action} {self.content_type}:{self.object_id}"
