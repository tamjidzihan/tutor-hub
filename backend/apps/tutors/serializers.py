from rest_framework import serializers
from .models import TutorProfile, TutorEducation, TutorExperience
from apps.accounts.serializers import UserSerializer

class TutorEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorEducation
        fields = ['id', 'degree', 'institution', 'department', 'passing_year', 'result']

class TutorExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorExperience
        fields = ['id', 'title', 'institution_or_platform', 'duration', 'description']

class TutorProfileListSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.full_name', read_only=True)
    profile_photo = serializers.SerializerMethodField()
    rating = serializers.FloatField(read_only=True)

    class Meta:
        model = TutorProfile
        fields = [
            'id', 'tutor_id', 'name', 'headline', 'gender', 'university', 'department',
            'city', 'area', 'expected_salary', 'experience_years', 'subjects', 'classes',
            'curriculums', 'preferred_locations', 'tutoring_types', 'rating',
            'total_reviews', 'is_verified', 'profile_photo', 'profile_completion_score'
        ]

    def get_profile_photo(self, obj):
        if obj.profile_photo_url:
            return obj.profile_photo_url
        if obj.user.profile_image:
            return obj.user.profile_image.url
        return None

class TutorProfileDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    name = serializers.CharField(source='user.full_name', read_only=True)
    education_records = TutorEducationSerializer(many=True, read_only=True)
    experience_records = TutorExperienceSerializer(many=True, read_only=True)
    profile_photo = serializers.SerializerMethodField()

    class Meta:
        model = TutorProfile
        fields = '__all__'

    def get_profile_photo(self, obj):
        if obj.profile_photo_url:
            return obj.profile_photo_url
        if obj.user.profile_image:
            return obj.user.profile_image.url
        return None
