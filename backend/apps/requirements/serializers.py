from rest_framework import serializers
from .models import TutorRequirement

class TutorRequirementSerializer(serializers.ModelSerializer):
    created_at_formatted = serializers.SerializerMethodField()

    class Meta:
        model = TutorRequirement
        fields = [
            'id', 'requirement_id', 'parent_name', 'phone', 'email',
            'student_name', 'student_gender', 'city', 'area', 'address',
            'curriculum', 'class_level', 'subjects', 'preferred_tutor_gender',
            'days_per_week', 'preferred_time', 'budget', 'additional_requirements',
            'status', 'selected_tutor_id', 'matched_tutors', 'created_at',
            'created_at_formatted'
        ]
        read_only_fields = ['id', 'requirement_id', 'created_at', 'created_at_formatted']

    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime("%b %d, %Y")
