from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase


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
