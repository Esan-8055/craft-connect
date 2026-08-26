from django.contrib import admin
from .models import Course, Video


class VideoInline(admin.TabularInline):
    model = Video
    extra = 1
    fields = ["title", "video_url", "order", "duration_minutes"]


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["title", "artisan", "monthly_price", "is_published", "total_videos", "created_at"]
    list_filter = ["is_published", "category", "created_at"]
    search_fields = ["title", "description", "artisan__username"]
    list_editable = ["is_published"]
    inlines = [VideoInline]


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ["title", "course", "order", "duration_minutes", "created_at"]
    list_filter = ["course"]
    search_fields = ["title", "description"]
