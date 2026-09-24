from django.contrib import admin
from django.contrib.auth import get_user_model

User = get_user_model()

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'first_name', 'last_name', 'role', 'phone', 'is_verified', 'is_active', 'date_joined']
    list_filter = ['role', 'is_verified', 'is_active', 'is_staff']
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    ordering = ['-date_joined']
