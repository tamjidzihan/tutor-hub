from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'tutor', 'guardian_name', 'student_class', 'rating', 'comment', 'is_verified_guardian', 'date']
        read_only_fields = ['id', 'is_verified_guardian', 'date']

    def get_date(self, obj):
        return obj.created_at.strftime("%b %Y")
