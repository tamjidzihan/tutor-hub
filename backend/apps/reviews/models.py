from django.db import models
from django.db.models import Avg
from django.conf import settings
from apps.common.models import TimeStampedModel, UUIDModel
from apps.tutors.models import TutorProfile

class Review(TimeStampedModel, UUIDModel):
    tutor = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name='reviews')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='given_reviews',
        db_column='guardian_id'
    )
    student_name = models.CharField(max_length=150, default='Anonymous Student')
    student_class = models.CharField(max_length=100, default='Class 10')
    rating = models.PositiveSmallIntegerField(default=5)
    comment = models.TextField()
    is_verified_student = models.BooleanField(default=True)

    # AI-derived evaluation fields
    ai_sentiment = models.CharField(max_length=30, blank=True, default='')
    ai_summary = models.TextField(blank=True, default='')
    ai_strengths = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def guardian(self):
        return self.student

    @guardian.setter
    def guardian(self, value):
        self.student = value

    @property
    def guardian_name(self):
        return self.student_name

    @guardian_name.setter
    def guardian_name(self, value):
        self.student_name = value

    @property
    def is_verified_guardian(self):
        return self.is_verified_student

    @is_verified_guardian.setter
    def is_verified_guardian(self, value):
        self.is_verified_student = value

    def __str__(self):
        return f"{self.student_name} ({self.rating}★) for {self.tutor.tutor_id}"

    def update_tutor_stats(self):
        tutor = self.tutor
        stats = tutor.reviews.aggregate(avg_rating=Avg('rating'), total=models.Count('id'))
        tutor.rating = round(stats['avg_rating'] or 5.0, 1)
        tutor.total_reviews = stats['total'] or 0
        tutor.save(update_fields=['rating', 'total_reviews'])

    def save(self, *args, **kwargs):
        # AI analysis if not already populated
        if not self.ai_sentiment and self.comment:
            try:
                from apps.ai.services import ai_service
                analysis = ai_service.analyze_review(self.comment, self.rating)
                self.ai_sentiment = analysis.get('sentiment', '')
                self.ai_summary = analysis.get('summary', '')
                self.ai_strengths = analysis.get('strengths', [])
            except Exception:
                pass
        super().save(*args, **kwargs)
        self.update_tutor_stats()

    def delete(self, *args, **kwargs):
        tutor = self.tutor
        super().delete(*args, **kwargs)
        stats = tutor.reviews.aggregate(avg_rating=Avg('rating'), total=models.Count('id'))
        tutor.rating = round(stats['avg_rating'] or 5.0, 1)
        tutor.total_reviews = stats['total'] or 0
        tutor.save(update_fields=['rating', 'total_reviews'])
