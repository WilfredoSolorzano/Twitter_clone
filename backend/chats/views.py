from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, SendMessageSerializer

User = get_user_model()


class ConversationListView(generics.ListAPIView):
    """Lista todas as conversas do usuário"""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).order_by('-updated_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class SendMessageView(APIView):
    """Envia uma mensagem para outro usuário"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        print("Dados recebidos:", request.data)
        
        serializer = SendMessageSerializer(data=request.data)
        if serializer.is_valid():
            recipient_id = serializer.validated_data['recipient_id']
            content = serializer.validated_data['content']
            
            try:
                recipient = User.objects.get(id=recipient_id)
            except User.DoesNotExist:
                return Response(
                    {'error': 'Usuário não encontrado'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Não permitir enviar mensagem para si mesmo
            if recipient.id == request.user.id:
                return Response(
                    {'error': 'Não é possível enviar mensagem para si mesmo'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Obter ou criar conversa
            conversation, created = Conversation.get_or_create_conversation(
                request.user, recipient
            )
            
            # Criar mensagem
            message = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=content
            )
            
            return Response({
                'conversation_id': conversation.id,
                'message': MessageSerializer(message, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        
        print("Erros no serializer:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MessageListView(generics.ListAPIView):
    """Lista mensagens de uma conversa"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        conversation = Conversation.objects.filter(
            id=conversation_id,
            participants=self.request.user
        ).first()
        
        if not conversation:
            return Message.objects.none()
        
        # Marcar mensagens como lidas
        messages = conversation.messages.exclude(sender=self.request.user)
        messages.update(is_read=True)
        
        return conversation.messages.all()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class MarkAsReadView(APIView):
    """Marca mensagens como lidas"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=request.user
            )
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversa não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        messages = conversation.messages.exclude(sender=request.user)
        messages.update(is_read=True)
        
        return Response({'status': 'Mensagens marcadas como lidas'})
    
    
class DeleteMessageView(APIView):
    """Marca uma mensagem como apagada"""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, message_id):
        try:
            message = Message.objects.get(id=message_id, sender=request.user)
            message.is_deleted = True
            message.content = ""  
            message.save()
            
            # Retornar a mensagem atualizada
            serializer = MessageSerializer(message, context={'request': request})
            return Response({
                'status': 'Mensagem apagada',
                'message': serializer.data
            }, status=status.HTTP_200_OK)
        except Message.DoesNotExist:
            return Response(
                {'error': 'Mensagem não encontrada ou você não tem permissão'},
                status=status.HTTP_404_NOT_FOUND
            )
    
class DeleteConversationView(APIView):
    """Deleta uma conversa"""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=request.user
            )
            conversation.delete()
            return Response({'status': 'Conversa eliminada'}, status=status.HTTP_200_OK)
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversa não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )