import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Badge,
  IconButton,
  Box,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { chatsAPI } from '../../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ChatList = ({ onSelectConversation, onConversationDeleted }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      const response = await chatsAPI.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, conversationId) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta conversa?')) {
      try {
        await chatsAPI.deleteConversation(conversationId);
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        if (onConversationDeleted) {
          onConversationDeleted(conversationId);
        }
      } catch (error) {
        console.error('Erro ao deletar conversa:', error);
      }
    }
  };

  const formatLastMessageTime = (date) => {
    try {
      const messageDate = new Date(date);
      const now = new Date();
      const diffHours = Math.abs(now - messageDate) / 36e5;
      
      if (diffHours < 24) {
        return format(messageDate, "HH:mm", { locale: ptBR });
      } else {
        return format(messageDate, "dd/MM/yyyy", { locale: ptBR });
      }
    } catch {
      return '';
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants?.find(p => p.id !== user?.id);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-twitter-blue"></div>
      </Box>
    );
  }

  if (conversations.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="textSecondary">
          Nenhuma conversa ainda
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Clique no botão + para iniciar uma nova conversa
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ p: 0 }}>
      {conversations.map((conv) => {
        const otherUser = getOtherParticipant(conv);
        const lastMessage = conv.last_message;
        const unread = conv.unread_count || 0;
        
        return (
          <ListItem
            key={conv.id}
            button
            onClick={() => onSelectConversation(conv.id, otherUser)}
            sx={{
              borderBottom: '1px solid #f0f0f0',
              '&:hover': {
                bgcolor: 'rgba(29, 161, 242, 0.05)',
              },
            }}
          >
            <ListItemAvatar>
              <Badge
                color="primary"
                variant="dot"
                invisible={!unread}
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: '#1DA1F2',
                    right: 8,
                    top: 8,
                  }
                }}
              >
                <Avatar
                  src={otherUser?.profile_picture || '/default-avatar.png'}
                  sx={{ width: 48, height: 48 }}
                />
              </Badge>
            </ListItemAvatar>
            
            <ListItemText
              primary={
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography 
                    variant="subtitle1" 
                    fontWeight={unread ? 'bold' : 'normal'}
                  >
                    {otherUser?.username}
                  </Typography>
                  {lastMessage && (
                    <Typography variant="caption" color="textSecondary">
                      {formatLastMessageTime(lastMessage.created_at)}
                    </Typography>
                  )}
                </Box>
              }
              secondary={
                <Typography
                  variant="body2"
                  color={unread ? 'text.primary' : 'textSecondary'}
                  noWrap
                  sx={{ maxWidth: 250 }}
                >
                  {lastMessage?.content || 'Nenhuma mensagem'}
                </Typography>
              }
            />

            <IconButton
              size="small"
              onClick={(e) => handleDelete(e, conv.id)}
              sx={{
                color: '#f44336',
                ml: 1,
                '&:hover': {
                  bgcolor: 'rgba(244, 67, 54, 0.1)',
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </ListItem>
        );
      })}
    </List>
  );
};

export default ChatList;