from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import AffiliatePartner
from .serializers import AffiliatePartnerSerializer, AffiliateRegistrationSerializer

class AffiliateRegisterView(generics.CreateAPIView):
    serializer_class = AffiliateRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user if request.user.is_authenticated else None
        affiliate = serializer.save(user=user)
        return Response(AffiliatePartnerSerializer(affiliate).data, status=status.HTTP_201_CREATED)

class MyAffiliateStatsView(generics.RetrieveAPIView):
    serializer_class = AffiliatePartnerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        affiliate, _ = AffiliatePartner.objects.get_or_create(
            user=self.request.user,
            defaults={
                'name': self.request.user.full_name,
                'email': self.request.user.email,
                'phone': self.request.user.phone or '01700000000',
                'occupation': 'Ambassador',
                'institution': 'University Partner'
            }
        )
        return affiliate
