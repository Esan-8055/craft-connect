from rest_framework import permissions


class IsArtisan(permissions.BasePermission):
    """Allow access only to users with the artisan role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "artisan"
        )


class IsConsumer(permissions.BasePermission):
    """Allow access only to users with the consumer role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "consumer"
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Object-level permission: only the owner may edit."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # `obj.artisan` or `obj.user` — try both conventions
        owner = getattr(obj, "artisan", None) or getattr(obj, "user", None)
        return owner == request.user


class IsAdminUser(permissions.BasePermission):
    """Allow access only to staff / superuser."""

    def has_permission(self, request, view):
        return request.user and request.user.is_staff
