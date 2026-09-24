from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel, UUIDModel
from apps.tutors.models import TutorProfile

class Review(TimeStampedModel, UUIDModel):
    tutor = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name='reviews')
    guardian = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    guardian_name = models.CharField(max_length=150)
    student_class = models.CharField(max_length=100, default='Class 10')
    rating = models.PositiveSmallIntegerField(default=5)
    comment = models.TextField()
    is_verified_guardian = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.guardian_name} ({self.rating}★) for {self.tutor.tutor_id}"
