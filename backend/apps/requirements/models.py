import random
from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel, UUIDModel

def generate_requirement_id():
    return f"TT-R-{random.randint(100000, 999999)}"

class TutorRequirement(TimeStampedModel, UUIDModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Tutor Assignment'
        MATCHED = 'MATCHED', 'Tutors Matched'
        TUTOR_SELECTED = 'TUTOR_SELECTED', 'Tutor Selected for Trial'
        COMPLETED = 'COMPLETED', 'Tuition Active'
        CANCELLED = 'CANCELLED', 'Cancelled'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posted_requirements',
        null=True,
        blank=True
    )
    requirement_id = models.CharField(max_length=20, unique=True, default=generate_requirement_id, db_index=True)
    
    parent_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    
    student_name = models.CharField(max_length=150)
    student_gender = models.CharField(max_length=20, default='Female')
    
    city = models.CharField(max_length=100, default='Dhaka')
    area = models.CharField(max_length=100, default='Dhanmondi')
    address = models.TextField(blank=True)
    
    curriculum = models.CharField(max_length=100, default='English Version')
    class_level = models.CharField(max_length=100, default='Class 10 (SSC)')
    subjects = models.JSONField(default=list)
    
    preferred_tutor_gender = models.CharField(max_length=20, default='Any')
    days_per_week = models.PositiveIntegerField(default=3)
    preferred_time = models.CharField(max_length=100, default='5:00 PM - 7:00 PM')
    budget = models.PositiveIntegerField(default=9000)
    
    additional_requirements = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    selected_tutor_id = models.CharField(max_length=50, blank=True)
    matched_tutors = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.requirement_id} - {self.student_name} ({self.class_level})"
