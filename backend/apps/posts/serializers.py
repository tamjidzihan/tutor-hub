from rest_framework import serializers
from .models import Post, PostLike, Comment, PostReport

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()
    formatted_time = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'author', 'author_name', 'author_avatar',
            'author_role', 'content', 'created_at', 'formatted_time', 'is_mine'
        ]
        read_only_fields = ['id', 'author', 'created_at']

    def get_author_name(self, obj):
        return obj.author.full_name or obj.author.email

    def get_author_avatar(self, obj):
        if obj.author.profile_image:
            return obj.author.profile_image.url
        return None

    def get_author_role(self, obj):
        return obj.author.role

    def get_is_mine(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.author_id == request.user.id
        return False

    def get_formatted_time(self, obj):
        return obj.created_at.strftime("%b %d, %H:%M")

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()
    author_tutor_id = serializers.SerializerMethodField()
    category_label = serializers.CharField(source='get_category_display', read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()
    formatted_time = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'author_name', 'author_avatar', 'author_role',
            'author_tutor_id', 'content', 'category', 'category_label',
            'tags', 'image', 'likes_count', 'comments_count', 'is_pinned',
            'ai_summary', 'is_liked', 'is_mine', 'created_at',
            'formatted_time', 'comments'
        ]
        read_only_fields = [
            'id', 'author', 'likes_count', 'comments_count',
            'is_pinned', 'ai_summary', 'created_at'
        ]

    def get_author_name(self, obj):
        return obj.author.full_name or obj.author.email

    def get_author_avatar(self, obj):
        if obj.author.profile_image:
            return obj.author.profile_image.url
        return None

    def get_author_role(self, obj):
        return obj.author.role

    def get_author_tutor_id(self, obj):
        if hasattr(obj.author, 'tutor_profile'):
            return obj.author.tutor_profile.tutor_id
        return None

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PostLike.objects.filter(post=obj, user=request.user).exists()
        return False

    def get_is_mine(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.author_id == request.user.id
        return False

    def get_formatted_time(self, obj):
        return obj.created_at.strftime("%b %d, %H:%M")

class PostReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostReport
        fields = ['id', 'post', 'reporter', 'reason', 'status', 'created_at']
        read_only_fields = ['id', 'reporter', 'status', 'created_at']
