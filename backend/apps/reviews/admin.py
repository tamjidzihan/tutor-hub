from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['guardian_name', 'tutor', 'rating', 'student_class', 'is_verified_guardian', 'created_at']
    list_filter = ['rating', 'is_verified_guardian']
    search_fields = ['guardian_name', 'tutor__tutor_id', 'comment']
