from django.urls import path
from .views import PostListCreateAPI, PostDetailAPI, LikePostAPI, RetweetPostAPI  

urlpatterns = [
    path('', PostListCreateAPI.as_view(), name='post-list'),
    path('<int:pk>/', PostDetailAPI.as_view(), name='post-detail'),
    path('<int:pk>/like/', LikePostAPI.as_view(), name='post-like'),
    path('<int:pk>/retweet/', RetweetPostAPI.as_view(), name='post-retweet'), 
]