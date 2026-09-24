from django.contrib import admin
from .models import ServiceCategory, SubCategory

class SubCategoryInline(admin.TabularInline):
    model = SubCategory
    extra = 1

@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'tutor_count', 'is_popular', 'display_order']
    list_editable = ['is_popular', 'display_order']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [SubCategoryInline]
