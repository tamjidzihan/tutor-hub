from rest_framework import serializers
from .models import City, Area

class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ['id', 'name', 'slug']

class CitySerializer(serializers.ModelSerializer):
    areas = AreaSerializer(many=True, read_only=True)

    class Meta:
        model = City
        fields = ['id', 'name', 'slug', 'areas']
