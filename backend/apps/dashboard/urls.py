from django.urls import path
from .views import AdminManagementView, DashboardOverviewView, PlatformStatsView

urlpatterns = [
    path('', DashboardOverviewView.as_view(), name='dashboard-overview'),
    path('stats/', PlatformStatsView.as_view(), name='platform-stats'),
    path('admin/', AdminManagementView.as_view(), name='admin-management'),
    path('admin/<str:resource>/<str:identifier>/', AdminManagementView.as_view(), name='admin-management-item'),
]
