import logging
from typing import Optional
from django.contrib.auth import get_user_model
from .models import Notification

logger = logging.getLogger(__name__)
User = get_user_model()

def create_notification(
    recipient,
    sender=None,
    notification_type: str = 'SYSTEM',
    title: str = '',
    message: str = '',
    link: str = ''
) -> Optional[Notification]:
    """
    Helper function to dispatch a notification safely without blocking request flows.
    """
    if not recipient:
        return None
    try:
        return Notification.objects.create(
            recipient=recipient,
            sender=sender,
            notification_type=notification_type,
            title=title,
            message=message,
            link=link
        )
    except Exception as e:
        logger.warning(f"Failed to create notification: {e}")
        return None
