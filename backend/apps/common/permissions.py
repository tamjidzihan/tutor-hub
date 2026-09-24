from rest_framework import permissions

class IsTutor(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'TUTOR' or request.user.is_staff))

class IsParent(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role in ['PARENT', 'STUDENT'] or request.user.is_staff))

class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_staff))

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner = getattr(obj, 'user', None) or getattr(obj, 'author', None) or getattr(obj, 'parent', None)
        return owner == request.user or request.user.is_staff
