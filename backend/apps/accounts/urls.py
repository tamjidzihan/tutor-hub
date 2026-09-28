from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, MeView, SwitchRoleView, AvatarUploadView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('avatar/', AvatarUploadView.as_view(), name='auth-avatar'),
    path('switch-role/', SwitchRoleView.as_view(), name='auth-switch-role'),
]
