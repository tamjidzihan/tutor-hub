from django.db import models
from apps.common.models import TimeStampedModel, UUIDModel

class Testimonial(TimeStampedModel, UUIDModel):
    class UserType(models.TextChoices):
        PARENT = 'PARENT', 'Guardian / Parent'
        TUTOR = 'TUTOR', 'Verified Tutor'
        STAKEHOLDER = 'STAKEHOLDER', 'Academic Stakeholder'

    name = models.CharField(max_length=150)
    role = models.CharField(max_length=150)
    institution_or_location = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=UserType.choices, default=UserType.PARENT)
    avatar = models.URLField(max_length=500)
    video_thumbnail = models.URLField(max_length=500, blank=True)
    video_url = models.URLField(max_length=500, blank=True)
    quote = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)
    is_featured = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.type})"
