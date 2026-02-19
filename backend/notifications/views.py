from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(generics.ListAPIView):
    """Lista notificações do usuário"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        ).select_related('sender')[:50]  # Últimas 50 notificações
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Contar não lidas
        unread_count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        
        return Response({
            'notifications': serializer.data,
            'unread_count': unread_count
        })


class MarkAsReadView(APIView):
    """Marca notificações como lidas"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        notification_id = request.data.get('notification_id')
        
        if notification_id:
            # Marcar uma específica
            Notification.objects.filter(
                id=notification_id,
                recipient=request.user
            ).update(is_read=True)
        else:
            # Marcar todas como lidas
            Notification.objects.filter(
                recipient=request.user,
                is_read=False
            ).update(is_read=True)
        
        # Retornar novo contador
        unread_count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        
        return Response({'unread_count': unread_count})


class MarkAllAsReadView(APIView):
    """Marca todas as notificações como lidas"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({'status': 'Todas notificações marcadas como lidas'})