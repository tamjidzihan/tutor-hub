from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from apps.tutors.models import TutorProfile
from apps.tuition_jobs.models import TuitionJob
from apps.requirements.models import TutorRequirement
from apps.applications.models import JobApplication
from apps.applications.serializers import JobApplicationSerializer
from apps.requirements.serializers import TutorRequirementSerializer

User = get_user_model()

class PlatformStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_tutors = TutorProfile.objects.count()
        live_jobs = TuitionJob.objects.filter(status=TuitionJob.Status.AVAILABLE).count()
        total_requirements = TutorRequirement.objects.count()
        verified_teachers = TutorProfile.objects.filter(is_verified=True).count()

        return Response({
            'registeredTutors': total_tutors,
            'liveTuitionJobs': live_jobs,
            'happyParents': total_requirements,
            'verifiedTeachers': verified_teachers,
            'satisfactionRate': None,
            'avgResponseHours': None,
        })


class DashboardOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.is_staff or user.role == User.Role.ADMIN:
            return Response(self._admin_overview())
        if user.role == User.Role.TUTOR:
            return Response(self._tutor_overview(user))
        return Response(self._learner_overview(user))

    def _admin_overview(self):
        applications = JobApplication.objects.all()
        requirements = TutorRequirement.objects.all()
        return {
            'role': User.Role.ADMIN,
            'stats': {
                'total_users': User.objects.count(),
                'total_tutors': User.objects.filter(role=User.Role.TUTOR).count(),
                'total_parents': User.objects.filter(role=User.Role.PARENT).count(),
                'total_students': User.objects.filter(role=User.Role.STUDENT).count(),
                'total_jobs': TuitionJob.objects.count(),
                'active_jobs': TuitionJob.objects.filter(status=TuitionJob.Status.AVAILABLE).count(),
                'total_applications': applications.count(),
                'pending_applications': applications.filter(status=JobApplication.Status.APPLIED).count(),
                'total_requirements': requirements.count(),
                'active_requirements': requirements.exclude(status=TutorRequirement.Status.CANCELLED).count(),
            },
            'recent_tutors': list(
                TutorProfile.objects.select_related('user').order_by('-created_at').values(
                    'id', 'tutor_id', 'user__first_name', 'user__last_name', 'is_verified',
                    'verification_status', 'created_at'
                )[:10]
            ),
        }

    def _tutor_overview(self, user):
        applications = JobApplication.objects.filter(tutor_user=user)
        profile = TutorProfile.objects.filter(user=user).first()
        return {
            'role': User.Role.TUTOR,
            'stats': {
                'total_applications': applications.count(),
                'pending_applications': applications.filter(status=JobApplication.Status.APPLIED).count(),
                'shortlisted_applications': applications.filter(status=JobApplication.Status.SHORTLISTED).count(),
                'selected_applications': applications.filter(status=JobApplication.Status.SELECTED).count(),
                'available_jobs': TuitionJob.objects.filter(status=TuitionJob.Status.AVAILABLE).count(),
                'profile_completion': profile.profile_completion_score if profile else 0,
                'rating': float(profile.rating) if profile else None,
                'total_reviews': profile.total_reviews if profile else 0,
                'completed_tuitions': profile.total_tuitions_completed if profile else 0,
            },
            'recent_applications': JobApplicationSerializer(
                applications.select_related('job', 'tutor_user')[:5], many=True
            ).data,
        }

    def _learner_overview(self, user):
        requirements = TutorRequirement.objects.filter(user=user)
        job_applications = JobApplication.objects.filter(job__parent=user)
        return {
            'role': user.role,
            'stats': {
                'total_requirements': requirements.count(),
                'active_requirements': requirements.exclude(status=TutorRequirement.Status.CANCELLED).count(),
                'pending_requirements': requirements.filter(status=TutorRequirement.Status.PENDING).count(),
                'matched_requirements': requirements.filter(status=TutorRequirement.Status.MATCHED).count(),
                'selected_requirements': requirements.filter(status=TutorRequirement.Status.TUTOR_SELECTED).count(),
                'applications_received': job_applications.count(),
            },
            'requirements': TutorRequirementSerializer(
                requirements[:10], many=True
            ).data,
        }
