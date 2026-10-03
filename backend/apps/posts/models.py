from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel, UUIDModel

class Post(TimeStampedModel, UUIDModel):
    class Category(models.TextChoices):
        ACADEMIC = 'ACADEMIC', 'Academic Discussion'
        TIPS = 'TIPS', 'Study Tips & Strategies'
        QUESTION = 'QUESTION', 'Student Question'
        RESOURCE = 'RESOURCE', 'Learning Resource'
        EXPERIENCE = 'EXPERIENCE', 'Tutor Experience'
        ANNOUNCEMENT = 'ANNOUNCEMENT', 'Announcement'

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    content = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.ACADEMIC
    )
    tags = models.JSONField(default=list, blank=True)
    image = models.ImageField(upload_to='posts/', null=True, blank=True)
    likes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    is_pinned = models.BooleanField(default=False)
    ai_summary = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-is_pinned', '-created_at']

    def __str__(self):
        return f"{self.author.email}: {self.content[:40]}..."

class PostLike(TimeStampedModel, UUIDModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_likes')

    class Meta:
        unique_together = ('post', 'user')

class Comment(TimeStampedModel, UUIDModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_comments')
    content = models.TextField()

    class Meta:
        ordering = ['created_at']

class PostReport(TimeStampedModel, UUIDModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Review'
        RESOLVED = 'RESOLVED', 'Resolved'
        DISMISSED = 'DISMISSED', 'Dismissed'

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='filed_reports')
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    class Meta:
        ordering = ['-created_at']
