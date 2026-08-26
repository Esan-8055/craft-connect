from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["transaction_id", "user", "amount", "method", "status", "created_at"]
    list_filter = ["status", "method", "created_at"]
    search_fields = ["transaction_id", "user__username"]
    readonly_fields = ["transaction_id", "created_at"]
