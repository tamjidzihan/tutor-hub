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

    def test_parent_receives_only_parent_requirements(self):
        parent = self.create_user('parent@example.com', User.Role.PARENT)
        other_parent = self.create_user('other@example.com', User.Role.PARENT)
        self.client.force_authenticate(parent)

        response = self.client.get('/api/v1/dashboard/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], User.Role.PARENT)
        self.assertEqual(response.data['requirements'], [])
        self.assertNotEqual(parent.pk, other_parent.pk)

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
        parent = self.create_user('job-parent@example.com', User.Role.PARENT)
        admin = self.create_user('job-admin@example.com', User.Role.ADMIN)
        job = TuitionJob.objects.create(parent=parent, title='Admin review job')
        self.client.force_authenticate(admin)

        response = self.client.patch(
            f'/api/v1/dashboard/admin/jobs/{job.job_id}/',
            {'action': 'set_status', 'value': TuitionJob.Status.CANCELLED},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        job.refresh_from_db()
        self.assertEqual(job.status, TuitionJob.Status.CANCELLED)
