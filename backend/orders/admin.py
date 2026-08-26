from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product", "quantity", "price", "subtotal"]

    def subtotal(self, obj):
        return obj.subtotal


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "consumer", "status", "total_amount", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["consumer__username", "consumer__email"]
    list_editable = ["status"]
    inlines = [OrderItemInline]
    readonly_fields = ["total_amount", "created_at", "updated_at"]
