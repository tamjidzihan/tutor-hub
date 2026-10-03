from django.urls import path
from .views import (
    ConversationListCreateView,
    ConversationDetailView,
    MessageListCreateView,
    MessageDetailView,
    MarkConversationReadView
)

urlpatterns = [
    path('conversations/', ConversationListCreateView.as_view(), name='conversation-list-create'),
    path('conversations/<uuid:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<uuid:conversation_id>/messages/', MessageListCreateView.as_view(), name='conversation-messages'),
    path('conversations/<uuid:conversation_id>/messages/<uuid:id>/', MessageDetailView.as_view(), name='conversation-message-detail'),
    path('conversations/<uuid:conversation_id>/read/', MarkConversationReadView.as_view(), name='conversation-mark-read'),
]
