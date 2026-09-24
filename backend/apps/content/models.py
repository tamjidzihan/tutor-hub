from django.db import models
from apps.common.models import TimeStampedModel, UUIDModel

class BlogPost(TimeStampedModel, UUIDModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    author = models.CharField(max_length=150, default='TutorHub Academic Team')
    author_role = models.CharField(max_length=150, default='Senior Education Analyst')
    category = models.CharField(max_length=100, default='Exam Strategies')
    read_time = models.CharField(max_length=50, default='5 min read')
    cover_image = models.URLField(max_length=500)
    summary = models.TextField()
    content = models.TextField()
    is_featured = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class FAQItem(TimeStampedModel, UUIDModel):
    class Category(models.TextChoices):
        PARENTS = 'PARENTS', 'For Guardians & Students'
        TUTORS = 'TUTORS', 'For Tutors & Applicants'
        GENERAL = 'GENERAL', 'General Platform & Security'

    question = models.CharField(max_length=300)
    answer = models.TextField()
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.GENERAL)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['category', 'display_order']

    def __str__(self):
        return self.question

class TeamMember(TimeStampedModel, UUIDModel):
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=150)
    bio = models.TextField()
    image = models.URLField(max_length=500)
    linkedin = models.URLField(max_length=500, blank=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return f"{self.name} - {self.role}"

class Career(TimeStampedModel, UUIDModel):
    title = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    location = models.CharField(max_length=100, default='Dhaka, Bangladesh')
    type = models.CharField(max_length=50, default='Full-time')
    experience = models.CharField(max_length=100, default='2+ Years')
    deadline = models.CharField(max_length=100, default='Open until filled')
    description = models.TextField()
    responsibilities = models.JSONField(default=list)
    requirements = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.department})"

class GalleryItem(TimeStampedModel, UUIDModel):
    title = models.CharField(max_length=200)
    caption = models.TextField(blank=True)
    image_url = models.URLField(max_length=500)
    category = models.CharField(max_length=100, default='Campus Drives')
    date = models.CharField(max_length=100, default='2024')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
