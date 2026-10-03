from django.urls import path
from .views import (
    PostListCreateView,
    PostDetailView,
    PostLikeToggleView,
    CommentListCreateView,
    PostReportView
)

urlpatterns = [
    path('', PostListCreateView.as_view(), name='post-list-create'),
    path('<uuid:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('<uuid:pk>/like/', PostLikeToggleView.as_view(), name='post-like'),
    path('<uuid:post_id>/comments/', CommentListCreateView.as_view(), name='post-comments'),
    path('<uuid:pk>/report/', PostReportView.as_view(), name='post-report'),
]
