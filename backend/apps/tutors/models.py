import random
from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel, UUIDModel

def generate_tutor_id():
    return f"TT-T-{random.randint(100000, 999999)}"

class TutorProfile(TimeStampedModel, UUIDModel):
    class Gender(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'

    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Review'
        VERIFIED = 'VERIFIED', 'Verified'
        REJECTED = 'REJECTED', 'Rejected'

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tutor_profile')
    tutor_id = models.CharField(max_length=20, unique=True, default=generate_tutor_id, db_index=True)
    
    headline = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    gender = models.CharField(max_length=10, choices=Gender.choices, default=Gender.MALE)
    
    university = models.CharField(max_length=200)
    department = models.CharField(max_length=200)
    degree_title = models.CharField(max_length=200, default='B.Sc Engineering')
    passing_year = models.CharField(max_length=20, default='2024')
    cgpa = models.CharField(max_length=50, default='3.85 / 4.00')

    city = models.CharField(max_length=100, default='Dhaka')
    area = models.CharField(max_length=100, default='Mirpur')
    
    expected_salary = models.PositiveIntegerField(default=8000)
    experience_years = models.PositiveIntegerField(default=2)
    
    subjects = models.JSONField(default=list, help_text="List of teaching subjects")
    classes = models.JSONField(default=list, help_text="List of targeted class levels")
    curriculums = models.JSONField(default=list, help_text="NCTB Bangla, English Version, Edexcel, Cambridge")
    preferred_locations = models.JSONField(default=list, help_text="Preferred tutoring areas")
    tutoring_types = models.JSONField(default=list, help_text="Home Tutoring, Online Tutoring, Group Tutoring")

    rating = models.DecimalField(max_digits=3, decimal_places=1, default=5.0)
    total_reviews = models.PositiveIntegerField(default=0)
    total_tuitions_completed = models.PositiveIntegerField(default=0)

    is_verified = models.BooleanField(default=False)
    verification_status = models.CharField(
        max_length=20, 
        choices=VerificationStatus.choices, 
        default=VerificationStatus.PENDING
    )
    nid_or_birth_cert = models.CharField(max_length=50, blank=True)
    id_card_image = models.ImageField(upload_to='tutor_docs/', null=True, blank=True)
    profile_photo_url = models.URLField(max_length=500, blank=True)

    profile_completion_score = models.PositiveIntegerField(default=85)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)

    class Meta:
        ordering = ['-rating', '-is_verified', '-created_at']

    def __str__(self):
        return f"{self.tutor_id} - {self.user.get_full_name() or self.user.email} ({self.university})"

    def calculate_completion(self):
        score = 20 # base registered
        if self.headline and self.bio:
            score += 15
        if self.university and self.department:
            score += 20
        if self.subjects:
            score += 15
        if self.preferred_locations:
            score += 10
        if self.nid_or_birth_cert or self.id_card_image:
            score += 10
        if self.profile_photo_url or self.user.profile_image:
            score += 10
        self.profile_completion_score = min(score, 100)
        return self.profile_completion_score

    def save(self, *args, **kwargs):
        self.calculate_completion()
        super().save(*args, **kwargs)

class TutorEducation(TimeStampedModel):
    tutor = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name='education_records')
    degree = models.CharField(max_length=150)
    institution = models.CharField(max_length=200)
    department = models.CharField(max_length=150, blank=True)
    passing_year = models.CharField(max_length=20)
    result = models.CharField(max_length=50)

    class Meta:
        ordering = ['-passing_year']

class TutorExperience(TimeStampedModel):
    tutor = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name='experience_records')
    title = models.CharField(max_length=200)
    institution_or_platform = models.CharField(max_length=200)
    duration = models.CharField(max_length=100)
    description = models.TextField(blank=True)
