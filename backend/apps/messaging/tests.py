from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Conversation, Message

User = get_user_model()

class MessagingAPITests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            email='student_msg@example.com',
            password='Password123!',
            role=User.Role.STUDENT,
            first_name='Student',
            last_name='User'
        )
        self.tutor = User.objects.create_user(
            email='tutor_msg@example.com',
            password='Password123!',
            role=User.Role.TUTOR,
            first_name='Tutor',
            last_name='User'
        )
        self.other_student = User.objects.create_user(
            email='other_student@example.com',
            password='Password123!',
            role=User.Role.STUDENT
        )

    def test_start_conversation_and_send_message(self):
        self.client.force_authenticate(self.student)

        # Start conversation
        res = self.client.post('/api/v1/conversations/', {'target_user_id': str(self.tutor.id)})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        conv_id = res.data['id']

        # Send message
        msg_res = self.client.post(f'/api/v1/conversations/{conv_id}/messages/', {'content': 'Hello tutor!'})
        self.assertEqual(msg_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(msg_res.data['content'], 'Hello tutor!')

        # Tutor reads conversation
        self.client.force_authenticate(self.tutor)
        list_res = self.client.get('/api/v1/conversations/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.data), 1)

        # Other student cannot view conversation
        self.client.force_authenticate(self.other_student)
        forbidden_res = self.client.get(f'/api/v1/conversations/{conv_id}/messages/')
        self.assertEqual(forbidden_res.status_code, status.HTTP_404_NOT_FOUND)

    def test_bidirectional_conversation_reuse_no_duplicates(self):
        from apps.tutors.models import TutorProfile
        tutor_prof = TutorProfile.objects.create(
            user=self.tutor,
            headline='Math Tutor',
            tutor_id='TT-T-999888'
        )

        # Student starts conv with tutor using tutor_id string
        self.client.force_authenticate(self.student)
        res1 = self.client.post('/api/v1/conversations/', {'tutor_id': 'TT-T-999888'})
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        conv_id1 = res1.data['id']

        # Tutor starts conv with student using target_user_id
        self.client.force_authenticate(self.tutor)
        res2 = self.client.post('/api/v1/conversations/', {'target_user_id': str(self.student.id)})
        self.assertIn(res2.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        conv_id2 = res2.data['id']

        # Must reuse the same conversation, not create duplicates
        self.assertEqual(conv_id1, conv_id2)
        self.assertEqual(Conversation.objects.count(), 1)
