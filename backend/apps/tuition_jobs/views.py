from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import TuitionJob
from .serializers import TuitionJobListSerializer, TuitionJobDetailSerializer
from .filters import TuitionJobFilter

class TuitionJobListView(generics.ListCreateAPIView):
    queryset = TuitionJob.objects.all()
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TuitionJobFilter
    ordering_fields = ['salary', 'created_at', 'views_count']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TuitionJobDetailSerializer
        return TuitionJobListSerializer

    def perform_create(self, serializer):
        parent = self.request.user if self.request.user.is_authenticated else None
        serializer.save(parent=parent)

class TuitionJobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TuitionJob.objects.all()
    serializer_class = TuitionJobDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'job_id'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
