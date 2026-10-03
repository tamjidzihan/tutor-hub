from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    guardian_name = serializers.CharField(source='student_name', required=False)

    class Meta:
        model = Review
        fields = [
            'id', 'tutor', 'student', 'student_name', 'guardian_name',
            'student_class', 'rating', 'comment', 'is_verified_student',
            'ai_sentiment', 'ai_summary', 'ai_strengths', 'date'
        ]
        read_only_fields = [
            'id', 'student', 'is_verified_student',
            'ai_sentiment', 'ai_summary', 'ai_strengths', 'date'
        ]

    def get_date(self, obj):
        return obj.created_at.strftime("%b %Y")

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate(self, attrs):
        user = self.context['request'].user
        tutor = attrs.get('tutor')
        if tutor and tutor.user == user:
            raise serializers.ValidationError("You cannot review your own tutor profile.")
        return attrs
