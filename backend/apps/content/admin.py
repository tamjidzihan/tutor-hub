from django.contrib import admin
from .models import BlogPost, FAQItem, TeamMember, Career, GalleryItem

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'is_featured', 'created_at']
    list_filter = ['category', 'is_featured']
    search_fields = ['title', 'content', 'author']
    prepopulated_fields = {'slug': ('title',)}

@admin.register(FAQItem)
class FAQItemAdmin(admin.ModelAdmin):
    list_display = ['question', 'category', 'display_order']
    list_filter = ['category']
    search_fields = ['question', 'answer']

@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'display_order']
    search_fields = ['name', 'role']

@admin.register(Career)
class CareerAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'location', 'type', 'is_active']
    list_filter = ['department', 'type', 'is_active']
    search_fields = ['title', 'description']

@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'date', 'created_at']
    list_filter = ['category']
    search_fields = ['title', 'caption']
