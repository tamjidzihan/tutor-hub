from django.contrib import admin
from .models import TutorProfile, TutorEducation, TutorExperience

class TutorEducationInline(admin.TabularInline):
    model = TutorEducation
    extra = 1

class TutorExperienceInline(admin.TabularInline):
    model = TutorExperience
    extra = 1

@admin.register(TutorProfile)
class TutorProfileAdmin(admin.ModelAdmin):
    list_display = ['tutor_id', 'user', 'university', 'department', 'city', 'area', 'expected_salary', 'rating', 'verification_status', 'is_verified', 'profile_completion_score']
    list_filter = ['verification_status', 'is_verified', 'gender', 'city']
    search_fields = ['tutor_id', 'user__email', 'user__first_name', 'user__last_name', 'university', 'department']
    inlines = [TutorEducationInline, TutorExperienceInline]
