from django.urls import path
from .views import MyApplicationsListView, ApplyForJobView, JobApplicationsForJobView, ApplicationDetailView

urlpatterns = [
    path('my/', MyApplicationsListView.as_view(), name='my-applications'),
    path('apply/', ApplyForJobView.as_view(), name='apply-for-job'),
    path('job/<str:job_id>/', JobApplicationsForJobView.as_view(), name='job-applications'),
    path('<uuid:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
]
