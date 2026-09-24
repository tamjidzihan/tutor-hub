from rest_framework import serializers
from .models import TuitionJob

class TuitionJobListSerializer(serializers.ModelSerializer):
    posted_at = serializers.SerializerMethodField()

    class Meta:
        model = TuitionJob
        fields = [
            'id', 'job_id', 'title', 'city', 'area', 'student_gender',
            'preferred_tutor_gender', 'curriculum', 'class_level',
            'subjects', 'days_per_week', 'tutoring_time', 'salary',
            'tuition_type', 'status', 'is_urgent', 'is_verified',
            'views_count', 'applications_count', 'posted_at'
        ]

    def get_posted_at(self, obj):
        return obj.created_at.strftime("%b %d, %Y")

class TuitionJobDetailSerializer(serializers.ModelSerializer):
    posted_at = serializers.SerializerMethodField()

    class Meta:
        model = TuitionJob
        fields = '__all__'

    def get_posted_at(self, obj):
        return obj.created_at.strftime("%b %d, %Y")
