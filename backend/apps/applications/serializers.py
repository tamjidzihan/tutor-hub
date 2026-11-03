from rest_framework import serializers
from .models import JobApplication
from apps.tuition_jobs.serializers import TuitionJobListSerializer
from apps.accounts.serializers import UserSerializer

class JobApplicationSerializer(serializers.ModelSerializer):
    job_details = TuitionJobListSerializer(source='job', read_only=True)
    tutor_details = UserSerializer(source='tutor_user', read_only=True)
    job_id = serializers.CharField(source='job.job_id', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    tutor_name = serializers.SerializerMethodField()
    tutor_tutor_id = serializers.SerializerMethodField()
    tutor_profile_photo = serializers.SerializerMethodField()
    applied_at = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'job_id', 'job_title', 'tutor_user',
            'cover_message', 'expected_salary', 'status', 'seen_by_student', 'applied_at',
            'job_details', 'tutor_details', 'tutor_name', 'tutor_tutor_id', 'tutor_profile_photo'
        ]
        read_only_fields = ['id', 'tutor_user', 'status', 'seen_by_student', 'applied_at']

    def get_applied_at(self, obj):
        return obj.created_at.strftime("%b %d, %Y")

    def get_tutor_name(self, obj):
        if obj.tutor_user:
            return obj.tutor_user.full_name or obj.tutor_user.email
        return ''

    def get_tutor_tutor_id(self, obj):
        profile = getattr(obj.tutor_user, 'tutor_profile', None)
        return profile.tutor_id if profile else ''

    def get_tutor_profile_photo(self, obj):
        if obj.tutor_user.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.tutor_user.profile_image.url)
            return obj.tutor_user.profile_image.url
        profile = getattr(obj.tutor_user, 'tutor_profile', None)
        if profile and profile.profile_photo_url:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(profile.profile_photo_url)
            return profile.profile_photo_url
        return ''

class JobApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['job', 'cover_message', 'expected_salary']

    def validate(self, attrs):
        request = self.context.get('request')
        job = attrs.get('job')
        if request and job:
            if JobApplication.objects.filter(job=job, tutor_user=request.user).exists():
                raise serializers.ValidationError("You have already applied for this job.")
        return attrs
