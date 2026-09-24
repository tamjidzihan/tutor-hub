from django.urls import path
from .views import (
    BlogPostListView, BlogPostDetailView, FAQItemListView,
    TeamMemberListView, CareerListView, GalleryItemListView
)

urlpatterns = [
    path('blogs/', BlogPostListView.as_view(), name='blog-list'),
    path('blogs/<slug:slug>/', BlogPostDetailView.as_view(), name='blog-detail'),
    path('faqs/', FAQItemListView.as_view(), name='faq-list'),
    path('team/', TeamMemberListView.as_view(), name='team-list'),
    path('careers/', CareerListView.as_view(), name='career-list'),
    path('gallery/', GalleryItemListView.as_view(), name='gallery-list'),
]
