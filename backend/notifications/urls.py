from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('mark-read/', views.MarkAsReadView.as_view(), name='mark-read'),
    path('mark-all-read/', views.MarkAllAsReadView.as_view(), name='mark-all-read'),
]