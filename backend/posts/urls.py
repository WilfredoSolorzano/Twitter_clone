from django.urls import path
from .views import PostListCreateAPI, PostDetailAPI, LikePostAPI

urlpatterns = [
    path('', PostListCreateAPI.as_view(), name='post-list-create'),
    path('<int:pk>/', PostDetailAPI.as_view(), name='post-detail'),
    path('<int:pk>/like/', LikePostAPI.as_view(), name='like-post'),
]