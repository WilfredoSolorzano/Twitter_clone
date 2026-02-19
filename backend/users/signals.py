from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from .models import User
from notifications.models import Notification

@receiver(m2m_changed, sender=User.following.through)
def create_follow_notification(sender, instance, action, pk_set, **kwargs):
    """Cria notificação quando alguém segue você"""
    if action == 'post_add':
        for followed_id in pk_set:
            followed_user = User.objects.get(id=followed_id)
            if followed_user != instance: 
                Notification.objects.create(
                    recipient=followed_user,
                    sender=instance,
                    notification_type='follow',
                    text=f"{instance.username} começou a seguir você"
                )