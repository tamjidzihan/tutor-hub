from django.urls import path
from .views import TutorListView, TutorDetailView, MyTutorProfileView

urlpatterns = [
    path('', TutorListView.as_view(), name='tutor-list'),
    path('me/', MyTutorProfileView.as_view(), name='tutor-me'),
    path('<str:tutor_id>/', TutorDetailView.as_view(), name='tutor-detail'),
]
