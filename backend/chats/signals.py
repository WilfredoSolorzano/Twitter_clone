from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message
from notifications.models import Notification

@receiver(post_save, sender=Message)
def create_message_notification(sender, instance, created, **kwargs):
    """Cria notificação quando recebe mensagem"""
    if created:
        conversation = instance.conversation
        recipient = conversation.participants.exclude(id=instance.sender.id).first()
        
        if recipient:
            Notification.objects.create(
                recipient=recipient,
                sender=instance.sender,
                notification_type='message',
                text=f"{instance.sender.username} enviou uma mensagem"
            )