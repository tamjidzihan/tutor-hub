from rest_framework import generics, permissions
from .models import Testimonial
from .serializers import TestimonialSerializer

class TestimonialListView(generics.ListAPIView):
    serializer_class = TestimonialSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        user_type = self.request.query_params.get('type')
        if user_type:
            return Testimonial.objects.filter(type=user_type.upper(), is_featured=True)
        return Testimonial.objects.filter(is_featured=True)
