from rest_framework import serializers
from .models import Conversation, Message

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_role = serializers.SerializerMethodField()
    sender_avatar = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()
    formatted_time = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_name',
            'sender_role', 'sender_avatar', 'content', 'is_read',
            'created_at', 'formatted_time', 'is_mine'
        ]
        read_only_fields = ['id', 'conversation', 'sender', 'is_read', 'created_at']

    def get_sender_name(self, obj):
        return obj.sender.full_name or obj.sender.email

    def get_sender_role(self, obj):
        return obj.sender.role

    def get_sender_avatar(self, obj):
        if obj.sender.profile_image:
            return obj.sender.profile_image.url
        return None

    def get_is_mine(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.sender_id == request.user.id
        return False

    def get_formatted_time(self, obj):
        return obj.created_at.strftime("%I:%M %p")

class ConversationSerializer(serializers.ModelSerializer):
    other_participant = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'student', 'tutor', 'other_participant',
            'last_message', 'unread_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_other_participant(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        current_user = request.user
        other = obj.tutor if current_user == obj.student else obj.student
        return {
            'id': str(other.id),
            'name': other.full_name or other.email,
            'email': other.email,
            'role': other.role,
            'avatar': other.profile_image.url if other.profile_image else None
        }

    def get_last_message(self, obj):
        last = obj.messages.order_by('-created_at').first()
        if last:
            return {
                'content': last.content,
                'created_at': last.created_at.isoformat(),
                'sender_id': str(last.sender_id),
                'is_read': last.is_read
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
