from django.db import models
from apps.common.models import TimeStampedModel

class ServiceCategory(TimeStampedModel):
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    icon_name = models.CharField(max_length=50, default='BookOpen')
    description = models.TextField()
    hero_image = models.URLField(max_length=500, blank=True)
    features = models.JSONField(default=list, blank=True)
    tutor_count = models.PositiveIntegerField(default=0)
    is_popular = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Service Categories'
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.name

class SubCategory(TimeStampedModel):
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='subcategories')
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Sub Categories'
        unique_together = ('category', 'slug')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.category.name})"
