from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel, UUIDModel

class Conversation(TimeStampedModel, UUIDModel):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_conversations'
    )
    tutor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tutor_conversations'
    )

    class Meta:
        unique_together = ('student', 'tutor')
        ordering = ['-updated_at']

    def __str__(self):
        return f"Conversation: {self.student.email} ↔ {self.tutor.email}"

class Message(TimeStampedModel, UUIDModel):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    content = models.TextField()
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Msg from {self.sender.email} at {self.created_at}"
