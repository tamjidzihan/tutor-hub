from rest_framework import generics, permissions
from .models import BlogPost, FAQItem, TeamMember, Career, GalleryItem
from .serializers import (
    BlogPostSerializer, FAQItemSerializer, TeamMemberSerializer,
    CareerSerializer, GalleryItemSerializer
)

class BlogPostListView(generics.ListAPIView):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    permission_classes = [permissions.AllowAny]

class BlogPostDetailView(generics.RetrieveAPIView):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

class FAQItemListView(generics.ListAPIView):
    serializer_class = FAQItemSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        category = self.request.query_params.get('category')
        if category:
            return FAQItem.objects.filter(category=category.upper())
        return FAQItem.objects.all()

class TeamMemberListView(generics.ListAPIView):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class CareerListView(generics.ListAPIView):
    queryset = Career.objects.filter(is_active=True)
    serializer_class = CareerSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class GalleryItemListView(generics.ListAPIView):
    queryset = GalleryItem.objects.all()
    serializer_class = GalleryItemSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None
