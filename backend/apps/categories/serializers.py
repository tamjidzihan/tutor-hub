from rest_framework import serializers
from .models import ServiceCategory, SubCategory

class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ['id', 'name', 'slug', 'description']

class ServiceCategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)

    class Meta:
        model = ServiceCategory
        fields = [
            'id', 'name', 'slug', 'icon_name', 'description', 
            'hero_image', 'features', 'tutor_count', 'is_popular', 
            'display_order', 'subcategories'
        ]
