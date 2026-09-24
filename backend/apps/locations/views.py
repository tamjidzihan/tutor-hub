from rest_framework import generics, permissions
from .models import City, Area
from .serializers import CitySerializer, AreaSerializer

class CityListView(generics.ListAPIView):
    queryset = City.objects.filter(is_active=True).prefetch_related('areas')
    serializer_class = CitySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class AreaListView(generics.ListAPIView):
    serializer_class = AreaSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        city_slug = self.kwargs.get('city_slug')
        if city_slug:
            return Area.objects.filter(city__slug=city_slug, is_active=True)
        return Area.objects.filter(is_active=True)
