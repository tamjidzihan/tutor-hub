from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel, UUIDModel
from apps.tuition_jobs.models import TuitionJob

class JobApplication(TimeStampedModel, UUIDModel):
    class Status(models.TextChoices):
        APPLIED = 'APPLIED', 'Applied'
        SHORTLISTED = 'SHORTLISTED', 'Shortlisted'
        SELECTED = 'SELECTED', 'Selected'
        REJECTED = 'REJECTED', 'Rejected'

    job = models.ForeignKey(TuitionJob, on_delete=models.CASCADE, related_name='applications')
    tutor_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='job_applications')
    
    cover_message = models.TextField()
    expected_salary = models.PositiveIntegerField(default=8000)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPLIED)
    
    admin_notes = models.TextField(blank=True)
    guardian_feedback = models.TextField(blank=True)

    class Meta:
        unique_together = ('job', 'tutor_user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.tutor_user.email} -> {self.job.job_id} ({self.status})"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new:
            self.job.applications_count += 1
            self.job.save(update_fields=['applications_count'])
