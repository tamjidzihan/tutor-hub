from rest_framework import serializers
from .models import AffiliatePartner

class AffiliatePartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AffiliatePartner
        fields = '__all__'
        read_only_fields = ['id', 'referral_code', 'total_referrals', 'successful_matches', 'total_earnings', 'pending_payout', 'is_approved']

class AffiliateRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AffiliatePartner
        fields = ['name', 'phone', 'email', 'occupation', 'institution', 'payout_method', 'payout_account_number']
