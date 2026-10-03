from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['student_name', 'tutor', 'rating', 'student_class', 'is_verified_student', 'ai_sentiment', 'created_at']
    list_filter = ['rating', 'is_verified_student', 'ai_sentiment']
    search_fields = ['student_name', 'tutor__tutor_id', 'comment']
