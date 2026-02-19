from django.urls import path
from . import views 

urlpatterns = [
    path('posts/<int:post_id>/comments/', views.CommentListCreateAPI.as_view(), name='comment-list'),
    path('comments/<int:pk>/', views.CommentDetailAPI.as_view(), name='comment-detail'),
]