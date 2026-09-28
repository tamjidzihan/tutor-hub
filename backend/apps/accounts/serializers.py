from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.image_utils import optimize_profile_image

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone',
            'role', 'profile_image', 'is_verified', 'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'is_verified', 'date_joined']

    def validate_profile_image(self, value):
        if value:
            return optimize_profile_image(value)
        return value

    def update(self, instance, validated_data):
        user = super().update(instance, validated_data)
        if 'profile_image' in validated_data and user.role == User.Role.TUTOR:
            from apps.tutors.models import TutorProfile
            tutor_profile = TutorProfile.objects.filter(user=user).first()
            if tutor_profile:
                if user.profile_image:
                    tutor_profile.profile_photo_url = user.profile_image.url
                else:
                    tutor_profile.profile_photo_url = ''
                tutor_profile.save(update_fields=['profile_photo_url'])
        return user

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone', 'role']

    def validate_role(self, value):
        if value == User.Role.ADMIN:
            raise serializers.ValidationError('Administrator accounts must be created by an administrator.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        if user.role == User.Role.TUTOR:
            from apps.tutors.models import TutorProfile
            TutorProfile.objects.get_or_create(
                user=user,
                defaults={
                    'university': '',
                    'department': '',
                    'city': 'Dhaka',
                    'area': 'Mirpur'
                }
            )
        return user

class LoginResponseSerializer(serializers.Serializer):
    user = UserSerializer()
    access = serializers.CharField()
    refresh = serializers.CharField()
