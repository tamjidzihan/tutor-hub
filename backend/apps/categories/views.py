from rest_framework import generics, permissions
from .models import ServiceCategory
from .serializers import ServiceCategorySerializer

class ServiceCategoryListView(generics.ListAPIView):
    queryset = ServiceCategory.objects.all().prefetch_related('subcategories')
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class ServiceCategoryDetailView(generics.RetrieveAPIView):
    queryset = ServiceCategory.objects.all().prefetch_related('subcategories')
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
