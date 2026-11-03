from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import JobApplication
from .serializers import JobApplicationSerializer, JobApplicationCreateSerializer
from apps.common.permissions import IsTutor
from apps.notifications.services import create_notification
from apps.tuition_jobs.models import TuitionJob

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
                link=f"/dashboard/jobs/{job.job_id}/applications?application_id={application.id}"
            )

class JobApplicationsForJobView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        queryset = JobApplication.objects.filter(job__job_id=job_id).select_related('job', 'tutor_user', 'tutor_user__tutor_profile')
        if self.request.user.is_staff or self.request.user.role == 'ADMIN':
            return queryset
        return queryset.filter(job__student=self.request.user)

class MarkApplicationSeenView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        application = JobApplication.objects.filter(
            pk=pk,
            job__student=request.user,
        ).first()
        if not application:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

        if not application.seen_by_student:
            application.seen_by_student = True
            application.save(update_fields=['seen_by_student'])
        return Response({'success': True, 'id': str(application.id), 'seen_by_student': True})

class SelectTutorForApplicationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        application = JobApplication.objects.filter(pk=pk, job__student=request.user).select_related('job', 'tutor_user').first()
        if not application:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

        application.status = JobApplication.Status.SELECTED
        application.save(update_fields=['status'])

        job = application.job
        job.status = TuitionJob.Status.APPOINTED
        job.save(update_fields=['status'])

        JobApplication.objects.filter(job=job).exclude(pk=application.pk).update(status=JobApplication.Status.REJECTED)

        create_notification(
            recipient=application.tutor_user,
            sender=request.user,
            notification_type='APPLICATION',
            title=f"Selected for {job.title}",
            message=f"{request.user.full_name or request.user.email} selected you as the tutor for this job.",
            link=f"/dashboard/applications"
        )

        create_notification(
            recipient=request.user,
            sender=application.tutor_user,
            notification_type='APPLICATION',
            title=f"Tutor selected for {job.title}",
            message=f"{application.tutor_user.full_name or application.tutor_user.email} has been selected for this tuition job.",
            link=f"/dashboard/jobs/{job.job_id}/applications?application_id={application.id}"
        )

        return Response({
            'success': True,
            'message': f"{application.tutor_user.full_name or application.tutor_user.email} selected for {job.title}.",
            'application': JobApplicationSerializer(application, context={'request': request}).data
        })

class ApplicationDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return JobApplication.objects.all()
        return JobApplication.objects.filter(tutor_user=self.request.user)
