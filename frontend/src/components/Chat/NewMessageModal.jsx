import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Box,
  InputAdornment,
  CircularProgress,
  Typography,
  IconButton,
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { authAPI, chatsAPI } from '../../services/api';

const NewMessageModal = ({ open, onClose, onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const { user: currentUser } = useAuth();
  
  // Usar useRef para controlar o timeout
  const searchTimeoutRef = useRef(null);

  // Função loadUsers memoizada com useCallback
  const loadUsers = useCallback(async (searchValue = '') => {
    setLoading(true);
    try {
      const response = await authAPI.getUsers(searchValue ? { search: searchValue } : {});
      const filteredUsers = response.data.filter(u => u.id !== currentUser?.id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open, loadUsers]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    
    // Limpar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Criar novo timeout
    searchTimeoutRef.current = setTimeout(() => {
      loadUsers(value);
    }, 500);
  };

  // Limpar timeout quando o componente desmontar
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectUser = async (selectedUser) => {
    setSending(true);
    try {
      const response = await chatsAPI.getConversations();
      const conversations = response.data;
      
      const existingConversation = conversations.find(conv => {
        const otherParticipant = conv.participants?.find(p => p.id === selectedUser.id);
        return otherParticipant !== undefined;
      });

      if (existingConversation) {
        onSelectUser({
          conversationId: existingConversation.id,
          user: selectedUser
        });
      } else {
        const messageResponse = await chatsAPI.sendMessage({
          recipient_id: selectedUser.id,
          content: ' '
        });
        
        onSelectUser({
          conversationId: messageResponse.data.conversation_id,
          user: selectedUser
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', py: 2, px: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Nova mensagem
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <TextField
            fullWidth
            placeholder="Buscar pessoas"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '30px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
              }
            }}
          />
        </Box>

        <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={30} sx={{ color: '#1DA1F2' }} />
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {users.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  Nenhum usuário encontrado
                </Box>
              ) : (
                users.map((user) => (
                  <ListItem
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    disabled={sending}
                    sx={{
                      py: 2,
                      px: 3,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(29, 161, 242, 0.05)',
                      },
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={user.profile_picture || '/default-avatar.png'}
                        sx={{ width: 48, height: 48 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {user.username}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="textSecondary">
                          @{user.username} · {user.followers_count || 0} seguidores
                        </Typography>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default NewMessageModal;