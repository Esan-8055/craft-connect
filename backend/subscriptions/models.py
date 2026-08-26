from django.conf import settings
from django.db import models
from django.utils import timezone


class Subscription(models.Model):
    """Monthly subscription to a course."""

    consumer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subscriptions",
    )
    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        related_name="subscriptions",
    )
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField()
    auto_renew = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ["consumer", "course"]  # one active sub per course per user

    def __str__(self):
        return f"{self.consumer.username} → {self.course.title}"

    @property
    def is_active(self):
        return self.end_date >= timezone.now().date()

    @property
    def days_remaining(self):
        delta = self.end_date - timezone.now().date()
        return max(delta.days, 0)
