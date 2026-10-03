from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel, UUIDModel

class Notification(TimeStampedModel, UUIDModel):
    class NotificationType(models.TextChoices):
        MESSAGE = 'MESSAGE', 'New Message'
        APPLICATION = 'APPLICATION', 'Application Status'
        REVIEW = 'REVIEW', 'Student Review'
        JOB = 'JOB', 'Job Alert'
        POST = 'POST', 'Community Reaction'
        SYSTEM = 'SYSTEM', 'Platform Announcement'

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_notifications'
    )
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notification_type}] to {self.recipient.email}: {self.title}"
