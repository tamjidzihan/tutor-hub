from django.contrib import admin
from .models import AffiliatePartner

@admin.register(AffiliatePartner)
class AffiliatePartnerAdmin(admin.ModelAdmin):
    list_display = ['name', 'referral_code', 'phone', 'total_referrals', 'total_earnings', 'pending_payout', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'payout_method']
    search_fields = ['name', 'referral_code', 'phone', 'email']
