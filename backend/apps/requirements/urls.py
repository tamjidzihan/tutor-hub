from django.urls import path
from .views import TutorRequirementListCreateView, TutorRequirementDetailView, SelectTutorView

urlpatterns = [
    path('', TutorRequirementListCreateView.as_view(), name='requirement-list-create'),
    path('<str:requirement_id>/', TutorRequirementDetailView.as_view(), name='requirement-detail'),
    path('<str:requirement_id>/select-tutor/', SelectTutorView.as_view(), name='select-tutor'),
]
