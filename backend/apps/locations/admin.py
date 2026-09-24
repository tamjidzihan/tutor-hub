from django.contrib import admin
from .models import City, Area

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'created_at']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'slug', 'is_active']
    list_filter = ['city', 'is_active']
    search_fields = ['name', 'city__name']
    prepopulated_fields = {'slug': ('name',)}
