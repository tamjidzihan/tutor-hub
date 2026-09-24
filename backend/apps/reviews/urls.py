from django.urls import path
from .views import ReviewListCreateView

urlpatterns = [
    path('', ReviewListCreateView.as_view(), name='review-list-create'),
    path('tutor/<str:tutor_id>/', ReviewListCreateView.as_view(), name='tutor-reviews'),
]
