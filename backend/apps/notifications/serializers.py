from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField()
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'link', 'is_read', 'created_at', 'time_ago', 'sender_name'
        ]
        read_only_fields = ['id', 'notification_type', 'title', 'message', 'link', 'created_at']

    def get_time_ago(self, obj):
        return obj.created_at.strftime("%b %d, %H:%M")

    def get_sender_name(self, obj):
        if obj.sender:
            return obj.sender.full_name or obj.sender.email
        return "TutorHub System"
