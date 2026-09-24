from django.urls import path
from .views import AffiliateRegisterView, MyAffiliateStatsView

urlpatterns = [
    path('register/', AffiliateRegisterView.as_view(), name='affiliate-register'),
    path('my/', MyAffiliateStatsView.as_view(), name='affiliate-my'),
]
