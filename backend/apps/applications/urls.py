from django.urls import path
from .views import MyApplicationsListView, ApplyForJobView, JobApplicationsForJobView, MarkApplicationSeenView, SelectTutorForApplicationView, ApplicationDetailView

urlpatterns = [
    path('my/', MyApplicationsListView.as_view(), name='my-applications'),
    path('apply/', ApplyForJobView.as_view(), name='apply-for-job'),
    path('job/<str:job_id>/', JobApplicationsForJobView.as_view(), name='job-applications'),
    path('<uuid:pk>/seen/', MarkApplicationSeenView.as_view(), name='mark-application-seen'),
    path('<uuid:pk>/select/', SelectTutorForApplicationView.as_view(), name='select-job-application-tutor'),
    path('<uuid:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
]
