import random
from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel, UUIDModel

def generate_job_id():
    return f"TT-J-{random.randint(100000, 999999)}"

class TuitionJob(TimeStampedModel, UUIDModel):
    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        SHORTLISTED = 'SHORTLISTED', 'Shortlisted'
        APPOINTED = 'APPOINTED', 'Appointed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    class TutorGenderPreference(models.TextChoices):
        ANY = 'Any', 'Any Tutor'
        MALE = 'Male', 'Male Tutor Only'
        FEMALE = 'Female', 'Female Tutor Only'

    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='posted_jobs',
        null=True,
        blank=True
    )
    job_id = models.CharField(max_length=20, unique=True, default=generate_job_id, db_index=True)
    title = models.CharField(max_length=255)
    
    city = models.CharField(max_length=100, default='Dhaka')
    area = models.CharField(max_length=100, default='Mirpur')
    
    student_gender = models.CharField(max_length=20, default='Male')
    preferred_tutor_gender = models.CharField(
        max_length=20, 
        choices=TutorGenderPreference.choices, 
        default=TutorGenderPreference.ANY
    )
    
    curriculum = models.CharField(max_length=100, default='English Version')
    class_level = models.CharField(max_length=100, default='Class 9')
    subjects = models.JSONField(default=list)
    
    days_per_week = models.PositiveIntegerField(default=3)
    tutoring_time = models.CharField(max_length=100, default='5:30 PM - 7:00 PM')
    salary = models.PositiveIntegerField(default=8000)
    
    tuition_type = models.CharField(max_length=50, default='Home Tutoring')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    
    requirements_text = models.TextField(blank=True)
    views_count = models.PositiveIntegerField(default=0)
    applications_count = models.PositiveIntegerField(default=0)
    
    is_urgent = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.job_id} - {self.title} (৳{self.salary})"
