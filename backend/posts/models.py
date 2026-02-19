from django.db import models
from django.conf import settings

class Post(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField(max_length=280)
    image = models.ImageField(upload_to='post_images/', blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    retweets = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='retweeted_posts',
        blank=True
    )
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.user.username}: {self.content[:50]}'
    
    @property
    def likes_count(self):
        return self.likes.count()
    
    @property
    def comments_count(self):
        return self.comments.count()
    
    @property
    def retweets_count(self):
        return self.retweets.count()
    
    def is_retweeted_by(self, user):
        return self.retweets.filter(id=user.id).exists()