from rest_framework import permissions

class IsBuilder(permissions.BasePermission):
    """
    Allows access only to users with the BUILDER role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'BUILDER')

class IsContractor(permissions.BasePermission):
    """
    Allows access only to users with the CONTRACTOR role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'CONTRACTOR')

class IsSupplier(permissions.BasePermission):
    """
    Allows access only to users with the SUPPLIER role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'SUPPLIER')

class IsAdmin(permissions.BasePermission):
    """
    Allows access only to users with the ADMIN role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'ADMIN')
