from django.urls import path
from .views import TuitionJobListView, TuitionJobDetailView

urlpatterns = [
    path('', TuitionJobListView.as_view(), name='job-list'),
    path('<str:job_id>/', TuitionJobDetailView.as_view(), name='job-detail'),
]
