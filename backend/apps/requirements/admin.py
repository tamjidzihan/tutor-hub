from django.contrib import admin
from .models import TutorRequirement

@admin.register(TutorRequirement)
class TutorRequirementAdmin(admin.ModelAdmin):
    list_display = ['requirement_id', 'parent_name', 'phone', 'student_name', 'class_level', 'city', 'area', 'budget', 'status', 'created_at']
    list_filter = ['status', 'city', 'curriculum', 'preferred_tutor_gender']
    search_fields = ['requirement_id', 'parent_name', 'phone', 'student_name', 'area']
