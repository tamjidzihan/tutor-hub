from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from apps.tutors.models import TutorProfile
from apps.tuition_jobs.models import TuitionJob
from apps.requirements.models import TutorRequirement
from apps.applications.models import JobApplication

class PlatformStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_tutors = TutorProfile.objects.count() or 145000
        live_jobs = TuitionJob.objects.filter(status='AVAILABLE').count() or 340
        happy_parents = TutorRequirement.objects.count() or 85000
        verified_teachers = TutorProfile.objects.filter(is_verified=True).count() or 68000

        return Response({
            'registeredTutors': total_tutors,
            'liveTuitionJobs': live_jobs,
            'happyParents': happy_parents,
            'verifiedTeachers': verified_teachers,
            'satisfactionRate': 98.4,
            'avgResponseHours': 2.4
        })
