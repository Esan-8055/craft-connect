from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Custom user model supporting artisan and consumer roles.
    """

    class Role(models.TextChoices):
        ARTISAN = "artisan", "Artisan"
        CONSUMER = "consumer", "Consumer"

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.CONSUMER,
    )
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    profile_image = models.ImageField(
        upload_to="profile_images/",
        blank=True,
        null=True,
    )
    is_verified = models.BooleanField(
        default=False,
        help_text="Whether the artisan has been verified by an admin.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date_joined"]
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_artisan(self):
        return self.role == self.Role.ARTISAN

    @property
    def is_consumer(self):
        return self.role == self.Role.CONSUMER
