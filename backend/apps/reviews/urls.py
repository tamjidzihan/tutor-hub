from django.urls import path
from .views import ReviewListCreateView, TutorReviewsOverviewView, ReviewDetailView

urlpatterns = [
    path('', ReviewListCreateView.as_view(), name='review-list-create'),
    path('<uuid:pk>/', ReviewDetailView.as_view(), name='review-detail'),
    path('tutor/<str:tutor_id>/', TutorReviewsOverviewView.as_view(), name='tutor-reviews-overview'),
]
