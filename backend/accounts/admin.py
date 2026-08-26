from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

User = get_user_model()


@admin.action(description="Verify selected artisans")
def verify_artisans(modeladmin, request, queryset):
    queryset.filter(role="artisan").update(is_verified=True)


@admin.action(description="Revoke artisan verification")
def revoke_verification(modeladmin, request, queryset):
    queryset.update(is_verified=False)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = [
        "username",
        "email",
        "role",
        "is_verified",
        "is_staff",
        "date_joined",
    ]
    list_filter = ["role", "is_verified", "is_staff", "is_active"]
    search_fields = ["username", "email", "first_name", "last_name"]
    actions = [verify_artisans, revoke_verification]

    # Extend the default UserAdmin fieldsets
    fieldsets = UserAdmin.fieldsets + (
        (
            "Craft Connect",
            {
                "fields": ("role", "phone", "bio", "profile_image", "is_verified"),
            },
        ),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Craft Connect",
            {
                "fields": ("role", "phone"),
            },
        ),
    )
