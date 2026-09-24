from django.contrib import admin
from .models import Testimonial

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'type', 'institution_or_location', 'rating', 'is_featured', 'created_at']
    list_filter = ['type', 'is_featured', 'rating']
    search_fields = ['name', 'role', 'quote']
