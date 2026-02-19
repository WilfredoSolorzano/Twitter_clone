from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from interactions.models import Like, Comment  
from notifications.models import Notification

@receiver(post_save, sender=Like)
def create_like_notification(sender, instance, created, **kwargs):
    if created and instance.user != instance.post.user:
        Notification.objects.create(
            recipient=instance.post.user,
            sender=instance.user,
            notification_type='like',
            content_type=ContentType.objects.get_for_model(instance.post),
            object_id=instance.post.id,
            text=f"{instance.user.username} curtiu seu post"
        )

@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    if created and instance.user != instance.post.user:
        Notification.objects.create(
            recipient=instance.post.user,
            sender=instance.user,
            notification_type='comment',
            content_type=ContentType.objects.get_for_model(instance.post),
            object_id=instance.post.id,
            text=f"{instance.user.username} comentou: {instance.content[:50]}"
        )