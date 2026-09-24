import random
from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel, UUIDModel

def generate_referral_code():
    chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return 'TH-' + ''.join(random.choices(chars, k=6))

class AffiliatePartner(TimeStampedModel, UUIDModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='affiliate_profile',
        null=True,
        blank=True
    )
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    occupation = models.CharField(max_length=150, default='Student Ambassador')
    institution = models.CharField(max_length=200, default='BUET')
    
    referral_code = models.CharField(max_length=30, unique=True, default=generate_referral_code)
    total_referrals = models.PositiveIntegerField(default=0)
    successful_matches = models.PositiveIntegerField(default=0)
    commission_rate = models.PositiveIntegerField(default=10, help_text="Commission percentage %")
    total_earnings = models.PositiveIntegerField(default=0)
    pending_payout = models.PositiveIntegerField(default=0)
    
    payout_method = models.CharField(max_length=50, default='bKash')
    payout_account_number = models.CharField(max_length=50, blank=True)
    is_approved = models.BooleanField(default=True)

    class Meta:
        ordering = ['-total_earnings', '-created_at']

    def __str__(self):
        return f"{self.name} ({self.referral_code}) - ৳{self.total_earnings}"
