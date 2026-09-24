from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import JobApplication
from .serializers import JobApplicationSerializer, JobApplicationCreateSerializer

class MyApplicationsListView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(tutor_user=self.request.user).select_related('job', 'tutor_user')

class ApplyForJobView(generics.CreateAPIView):
    serializer_class = JobApplicationCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(tutor_user=self.request.user)

class JobApplicationsForJobView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        return JobApplication.objects.filter(job__job_id=job_id).select_related('job', 'tutor_user')

class ApplicationDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return JobApplication.objects.all()
        return JobApplication.objects.filter(tutor_user=self.request.user)

