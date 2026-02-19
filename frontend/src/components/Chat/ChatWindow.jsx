import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';
import { 
  Send as SendIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { chatsAPI } from '../../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ChatWindow = ({ conversationId, otherUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Função loadMessages memoizada com useCallback
  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    
    setLoading(true);
    try {
      const response = await chatsAPI.getMessages(conversationId);
      setMessages(response.data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Carregar mensagens quando conversationId mudar
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Scroll para o final quando novas mensagens chegam
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !otherUser?.id) return;

    setSending(true);
    const messageContent = newMessage.trim();
    
    try {
      const response = await chatsAPI.sendMessage({
        recipient_id: otherUser.id,
        content: messageContent
      });
      
      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    console.log('🔴 Tentando apagar mensagem:', messageId);
    
    try {
      const response = await chatsAPI.deleteMessage(messageId);
      console.log('✅ Resposta:', response.data);
      
      await loadMessages();
      
    } catch (error) {
      console.error('❌ Erro ao apagar mensagem:', error);
    }
  };

  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), "HH:mm", { locale: ptBR });
  };

  if (loading && messages.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>Carregando mensagens...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #ccc', bgcolor: '#f5f5f5' }}>
        <Typography variant="h6">{otherUser?.username || 'Chat'}</Typography>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#fafafa' }}>
        {messages.length === 0 && !loading ? (
          <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
            <Typography>Nenhuma mensagem ainda</Typography>
            <Typography variant="caption">Envie uma mensagem para começar!</Typography>
          </Box>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender?.id === user?.id;
            
            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: isOwn ? 'flex-end' : 'flex-start',
                  mb: 2,
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {/* Ícone de deletar - aparece apenas para mensagens do próprio usuário */}
                {isOwn && !msg.is_deleted && (
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteMessage(msg.id)}
                    sx={{
                      color: '#f44336',
                      opacity: 0.5,
                      order: isOwn ? 1 : -1, // Garante a ordem correta
                      '&:hover': {
                        opacity: 1,
                        bgcolor: 'rgba(244, 67, 54, 0.1)',
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
                
                {/* Balão da mensagem */}
                <Box
                  sx={{
                    maxWidth: '75%',
                    bgcolor: isOwn ? '#1DA1F2' : 'white',
                    color: isOwn ? 'white' : 'text.primary',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    wordBreak: 'break-word',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    order: 0, // Ordem padrão
                  }}
                >
                  {msg.is_deleted ? (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontStyle: 'italic', 
                        color: isOwn ? 'rgba(255,255,255,0.7)' : 'text.secondary' 
                      }}
                    >
                      {isOwn ? 'Você apagou esta mensagem' : 'Mensagem apagada'}
                    </Typography>
                  ) : (
                    <>
                      <Typography variant="body2">{msg.content}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          textAlign: 'right',
                          color: isOwn ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                          mt: 0.5,
                        }}
                      >
                        {formatMessageTime(msg.created_at)}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, borderTop: '1px solid #ccc', bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            variant="outlined"
            sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}
            disabled={sending}
          />
          <IconButton 
            type="submit" 
            color="primary"
            disabled={!newMessage.trim() || sending || !otherUser?.id}
            sx={{ 
              bgcolor: '#1DA1F2',
              color: 'white',
              '&:hover': { bgcolor: '#1a8cd8' },
              '&.Mui-disabled': { bgcolor: '#ccc' }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatWindow;