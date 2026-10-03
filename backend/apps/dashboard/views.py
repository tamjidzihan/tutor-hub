from datetime import timedelta
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
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

        avg_rating = TutorProfile.objects.filter(total_reviews__gt=0).aggregate(avg=Avg('rating'))['avg']
        satisfaction_rate = round(float(avg_rating) * 20, 1) if avg_rating is not None else None

        return Response({
            'registeredTutors': total_tutors,
            'liveTuitionJobs': live_jobs,
            'happyParents': total_requirements,
            'verifiedTeachers': verified_teachers,
            'satisfactionRate': satisfaction_rate,
            'avgResponseHours': 2.5,
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
        jobs = TuitionJob.objects.all()
        tutors = TutorProfile.objects.all()
        users = User.objects.all()

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
                'total_users': users.count(),
                'total_tutors': users.filter(role=User.Role.TUTOR).count(),
                'total_students': users.filter(role=User.Role.STUDENT).count(),
                'total_admins': users.filter(role=User.Role.ADMIN).count(),
                
                'total_jobs': jobs.count(),
                'active_jobs': jobs.filter(status=TuitionJob.Status.AVAILABLE).count(),
                'shortlisted_jobs': jobs.filter(status=TuitionJob.Status.SHORTLISTED).count(),
                'appointed_jobs': jobs.filter(status=TuitionJob.Status.APPOINTED).count(),
                'cancelled_jobs': jobs.filter(status=TuitionJob.Status.CANCELLED).count(),
                
                'total_requirements': requirements.count(),
                'active_requirements': requirements.exclude(status=TutorRequirement.Status.CANCELLED).count(),
                'pending_requirements': requirements.filter(status=TutorRequirement.Status.PENDING).count(),
                'matched_requirements': requirements.filter(status=TutorRequirement.Status.MATCHED).count(),
                'selected_requirements': requirements.filter(status=TutorRequirement.Status.TUTOR_SELECTED).count(),
                'completed_requirements': requirements.filter(status=TutorRequirement.Status.COMPLETED).count(),
                
                'total_applications': applications.count(),
                'pending_applications': applications.filter(status=JobApplication.Status.APPLIED).count(),
                'shortlisted_applications': applications.filter(status=JobApplication.Status.SHORTLISTED).count(),
                'selected_applications': applications.filter(status=JobApplication.Status.SELECTED).count(),
                'rejected_applications': applications.filter(status=JobApplication.Status.REJECTED).count(),
                
                'verified_tutors': tutors.filter(is_verified=True).count(),
                'pending_tutors': tutors.filter(verification_status=TutorProfile.VerificationStatus.PENDING).count(),
                'rejected_tutors': tutors.filter(verification_status=TutorProfile.VerificationStatus.REJECTED).count(),
            },
            'distributions': {
                'roles': [
                    {'name': 'Tutors', 'count': users.filter(role=User.Role.TUTOR).count(), 'color': '#0284c7'},
                    {'name': 'Students', 'count': users.filter(role=User.Role.STUDENT).count(), 'color': '#10b981'},
                    {'name': 'Admins', 'count': users.filter(role=User.Role.ADMIN).count(), 'color': '#ef4444'},
                ],
                'jobs': [
                    {'status': 'Available', 'count': jobs.filter(status=TuitionJob.Status.AVAILABLE).count()},
                    {'status': 'Shortlisted', 'count': jobs.filter(status=TuitionJob.Status.SHORTLISTED).count()},
                    {'status': 'Appointed', 'count': jobs.filter(status=TuitionJob.Status.APPOINTED).count()},
                    {'status': 'Cancelled', 'count': jobs.filter(status=TuitionJob.Status.CANCELLED).count()},
                ],
                'requirements': [
                    {'status': 'Pending', 'count': requirements.filter(status=TutorRequirement.Status.PENDING).count()},
                    {'status': 'Matched', 'count': requirements.filter(status=TutorRequirement.Status.MATCHED).count()},
                    {'status': 'Selected', 'count': requirements.filter(status=TutorRequirement.Status.TUTOR_SELECTED).count()},
                    {'status': 'Completed', 'count': requirements.filter(status=TutorRequirement.Status.COMPLETED).count()},
                    {'status': 'Cancelled', 'count': requirements.filter(status=TutorRequirement.Status.CANCELLED).count()},
                ],
                'tutors': [
                    {'status': 'Verified', 'count': tutors.filter(is_verified=True).count()},
                    {'status': 'Pending Review', 'count': tutors.filter(verification_status=TutorProfile.VerificationStatus.PENDING).count()},
                    {'status': 'Rejected', 'count': tutors.filter(verification_status=TutorProfile.VerificationStatus.REJECTED).count()},
                ]
            },
            'recent_activity': {
                'users': list(
                    users.order_by('-date_joined').values('id', 'email', 'first_name', 'last_name', 'role', 'date_joined')[:5]
                ),
                'jobs': list(
                    jobs.order_by('-created_at').values('id', 'job_id', 'title', 'city', 'area', 'salary', 'status', 'created_at')[:5]
                ),
                'requirements': list(
                    requirements.order_by('-created_at').values('id', 'requirement_id', 'student_name', 'parent_name', 'city', 'budget', 'status', 'created_at')[:5]
                ),
                'applications': list(
                    applications.select_related('job', 'tutor_user').order_by('-created_at').values(
                        'id', 'job__job_id', 'job__title', 'tutor_user__first_name', 'tutor_user__last_name', 'tutor_user__email', 'expected_salary', 'status', 'created_at'
                    )[:5]
                ),
            },
            'analytics': {
                'users': daily_counts(users, 'date_joined'),
                'jobs': daily_counts(jobs, 'created_at'),
                'requirements': daily_counts(requirements, 'created_at'),
                'applications': daily_counts(applications, 'created_at'),
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
                'rating': float(profile.rating) if (profile and profile.total_reviews > 0) else None,
                'total_reviews': profile.total_reviews if profile else 0,
                'completed_tuitions': profile.total_tuitions_completed if profile else 0,
                'tutor_id': profile.tutor_id if profile else None,
                'is_verified': profile.is_verified if profile else False,
                'is_available': profile.is_available if profile else True,
            },
            'profile': {
                'tutor_id': profile.tutor_id,
                'headline': profile.headline,
                'university': profile.university,
                'department': profile.department,
                'degree_title': profile.degree_title,
                'passing_year': profile.passing_year,
                'cgpa': profile.cgpa,
                'city': profile.city,
                'area': profile.area,
                'expected_salary': profile.expected_salary,
                'experience_years': profile.experience_years,
                'subjects': profile.subjects,
                'classes': profile.classes,
                'curriculums': profile.curriculums,
                'preferred_locations': profile.preferred_locations,
                'tutoring_types': profile.tutoring_types,
                'is_verified': profile.is_verified,
                'is_available': profile.is_available,
            } if profile else None,
            'recent_applications': JobApplicationSerializer(
                applications.select_related('job', 'tutor_user')[:10], many=True
            ).data,
        }

    def _learner_overview(self, user):
        requirements = TutorRequirement.objects.filter(user=user)
        job_applications = JobApplication.objects.filter(job__student=user)
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

    def get(self, request, resource=None, identifier=None):
        if identifier:
            target_resource = resource or request.query_params.get('resource', 'users')
            if target_resource not in self.resources:
                return Response({'detail': 'Unsupported admin resource.'}, status=status.HTTP_400_BAD_REQUEST)
            item = self._get_item(target_resource, identifier)
            return Response(self._serialize(target_resource, item))

        res = resource or request.query_params.get('resource', 'users')
        if res not in self.resources:
            return Response({'detail': 'Unsupported admin resource.'}, status=status.HTTP_400_BAD_REQUEST)

        queryset = self._queryset(res)
        search = request.query_params.get('search', '').strip()
        status_filter = request.query_params.get('status', '').strip()
        role = request.query_params.get('role', '').strip()

        if search:
            search_filters = {
                'users': Q(email__icontains=search) | Q(first_name__icontains=search) | Q(last_name__icontains=search) | Q(phone__icontains=search),
                'tutors': Q(tutor_id__icontains=search) | Q(user__email__icontains=search) | Q(user__first_name__icontains=search) | Q(user__last_name__icontains=search) | Q(university__icontains=search) | Q(city__icontains=search) | Q(area__icontains=search),
                'jobs': Q(job_id__icontains=search) | Q(title__icontains=search) | Q(city__icontains=search) | Q(area__icontains=search) | Q(class_level__icontains=search),
                'requirements': Q(requirement_id__icontains=search) | Q(student_name__icontains=search) | Q(parent_name__icontains=search) | Q(phone__icontains=search) | Q(city__icontains=search) | Q(area__icontains=search),
                'applications': Q(job__job_id__icontains=search) | Q(job__title__icontains=search) | Q(tutor_user__email__icontains=search) | Q(tutor_user__first_name__icontains=search) | Q(tutor_user__last_name__icontains=search),
            }
            queryset = queryset.filter(search_filters[res])
        if status_filter and res in {'tutors', 'jobs', 'requirements', 'applications'}:
            queryset = queryset.filter(**{'verification_status' if res == 'tutors' else 'status': status_filter})
        if role and res == 'users':
            queryset = queryset.filter(role=role)

        try:
            page = max(1, int(request.query_params.get('page', 1)))
            page_size = min(50, max(1, int(request.query_params.get('page_size', 10))))
        except ValueError:
            page, page_size = 1, 10

        total = queryset.count()
        start = (page - 1) * page_size
        results = [self._serialize(res, item) for item in queryset[start:start + page_size]]
        total_pages = (total + page_size - 1) // page_size
        return Response({
            'resource': res,
            'count': total,
            'total_pages': total_pages,
            'current_page': page,
            'results': results,
        })

    def patch(self, request, resource, identifier):
        if resource not in self.resources:
            return Response({'detail': 'Unsupported admin resource.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Rule: Admin CANNOT edit user data
        if resource == 'users':
            return Response(
                {'detail': 'Administrator cannot modify user account data directly. You may only review or delete user accounts.'},
                status=status.HTTP_403_FORBIDDEN
            )

        item = self._get_item(resource, identifier)
        action = request.data.get('action')

        if resource == 'tutors' and action in {'verify', 'reject', 'toggle_available'}:
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
                return Response({'detail': 'Invalid status choice for this resource.'}, status=status.HTTP_400_BAD_REQUEST)
            item.status = value
            item.save(update_fields=['status', 'updated_at'] if hasattr(item, 'updated_at') else ['status'])
        else:
            return Response({'detail': 'Unsupported action.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'detail': 'Admin action completed.', 'item': self._serialize(resource, item)})

    def delete(self, request, resource, identifier):
        if resource not in self.resources:
            return Response({'detail': 'Unsupported admin resource.'}, status=status.HTTP_400_BAD_REQUEST)

        item = self._get_item(resource, identifier)

        if resource == 'users':
            if str(item.id) == str(request.user.id):
                return Response(
                    {'detail': 'You cannot delete your own active administrator account.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user_email = item.email
            item.delete()
            return Response({
                'detail': f'User {user_email} and all associated data have been permanently deleted.'
            })

        item_label = getattr(item, 'job_id', getattr(item, 'requirement_id', getattr(item, 'tutor_id', str(item.id))))
        item.delete()
        return Response({
            'detail': f'{resource.rstrip("s").capitalize()} record ({item_label}) has been permanently deleted.'
        })

    def _queryset(self, resource):
        return {
            'users': User.objects.all().order_by('-date_joined'),
            'tutors': TutorProfile.objects.select_related('user').order_by('-created_at'),
            'jobs': TuitionJob.objects.select_related('student').prefetch_related('applications__tutor_user').order_by('-created_at'),
            'requirements': TutorRequirement.objects.select_related('user').order_by('-created_at'),
            'applications': JobApplication.objects.select_related('job', 'tutor_user', 'tutor_user__tutor_profile').order_by('-created_at'),
        }[resource]

    def _get_item(self, resource, identifier):
        from django.shortcuts import get_object_or_404
        lookups = {
            'users': {'id': identifier},
            'tutors': {'tutor_id': identifier} if not self._is_uuid(identifier) else {'id': identifier},
            'jobs': {'job_id': identifier} if not self._is_uuid(identifier) else {'id': identifier},
            'requirements': {'requirement_id': identifier} if not self._is_uuid(identifier) else {'id': identifier},
            'applications': {'id': identifier},
        }
        return get_object_or_404(self._queryset(resource), **lookups[resource])

    def _is_uuid(self, val):
        import uuid
        try:
            uuid.UUID(str(val))
            return True
        except ValueError:
            return False

    def _serialize(self, resource, item):
        if resource == 'users':
            return {
                'id': str(item.id),
                'name': item.full_name,
                'first_name': item.first_name,
                'last_name': item.last_name,
                'email': item.email,
                'phone': item.phone or 'Not provided',
                'role': item.role,
                'is_active': item.is_active,
                'is_verified': item.is_verified,
                'is_staff': item.is_staff,
                'is_superuser': item.is_superuser,
                'date_joined': item.date_joined,
                'last_login': item.last_login,
                'posted_jobs_count': item.posted_jobs.count() if hasattr(item, 'posted_jobs') else 0,
                'requirements_count': item.posted_requirements.count() if hasattr(item, 'posted_requirements') else 0,
                'applications_count': item.job_applications.count() if hasattr(item, 'job_applications') else 0,
                'has_tutor_profile': hasattr(item, 'tutor_profile') and item.tutor_profile is not None,
                'tutor_id': item.tutor_profile.tutor_id if (hasattr(item, 'tutor_profile') and item.tutor_profile) else None,
            }
        if resource == 'tutors':
            return {
                'id': str(item.id),
                'tutor_id': item.tutor_id,
                'name': item.user.full_name,
                'email': item.user.email,
                'phone': item.user.phone or 'Not provided',
                'gender': item.gender,
                'headline': item.headline or 'Not provided',
                'bio': item.bio or 'Not provided',
                'university': item.university or 'Not specified',
                'department': item.department or 'Not specified',
                'degree_title': item.degree_title,
                'passing_year': item.passing_year,
                'cgpa': item.cgpa,
                'city': item.city,
                'area': item.area,
                'expected_salary': item.expected_salary,
                'experience_years': item.experience_years,
                'subjects': item.subjects,
                'classes': item.classes,
                'curriculums': item.curriculums,
                'preferred_locations': item.preferred_locations,
                'tutoring_types': item.tutoring_types,
                'rating': float(item.rating),
                'total_reviews': item.total_reviews,
                'total_tuitions_completed': item.total_tuitions_completed,
                'is_verified': item.is_verified,
                'verification_status': item.verification_status,
                'nid_or_birth_cert': item.nid_or_birth_cert or 'Not provided',
                'profile_photo_url': item.profile_photo_url or (item.user.profile_image.url if item.user.profile_image else ''),
                'profile_completion_score': item.profile_completion_score,
                'is_available': item.is_available,
                'is_featured': item.is_featured,
                'created_at': item.created_at,
                'updated_at': item.updated_at,
            }
        if resource == 'jobs':
            return {
                'id': str(item.id),
                'job_id': item.job_id,
                'title': item.title,
                'student_name': item.student.full_name if item.student else 'Direct / Student Poster',
                'student_email': item.student.email if item.student else '',
                'student_phone': item.student.phone if item.student else '',
                'parent_name': item.student.full_name if item.student else 'Direct / Student Poster',
                'city': item.city,
                'area': item.area,
                'student_gender': item.student_gender,
                'preferred_tutor_gender': item.preferred_tutor_gender,
                'curriculum': item.curriculum,
                'class_level': item.class_level,
                'subjects': item.subjects,
                'days_per_week': item.days_per_week,
                'tutoring_time': item.tutoring_time,
                'salary': item.salary,
                'tuition_type': item.tuition_type,
                'status': item.status,
                'requirements_text': item.requirements_text or 'None specified',
                'views_count': item.views_count,
                'applications_count': item.applications.count(),
                'is_urgent': item.is_urgent,
                'is_verified': item.is_verified,
                'created_at': item.created_at,
                'updated_at': item.updated_at,
                'recent_applicants': [
                    {
                        'id': str(app.id),
                        'tutor_name': app.tutor_user.full_name,
                        'tutor_email': app.tutor_user.email,
                        'expected_salary': app.expected_salary,
                        'status': app.status,
                        'cover_message': app.cover_message,
                        'created_at': app.created_at
                    }
                    for app in item.applications.select_related('tutor_user')[:10]
                ]
            }
        if resource == 'requirements':
            return {
                'id': str(item.id),
                'requirement_id': item.requirement_id,
                'user_email': item.user.email if item.user else '',
                'parent_name': item.parent_name,
                'phone': item.phone,
                'email': item.email or 'Not provided',
                'student_name': item.student_name,
                'student_gender': item.student_gender,
                'city': item.city,
                'area': item.area,
                'address': item.address or 'Not provided',
                'curriculum': item.curriculum,
                'class_level': item.class_level,
                'subjects': item.subjects,
                'preferred_tutor_gender': item.preferred_tutor_gender,
                'days_per_week': item.days_per_week,
                'preferred_time': item.preferred_time,
                'budget': item.budget,
                'additional_requirements': item.additional_requirements or 'None specified',
                'status': item.status,
                'selected_tutor_id': item.selected_tutor_id or 'None selected',
                'matched_tutors': item.matched_tutors,
                'created_at': item.created_at,
                'updated_at': item.updated_at,
            }
        # resource == 'applications'
        tutor_prof = getattr(item.tutor_user, 'tutor_profile', None)
        return {
            'id': str(item.id),
            'job_id': item.job.job_id,
            'job_title': item.job.title,
            'job_salary': item.job.salary,
            'job_city': item.job.city,
            'job_area': item.job.area,
            'tutor_id': tutor_prof.tutor_id if tutor_prof else '',
            'tutor_name': item.tutor_user.full_name,
            'tutor_email': item.tutor_user.email,
            'tutor_phone': item.tutor_user.phone or 'Not provided',
            'tutor_university': tutor_prof.university if tutor_prof else '',
            'tutor_department': tutor_prof.department if tutor_prof else '',
            'cover_message': item.cover_message,
            'expected_salary': item.expected_salary,
            'status': item.status,
            'admin_notes': item.admin_notes or '',
            'guardian_feedback': item.guardian_feedback or '',
            'created_at': item.created_at,
            'updated_at': item.updated_at,
        }
