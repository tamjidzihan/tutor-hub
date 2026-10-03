from django.urls import path
from .views import AIStatusView, AIRecommendTutorsView, AISummarizeTutorReviewsView

urlpatterns = [
    path('status/', AIStatusView.as_view(), name='ai-status'),
    path('recommend-tutors/', AIRecommendTutorsView.as_view(), name='ai-recommend-tutors'),
    path('summarize-tutor-reviews/', AISummarizeTutorReviewsView.as_view(), name='ai-summarize-tutor-reviews'),
]
