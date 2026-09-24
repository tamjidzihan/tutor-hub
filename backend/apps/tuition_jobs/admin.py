from django.contrib import admin
from .models import TuitionJob

@admin.register(TuitionJob)
class TuitionJobAdmin(admin.ModelAdmin):
    list_display = ['job_id', 'title', 'city', 'area', 'class_level', 'salary', 'status', 'is_urgent', 'views_count', 'created_at']
    list_filter = ['status', 'is_urgent', 'city', 'curriculum', 'preferred_tutor_gender']
    search_fields = ['job_id', 'title', 'area', 'city']
