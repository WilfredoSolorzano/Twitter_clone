from django.db import models
from django.conf import settings
from django.utils import timezone

class Conversation(models.Model):
    """Modelo para representar uma conversa entre dois usuários"""
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Conversa {self.id}"
    
    @classmethod
    def get_or_create_conversation(cls, user1, user2):
        conversations = cls.objects.filter(participants=user1).filter(participants=user2)
        if conversations.exists():
            return conversations.first(), False
        conversation = cls.objects.create()
        conversation.participants.add(user1, user2)
        return conversation, True


class Message(models.Model):
    """Modelo para representar uma mensagem"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Mensagem de {self.sender.username}"
    
    def delete(self, *args, **kwargs):
        """Sobrescreve o método delete para apenas marcar como apagada"""
        self.is_deleted = True
        self.content = ""  
        self.save()