from rest_framework import serializers
from .models import BlogPost, FAQItem, TeamMember, Career, GalleryItem

class BlogPostSerializer(serializers.ModelSerializer):
    published_date = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = '__all__'

    def get_published_date(self, obj):
        return obj.created_at.strftime("%b %d, %Y")

class FAQItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQItem
        fields = '__all__'

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = '__all__'

class CareerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Career
        fields = '__all__'

class GalleryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryItem
        fields = '__all__'
