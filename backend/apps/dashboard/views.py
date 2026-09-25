from datetime import timedelta
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from apps.tutors.models import TutorProfile
from apps.tuition_jobs.models import TuitionJob
from apps.requirements.models import TutorRequirement
from apps.applications.models import JobApplication
from apps.applications.serializers import JobApplicationSerializer
from apps.requirements.serializers import TutorRequirementSerializer
from apps.common.permissions import IsAdminUserRole

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
        today = timezone.localdate()
        start_date = today - timedelta(days=6)
        dates = [start_date + timedelta(days=offset) for offset in range(7)]

        def daily_counts(queryset, field):
            grouped = {
                item['day']: item['total']
                for item in queryset.filter(**{f'{field}__date__gte': start_date})
                .annotate(day=TruncDate(field))
                .values('day')
                .annotate(total=Count('id'))
            }
            return [{'date': date.isoformat(), 'count': grouped.get(date, 0)} for date in dates]

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
            'analytics': {
                'users': daily_counts(User.objects.all(), 'date_joined'),
                'jobs': daily_counts(TuitionJob.objects.all(), 'created_at'),
                'requirements': daily_counts(TutorRequirement.objects.all(), 'created_at'),
                'applications': daily_counts(JobApplication.objects.all(), 'created_at'),
            },
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


class AdminManagementView(APIView):
    permission_classes = [IsAdminUserRole]
    resources = {'users', 'tutors', 'jobs', 'requirements', 'applications'}

    def get(self, request):
        resource = request.query_params.get('resource', 'users')
        if resource not in self.resources:
            return Response({'detail': 'Unsupported admin resource.'}, status=400)

        queryset = self._queryset(resource)
        search = request.query_params.get('search', '').strip()
        status_filter = request.query_params.get('status', '').strip()
        role = request.query_params.get('role', '').strip()

        if search:
            search_filters = {
                'users': Q(email__icontains=search) | Q(first_name__icontains=search) | Q(last_name__icontains=search),
                'tutors': Q(tutor_id__icontains=search) | Q(user__email__icontains=search) | Q(user__first_name__icontains=search) | Q(user__last_name__icontains=search),
                'jobs': Q(job_id__icontains=search) | Q(title__icontains=search) | Q(city__icontains=search),
                'requirements': Q(requirement_id__icontains=search) | Q(student_name__icontains=search) | Q(parent_name__icontains=search),
                'applications': Q(job__job_id__icontains=search) | Q(job__title__icontains=search) | Q(tutor_user__email__icontains=search),
            }
            queryset = queryset.filter(search_filters[resource])
        if status_filter and resource in {'tutors', 'jobs', 'requirements', 'applications'}:
            queryset = queryset.filter(**{'verification_status' if resource == 'tutors' else 'status': status_filter})
        if role and resource == 'users':
            queryset = queryset.filter(role=role)

        try:
            page = max(1, int(request.query_params.get('page', 1)))
            page_size = min(50, max(1, int(request.query_params.get('page_size', 10))))
        except ValueError:
            page, page_size = 1, 10

        total = queryset.count()
        start = (page - 1) * page_size
        results = [self._serialize(resource, item) for item in queryset[start:start + page_size]]
        total_pages = (total + page_size - 1) // page_size
        return Response({
            'resource': resource,
            'count': total,
            'total_pages': total_pages,
            'current_page': page,
            'results': results,
        })

    def patch(self, request, resource, identifier):
        if resource not in self.resources:
            return Response({'detail': 'Unsupported admin resource.'}, status=400)
        item = self._get_item(resource, identifier)
        action = request.data.get('action')

        if resource == 'users' and action in {'set_active', 'set_verified'}:
            field = 'is_active' if action == 'set_active' else 'is_verified'
            setattr(item, field, bool(request.data.get('value')))
            item.save(update_fields=[field])
        elif resource == 'tutors' and action in {'verify', 'reject', 'toggle_available'}:
            if action == 'verify':
                item.is_verified = True
                item.verification_status = TutorProfile.VerificationStatus.VERIFIED
                item.save(update_fields=['is_verified', 'verification_status'])
            elif action == 'reject':
                item.is_verified = False
                item.verification_status = TutorProfile.VerificationStatus.REJECTED
                item.save(update_fields=['is_verified', 'verification_status'])
            else:
                item.is_available = not item.is_available
                item.save(update_fields=['is_available'])
        elif resource in {'jobs', 'requirements', 'applications'} and action == 'set_status':
            allowed = {
                'jobs': {choice.value for choice in TuitionJob.Status},
                'requirements': {choice.value for choice in TutorRequirement.Status},
                'applications': {choice.value for choice in JobApplication.Status},
            }[resource]
            value = request.data.get('value')
            if value not in allowed:
                return Response({'detail': 'Invalid status for this resource.'}, status=400)
            item.status = value
            item.save(update_fields=['status', 'updated_at'] if hasattr(item, 'updated_at') else ['status'])
        else:
            return Response({'detail': 'Unsupported admin action.'}, status=400)

        return Response({'detail': 'Admin action completed.', 'item': self._serialize(resource, item)})

    def _queryset(self, resource):
        return {
            'users': User.objects.all(),
            'tutors': TutorProfile.objects.select_related('user'),
            'jobs': TuitionJob.objects.select_related('parent'),
            'requirements': TutorRequirement.objects.select_related('user'),
            'applications': JobApplication.objects.select_related('job', 'tutor_user'),
        }[resource]

    def _get_item(self, resource, identifier):
        lookups = {
            'users': {'id': identifier},
            'tutors': {'tutor_id': identifier},
            'jobs': {'job_id': identifier},
            'requirements': {'requirement_id': identifier},
            'applications': {'id': identifier},
        }
        from django.shortcuts import get_object_or_404
        return get_object_or_404(self._queryset(resource), **lookups[resource])

    def _serialize(self, resource, item):
        if resource == 'users':
            return {'id': str(item.id), 'name': item.full_name, 'email': item.email, 'role': item.role, 'is_active': item.is_active, 'is_verified': item.is_verified, 'date_joined': item.date_joined}
        if resource == 'tutors':
            return {'id': str(item.id), 'tutor_id': item.tutor_id, 'name': item.user.full_name, 'email': item.user.email, 'university': item.university, 'city': item.city, 'is_verified': item.is_verified, 'verification_status': item.verification_status, 'is_available': item.is_available, 'created_at': item.created_at}
        if resource == 'jobs':
            return {'id': str(item.id), 'job_id': item.job_id, 'title': item.title, 'status': item.status, 'parent_name': item.parent.full_name if item.parent else 'Unassigned', 'city': item.city, 'area': item.area, 'applications_count': item.applications_count, 'created_at': item.created_at}
        if resource == 'requirements':
            return {'id': str(item.id), 'requirement_id': item.requirement_id, 'student_name': item.student_name, 'parent_name': item.parent_name, 'status': item.status, 'city': item.city, 'area': item.area, 'budget': item.budget, 'created_at': item.created_at}
        return {'id': str(item.id), 'job_id': item.job.job_id, 'job_title': item.job.title, 'tutor_name': item.tutor_user.full_name, 'tutor_email': item.tutor_user.email, 'status': item.status, 'expected_salary': item.expected_salary, 'created_at': item.created_at}

