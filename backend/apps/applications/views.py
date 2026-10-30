from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import JobApplication
from .serializers import JobApplicationSerializer, JobApplicationCreateSerializer
from apps.common.permissions import IsTutor
from apps.notifications.services import create_notification

class OnlyTutorCanApply(IsTutor):
    message = "Only tutor can apply for a job."

class MyApplicationsListView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(tutor_user=self.request.user).select_related('job', 'tutor_user')

class ApplyForJobView(generics.CreateAPIView):
    serializer_class = JobApplicationCreateSerializer
    permission_classes = [permissions.IsAuthenticated, OnlyTutorCanApply]

    def perform_create(self, serializer):
        application = serializer.save(tutor_user=self.request.user)
        # Notify job poster (student/admin) when a tutor applies
        job = application.job
        if job.student:
            create_notification(
                recipient=job.student,
                sender=self.request.user,
                notification_type='APPLICATION',
                title=f"New application for {job.title}",
                message=f"{self.request.user.full_name or self.request.user.email} applied to your tuition job.",
                link=f"/dashboard/applications"
            )

class JobApplicationsForJobView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        queryset = JobApplication.objects.filter(job__job_id=job_id).select_related('job', 'tutor_user')
        if self.request.user.is_staff or self.request.user.role == 'ADMIN':
            return queryset
        return queryset.filter(job__parent=self.request.user)

class ApplicationDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return JobApplication.objects.all()
        return JobApplication.objects.filter(tutor_user=self.request.user)

