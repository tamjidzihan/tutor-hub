from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Post

User = get_user_model()

class CommunityFeedTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(email='user1@example.com', password='Password123!', role=User.Role.STUDENT)
        self.user2 = User.objects.create_user(email='user2@example.com', password='Password123!', role=User.Role.TUTOR)

    def test_post_lifecycle_and_interactions(self):
        self.client.force_authenticate(self.user1)

        # Create post
        create_res = self.client.post('/api/v1/posts/', {
            'content': 'Need help with Calculus differentiation techniques!',
            'category': 'QUESTION',
            'tags': ['math', 'calculus']
        }, format='json')
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        post_id = create_res.data['id']

        # User2 likes the post
        self.client.force_authenticate(self.user2)
        like_res = self.client.post(f'/api/v1/posts/{post_id}/like/')
        self.assertEqual(like_res.status_code, status.HTTP_200_OK)
        self.assertTrue(like_res.data['is_liked'])

        # User2 comments on the post
        comment_res = self.client.post(f'/api/v1/posts/{post_id}/comments/', {
            'content': 'Check the chain rule first!'
        })
        self.assertEqual(comment_res.status_code, status.HTTP_201_CREATED)

        # User2 cannot delete user1's post
        delete_denied = self.client.delete(f'/api/v1/posts/{post_id}/')
        self.assertEqual(delete_denied.status_code, status.HTTP_403_FORBIDDEN)

        # User1 can delete their own post
        self.client.force_authenticate(self.user1)
        delete_ok = self.client.delete(f'/api/v1/posts/{post_id}/')
        self.assertEqual(delete_ok.status_code, status.HTTP_204_NO_CONTENT)
