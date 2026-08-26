from django.contrib import admin
from .models import Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ["consumer", "course", "start_date", "end_date", "is_active", "auto_renew"]
    list_filter = ["auto_renew", "start_date", "end_date"]
    search_fields = ["consumer__username", "course__title"]

    def is_active(self, obj):
        return obj.is_active
    is_active.boolean = True
