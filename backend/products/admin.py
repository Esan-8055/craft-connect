from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["title", "artisan", "category", "price", "stock", "is_active", "created_at"]
    list_filter = ["category", "is_active", "created_at"]
    search_fields = ["title", "description", "artisan__username"]
    list_editable = ["is_active"]
    readonly_fields = ["created_at", "updated_at"]
