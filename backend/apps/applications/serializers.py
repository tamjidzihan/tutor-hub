from rest_framework import serializers
from .models import JobApplication
from apps.tuition_jobs.serializers import TuitionJobListSerializer
from apps.accounts.serializers import UserSerializer

class JobApplicationSerializer(serializers.ModelSerializer):
    job_details = TuitionJobListSerializer(source='job', read_only=True)
    tutor_details = UserSerializer(source='tutor_user', read_only=True)
    job_id = serializers.CharField(source='job.job_id', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    applied_at = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'job_id', 'job_title', 'tutor_user',
            'cover_message', 'expected_salary', 'status', 'applied_at',
            'job_details', 'tutor_details'
        ]
        read_only_fields = ['id', 'tutor_user', 'status', 'applied_at']

    def get_applied_at(self, obj):
        return obj.created_at.strftime("%b %d, %Y")

class JobApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['job', 'cover_message', 'expected_salary']
