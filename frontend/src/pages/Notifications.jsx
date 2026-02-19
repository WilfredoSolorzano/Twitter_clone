import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Badge,
  Button,
  AppBar,
  Toolbar,
} from '@mui/material';
import { 
  Favorite as FavoriteIcon,
  Chat as ChatIcon,
  PersonAdd as PersonAddIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { notificationsAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getNotifications();
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Marcar como lida
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navegar baseado no tipo
    switch(notification.notification_type) {
      case 'like':
      case 'comment':
        navigate(`/post/${notification.object_id}`);
        break;
      case 'follow':
        navigate(`/profile/${notification.sender.username}`);
        break;
      case 'message':
        navigate('/messages');
        break;
      default:
        break;
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'like':
        return <FavoriteIcon sx={{ color: '#f44336' }} />;
      case 'comment':
        return <ChatIcon sx={{ color: '#1DA1F2' }} />;
      case 'follow':
        return <PersonAddIcon sx={{ color: '#4caf50' }} />;
      case 'message':
        return <MessageIcon sx={{ color: '#ff9800' }} />;
      default:
        return null;
    }
  };

  const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true,
      locale: ptBR 
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-twitter-blue"></div>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 'bold' }}>
            Notificações
          </Typography>
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="primary">
              <Button 
                onClick={handleMarkAllAsRead}
                size="small"
                variant="outlined"
              >
                Marcar todas como lidas
              </Button>
            </Badge>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ overflow: 'auto', height: 'calc(100vh - 64px)' }}>
        {notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Sem notificações
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Quando alguém interagir com você, aparecerá aqui
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notif, index) => (
              <React.Fragment key={notif.id}>
                <ListItem
                  onClick={() => handleNotificationClick(notif)}
                  sx={{
                    py: 2,
                    px: 3,
                    bgcolor: notif.is_read ? 'transparent' : 'rgba(29, 161, 242, 0.05)',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(29, 161, 242, 0.1)',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={notif.sender?.profile_picture || '/default-avatar.png'}
                      sx={{ width: 48, height: 48 }}
                    />
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getIcon(notif.notification_type)}
                        <Typography variant="body2" sx={{ fontWeight: notif.is_read ? 'normal' : 'bold' }}>
                          <strong>{notif.sender?.username}</strong> {notif.text}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="textSecondary">
                        {formatTime(notif.created_at)}
                      </Typography>
                    }
                  />
                  
                  {!notif.is_read && (
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: '#1DA1F2',
                        ml: 1,
                      }}
                    />
                  )}
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default NotificationsPage;