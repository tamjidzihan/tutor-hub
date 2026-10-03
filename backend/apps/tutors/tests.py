from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from .models import TutorProfile

User = get_user_model()

class TutorBudgetFilterTests(APITestCase):
    def setUp(self):
        self.auth_user = User.objects.create_user(email='auth_searcher@example.com', password='Password123!', role=User.Role.STUDENT)

        u1 = User.objects.create_user(email='budget_tutor1@example.com', password='Password123!', role=User.Role.TUTOR)
        TutorProfile.objects.create(user=u1, tutor_id='TT-T-111000', expected_salary=5000, is_available=True)

        u2 = User.objects.create_user(email='budget_tutor2@example.com', password='Password123!', role=User.Role.TUTOR)
        TutorProfile.objects.create(user=u2, tutor_id='TT-T-222000', expected_salary=12000, is_available=True)

        u3 = User.objects.create_user(email='budget_tutor3@example.com', password='Password123!', role=User.Role.TUTOR)
        TutorProfile.objects.create(user=u3, tutor_id='TT-T-333000', expected_salary=25000, is_available=True)

    def test_filter_tutors_by_budget_range(self):
        self.client.force_authenticate(self.auth_user)

        res = self.client.get('/api/v1/tutors/?min_budget=6000&max_budget=15000')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Check that only the 12000 tutor is in results
        salaries = [t['expected_salary'] for t in res.data['results']]
        for s in salaries:
            self.assertGreaterEqual(s, 6000)
            self.assertLessEqual(s, 15000)
