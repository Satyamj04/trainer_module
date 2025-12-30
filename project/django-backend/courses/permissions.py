from rest_framework.permissions import BasePermission


class IsTrainer(BasePermission):
    """Allow access only to users whose primary_role is 'trainer' or superusers."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # For superusers allow
        if getattr(user, 'is_superuser', False):
            return True
        return getattr(user, 'primary_role', '') == 'trainer'