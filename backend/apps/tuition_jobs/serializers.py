from rest_framework import serializers
from .models import TuitionJob
from apps.applications.models import JobApplication

class TuitionJobListSerializer(serializers.ModelSerializer):
    posted_at = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()
    posted_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TuitionJob
        fields = [
            'id', 'job_id', 'title', 'city', 'area', 'student_gender',
            'preferred_tutor_gender', 'curriculum', 'class_level',
            'subjects', 'days_per_week', 'tutoring_time', 'salary',
            'tuition_type', 'status', 'is_urgent', 'is_verified',
            'views_count', 'applications_count', 'posted_at', 'has_applied', 'student', 'posted_by_name'
        ]

    def get_posted_at(self, obj):
        return obj.created_at.strftime("%b %d, %Y")

    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.applications.filter(tutor_user=request.user).exists()
        return False

    def get_student(self, obj):
        return obj.student.id if obj.student else None

    def get_posted_by_name(self, obj):
        return obj.student.full_name if obj.student else None

class TuitionJobDetailSerializer(serializers.ModelSerializer):
    posted_at = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()

    class Meta:
        model = TuitionJob
        fields = '__all__'

    def get_posted_at(self, obj):
        return obj.created_at.strftime("%b %d, %Y")

    def get_student_name(self, obj):
        return obj.student.full_name if obj.student else "Student / Guardian"

    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.applications.filter(tutor_user=request.user).exists()
        return False
