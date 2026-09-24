from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import TutorProfile
from .serializers import TutorProfileListSerializer, TutorProfileDetailSerializer
from .filters import TutorFilter
from apps.common.permissions import IsTutor

class TutorListView(generics.ListAPIView):
    queryset = TutorProfile.objects.filter(is_available=True).select_related('user')
    serializer_class = TutorProfileListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TutorFilter
    ordering_fields = ['rating', 'experience_years', 'expected_salary', 'created_at']
    ordering = ['-rating', '-is_verified', '-created_at']

class TutorDetailView(generics.RetrieveAPIView):
    queryset = TutorProfile.objects.all().select_related('user').prefetch_related('education_records', 'experience_records')
    serializer_class = TutorProfileDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'tutor_id'

class MyTutorProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = TutorProfileDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = TutorProfile.objects.get_or_create(
            user=self.request.user,
            defaults={
                'university': 'Dhaka University',
                'department': 'CSE',
                'city': 'Dhaka',
                'area': 'Mirpur'
            }
        )
        return profile
