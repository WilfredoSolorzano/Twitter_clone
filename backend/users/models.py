from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    banner_image = models.ImageField(upload_to='banners/', blank=True, null=True)
    followers = models.ManyToManyField('self', symmetrical=False, related_name='following', blank=True)
    
    # Campos para autenticação social (opcional)
    social_provider = models.CharField(max_length=50, blank=True, null=True)
    social_id = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return self.username