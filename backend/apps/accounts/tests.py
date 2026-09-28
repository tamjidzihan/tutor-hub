import io
from PIL import Image
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase
from apps.tutors.models import TutorProfile

User = get_user_model()

class AvatarUploadTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='avatar_user@example.com',
            password='Password123!',
            role=User.Role.ADMIN,
            first_name='Admin',
            last_name='User'
        )
        self.tutor_user = User.objects.create_user(
            email='avatar_tutor@example.com',
            password='Password123!',
            role=User.Role.TUTOR,
            first_name='Tutor',
            last_name='Teacher'
        )
        self.tutor_profile, _ = TutorProfile.objects.get_or_create(
            user=self.tutor_user,
            defaults={'university': 'Dhaka University', 'city': 'Dhaka', 'area': 'Mirpur'}
        )

    def _generate_test_image(self, width=1200, height=800, color='blue', format='PNG'):
        image = Image.new('RGB', (width, height), color=color)
        byte_io = io.BytesIO()
        image.save(byte_io, format=format)
        byte_io.seek(0)
        return SimpleUploadedFile(f'test_upload.{format.lower()}', byte_io.getvalue(), content_type=f'image/{format.lower()}')

    def test_avatar_upload_processes_and_resizes_image(self):
        self.client.force_authenticate(self.user)
        raw_image = self._generate_test_image(width=1200, height=800, color='red', format='PNG')

        response = self.client.post(
            '/api/v1/auth/avatar/',
            {'profile_image': raw_image},
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(bool(self.user.profile_image))
        self.assertTrue(self.user.profile_image.name.endswith('.webp'))

        # Inspect processed image from disk / storage
        with Image.open(self.user.profile_image.path) as img:
            self.assertEqual(img.size, (400, 400))
            self.assertEqual(img.format, 'WEBP')

    def test_tutor_avatar_upload_syncs_tutor_profile(self):
        self.client.force_authenticate(self.tutor_user)
        raw_image = self._generate_test_image(width=800, height=800, color='green', format='JPEG')

        response = self.client.post(
            '/api/v1/auth/avatar/',
            {'profile_image': raw_image},
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.tutor_user.refresh_from_db()
        self.tutor_profile.refresh_from_db()

        self.assertTrue(bool(self.tutor_user.profile_image))
        self.assertEqual(self.tutor_profile.profile_photo_url, self.tutor_user.profile_image.url)

    def test_avatar_delete_reverts_to_no_image(self):
        self.client.force_authenticate(self.user)
        raw_image = self._generate_test_image(width=500, height=500)
        self.client.post('/api/v1/auth/avatar/', {'profile_image': raw_image}, format='multipart')

        self.user.refresh_from_db()
        self.assertTrue(bool(self.user.profile_image))

        # Delete avatar
        delete_res = self.client.delete('/api/v1/auth/avatar/')
        self.assertEqual(delete_res.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertFalse(bool(self.user.profile_image))
