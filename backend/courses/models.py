from django.conf import settings
from django.db import models


class Course(models.Model):
    """Craft learning course created by an artisan."""

    artisan = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="courses",
        limit_choices_to={"role": "artisan"},
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    monthly_price = models.DecimalField(max_digits=10, decimal_places=2)
    thumbnail = models.ImageField(
        upload_to="course_thumbnails/", blank=True, null=True
    )
    category = models.CharField(max_length=50, blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def total_videos(self):
        return self.videos.count()


class Video(models.Model):
    """Individual video within a course."""

    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="videos"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    video_url = models.URLField(
        help_text="URL to the hosted video (YouTube, Vimeo, S3, etc.)"
    )
    order = models.PositiveIntegerField(default=0)
    duration_minutes = models.PositiveIntegerField(
        default=0, help_text="Duration in minutes"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.title} — {self.title}"
