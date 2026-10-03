from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from apps.tuition_jobs.models import TuitionJob


User = get_user_model()


class DashboardOverviewTests(APITestCase):
    def create_user(self, email, role):
        return User.objects.create_user(email=email, password='Password123!', role=role)

    def test_dashboard_requires_authentication(self):
        response = self.client.get('/api/v1/dashboard/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_tutor_receives_tutor_scoped_overview(self):
        tutor = self.create_user('tutor@example.com', User.Role.TUTOR)
        self.client.force_authenticate(tutor)

        response = self.client.get('/api/v1/dashboard/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], User.Role.TUTOR)
        self.assertIn('profile_completion', response.data['stats'])
        self.assertIn('recent_applications', response.data)

    def test_student_receives_only_student_requirements(self):
        student = self.create_user('student@example.com', User.Role.STUDENT)
        other_student = self.create_user('other@example.com', User.Role.STUDENT)
        self.client.force_authenticate(student)

        response = self.client.get('/api/v1/dashboard/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], User.Role.STUDENT)
        self.assertEqual(response.data['requirements'], [])
        self.assertNotEqual(student.pk, other_student.pk)

    def test_public_stats_are_database_derived(self):
        response = self.client.get('/api/v1/dashboard/stats/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['registeredTutors'], 0)
        self.assertEqual(response.data['liveTuitionJobs'], 0)
        self.assertIsNone(response.data['satisfactionRate'])

    def test_admin_resources_are_restricted_and_paginated(self):
        tutor = self.create_user('resource-tutor@example.com', User.Role.TUTOR)
        self.client.force_authenticate(tutor)
        denied = self.client.get('/api/v1/dashboard/admin/?resource=users')
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

        admin = self.create_user('resource-admin@example.com', User.Role.ADMIN)
        self.client.force_authenticate(admin)
        response = self.client.get('/api/v1/dashboard/admin/?resource=users&page_size=1')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['resource'], 'users')
        self.assertEqual(len(response.data['results']), 1)
        self.assertGreaterEqual(response.data['count'], 2)

    def test_admin_can_change_job_status(self):
        student = self.create_user('job-student@example.com', User.Role.STUDENT)
        admin = self.create_user('job-admin@example.com', User.Role.ADMIN)
        job = TuitionJob.objects.create(student=student, title='Admin review job')
        self.client.force_authenticate(admin)

        response = self.client.patch(
            f'/api/v1/dashboard/admin/jobs/{job.job_id}/',
            {'action': 'set_status', 'value': TuitionJob.Status.CANCELLED},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        job.refresh_from_db()
        self.assertEqual(job.status, TuitionJob.Status.CANCELLED)

    def test_admin_cannot_edit_user_data(self):
        admin = self.create_user('admin-policy@example.com', User.Role.ADMIN)
        target_user = self.create_user('target@example.com', User.Role.STUDENT)
        self.client.force_authenticate(admin)

        response = self.client.patch(
            f'/api/v1/dashboard/admin/users/{target_user.id}/',
            {'action': 'set_role', 'value': User.Role.STUDENT},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('cannot modify user account data directly', response.data['detail'])

    def test_admin_can_delete_user(self):
        admin = self.create_user('admin-delete@example.com', User.Role.ADMIN)
        target_user = self.create_user('to-delete@example.com', User.Role.STUDENT)
        self.client.force_authenticate(admin)

        response = self.client.delete(f'/api/v1/dashboard/admin/users/{target_user.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(User.objects.filter(id=target_user.id).exists())

    def test_admin_cannot_delete_self(self):
        admin = self.create_user('admin-self@example.com', User.Role.ADMIN)
        self.client.force_authenticate(admin)

        response = self.client.delete(f'/api/v1/dashboard/admin/users/{admin.id}/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(User.objects.filter(id=admin.id).exists())
