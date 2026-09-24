from django.db import models
from apps.common.models import TimeStampedModel

class City(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Cities'
        ordering = ['name']

    def __str__(self):
        return self.name

class Area(TimeStampedModel):
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='areas')
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('city', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name}, {self.city.name}"
