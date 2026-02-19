from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('send/', views.SendMessageView.as_view(), name='send-message'),
    path('conversations/<int:conversation_id>/messages/', views.MessageListView.as_view(), name='message-list'),
    path('conversations/<int:conversation_id>/read/', views.MarkAsReadView.as_view(), name='mark-read'),
    path('conversations/<int:conversation_id>/', views.DeleteConversationView.as_view(), name='delete-conversation'),
    path('messages/<int:message_id>/', views.DeleteMessageView.as_view(), name='delete-message'),
]