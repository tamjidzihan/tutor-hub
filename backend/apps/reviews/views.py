from rest_framework import generics, permissions
from .models import Review
from .serializers import ReviewSerializer

class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        tutor_id = self.kwargs.get('tutor_id')
        if tutor_id:
            return Review.objects.filter(tutor__tutor_id=tutor_id)
        return Review.objects.all()

    def perform_create(self, serializer):
        guardian = self.request.user if self.request.user.is_authenticated else None
        serializer.save(guardian=guardian)
