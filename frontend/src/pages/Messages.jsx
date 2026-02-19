import React, { useState } from 'react';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import ChatList from '../components/Chat/ChatList';
import ChatWindow from '../components/Chat/ChatWindow';
import NewMessageModal from '../components/Chat/NewMessageModal';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);

  const handleSelectConversation = (conversationId, otherUser) => {
    setSelectedConversation(conversationId);
    setSelectedUser(otherUser);
  };

  const handleBack = () => {
    setSelectedConversation(null);
    setSelectedUser(null);
  };

  const handleNewMessage = () => {
    setNewMessageOpen(true);
  };

  const handleSelectUser = ({ conversationId, user }) => {
    setSelectedConversation(conversationId);
    setSelectedUser(user);
    setNewMessageOpen(false);
  };

  const handleConversationDeleted = (deletedId) => {
    if (selectedConversation === deletedId) {
      setSelectedConversation(null);
      setSelectedUser(null);
    }
  };

  return (
    <Box sx={{ height: '100vh', bgcolor: '#fff' }}>
      {/* Tela de Lista de Conversas */}
      {!selectedConversation ? (
        <>
          <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <Toolbar sx={{ minHeight: '56px !important' }}>
              <Typography variant="h6" sx={{ flex: 1, fontWeight: 'bold' }}>
                Mensagens
              </Typography>
              <IconButton onClick={handleNewMessage} sx={{ color: '#1DA1F2' }}>
                <AddIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          
          <Box sx={{ height: 'calc(100vh - 56px)', overflow: 'auto' }}>
            <ChatList 
              onSelectConversation={handleSelectConversation}
              onConversationDeleted={handleConversationDeleted}
            />
          </Box>
        </>
      ) : (
        /* Tela do Chat */
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <Toolbar sx={{ minHeight: '56px !important' }}>
              <IconButton onClick={handleBack} sx={{ mr: 1, color: '#1DA1F2' }}>
                <ArrowBackIcon />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={selectedUser?.profile_picture || '/default-avatar.png'}
                  alt={selectedUser?.username}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    marginRight: 12,
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {selectedUser?.username}
                </Typography>
              </Box>
            </Toolbar>
          </AppBar>
          
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <ChatWindow
              conversationId={selectedConversation}
              otherUser={selectedUser}
              onBack={handleBack}
            />
          </Box>
        </Box>
      )}

      <NewMessageModal
        open={newMessageOpen}
        onClose={() => setNewMessageOpen(false)}
        onSelectUser={handleSelectUser}
      />
    </Box>
  );
};

export default Messages;