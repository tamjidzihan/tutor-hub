from django.contrib import admin
from .models import JobApplication

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['job', 'tutor_user', 'expected_salary', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['job__job_id', 'job__title', 'tutor_user__email', 'tutor_user__first_name']
