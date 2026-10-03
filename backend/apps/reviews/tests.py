from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from apps.tutors.models import TutorProfile
from .models import Review

User = get_user_model()

class ReviewSystemTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            email='student_reviewer@example.com',
            password='Password123!',
            role=User.Role.STUDENT,
            first_name='Anika',
            last_name='Tabassum'
        )
        self.tutor_user = User.objects.create_user(
            email='tutor_rated@example.com',
            password='Password123!',
            role=User.Role.TUTOR,
            first_name='Tanvir',
            last_name='Hasan'
        )
        self.tutor_profile, _ = TutorProfile.objects.get_or_create(
            user=self.tutor_user,
            defaults={'tutor_id': 'TT-T-998877', 'expected_salary': 9000}
        )

    def test_student_can_review_tutor_and_stats_update(self):
        self.client.force_authenticate(self.student)

        # Submit review
        res = self.client.post('/api/v1/reviews/', {
            'tutor': str(self.tutor_profile.id),
            'rating': 5,
            'comment': 'Exceptional mentor! Very clear conceptual explanations and always punctual.',
            'student_class': 'Class 10 (SSC)'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn(res.data['ai_sentiment'].lower(), ['positive', 'neutral', 'negative'])

        # Check tutor profile rating updated
        self.tutor_profile.refresh_from_db()
        self.assertEqual(self.tutor_profile.total_reviews, 1)
        self.assertEqual(float(self.tutor_profile.rating), 5.0)

        # Check tutor reviews overview endpoint
        overview_res = self.client.get(f'/api/v1/reviews/tutor/{self.tutor_profile.tutor_id}/')
        self.assertEqual(overview_res.status_code, status.HTTP_200_OK)
        self.assertIn('rating_distribution', overview_res.data)
        self.assertIn('ai_insights', overview_res.data)

    def test_tutor_cannot_review_themselves(self):
        self.client.force_authenticate(self.tutor_user)
        res = self.client.post('/api/v1/reviews/', {
            'tutor': str(self.tutor_profile.id),
            'rating': 5,
            'comment': 'I am the best tutor!'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
