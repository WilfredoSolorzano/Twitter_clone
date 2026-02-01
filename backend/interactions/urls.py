from django.urls import path
from .views import CommentListCreateAPI, CommentDetailAPI

urlpatterns = [
    path('posts/<int:post_id>/comments/', CommentListCreateAPI.as_view(), name='comment-list-create'),
    path('comments/<int:pk>/', CommentDetailAPI.as_view(), name='comment-detail'),
]