from django.urls import path
from .views import DashboardOverviewView, PlatformStatsView

urlpatterns = [
    path('', DashboardOverviewView.as_view(), name='dashboard-overview'),
    path('stats/', PlatformStatsView.as_view(), name='platform-stats'),
]
