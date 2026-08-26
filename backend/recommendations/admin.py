from django.contrib import admin
from .models import UserActivity


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ["user", "content_type", "object_id", "action", "timestamp"]
    list_filter = ["content_type", "action", "timestamp"]
    search_fields = ["user__username"]
    readonly_fields = ["timestamp"]
