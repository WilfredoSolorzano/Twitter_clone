import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Badge,
  Divider,
} from "@mui/material";
import {
  Home as HomeIcon,
  Explore as ExploreIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  Bookmark as BookmarkIcon,
  MoreHoriz as MoreIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { chatsAPI, notificationsAPI } from "../../services/api"; 

const Sidebar = () => {
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0); 

  
  useEffect(() => {
    if (!user) return;

    const loadUnreadMessages = async () => {
      try {
        const response = await chatsAPI.getConversations();
        const total = response.data.reduce(
          (sum, conv) => sum + (conv.unread_count || 0),
          0
        );
        setUnreadMessages(total);
      } catch (error) {
        console.error("Erro ao carregar mensagens não lidas:", error);
      }
    };

    loadUnreadMessages();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Carregar notificações não lidas
  useEffect(() => {
    if (!user) return;

    const loadUnreadNotifications = async () => {
      try {
        const response = await notificationsAPI.getNotifications();
        setUnreadNotifications(response.data.unread_count || 0);
      } catch (error) {
        console.error("Erro ao carregar notificações não lidas:", error);
      }
    };

    loadUnreadNotifications();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  const drawerWidth = 280;

  const menuItems = [
    { path: "/", icon: HomeIcon, label: "Início" },
    { path: "/explore", icon: ExploreIcon, label: "Explorar" },
    { 
      path: "/notifications", 
      icon: NotificationsIcon, 
      label: "Notificações",
      badge: unreadNotifications 
    },
    { 
      path: "/messages", 
      icon: MailIcon, 
      label: "Mensagens",
      badge: unreadMessages 
    },
    { path: "/bookmarks", icon: BookmarkIcon, label: "Salvos" },
    { path: `/profile/${user.username}`, icon: PersonIcon, label: "Perfil" },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: "border-box",
          borderRight: "1px solid #e0e0e0",
          backgroundColor: "white"
        },
      }}
    >
      <Box sx={{ overflow: "auto", mt: 2 }}>
        {/* Logo */}
        <Box sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1DA1F2" }}>
            X Clone
          </Typography>
        </Box>

        <List>
          {menuItems.map((item) => (
            <ListItem 
              key={item.path}
              button 
              component={Link} 
              to={item.path}
              sx={{
                borderRadius: "30px",
                mb: 0.5,
                "&:hover": {
                  backgroundColor: "rgba(29, 161, 242, 0.1)",
                },
              }}
            >
              <ListItemIcon>
                {item.badge && item.badge > 0 ? (
                  <Badge 
                    badgeContent={item.badge} 
                    color="primary"
                    sx={{
                      "& .MuiBadge-badge": {
                        backgroundColor: "#1DA1F2",
                        color: "white",
                      },
                    }}
                  >
                    <item.icon />
                  </Badge>
                ) : (
                  <item.icon />
                )}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItem>
          ))}

          <ListItem 
            button
            sx={{
              borderRadius: "30px",
              mb: 0.5,
              "&:hover": {
                backgroundColor: "rgba(29, 161, 242, 0.1)",
              },
            }}
          >
            <ListItemIcon>
              <MoreIcon />
            </ListItemIcon>
            <ListItemText primary="Mais" primaryTypographyProps={{ fontWeight: 500 }} />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Informações do usuário */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <img
              src={user.profile_picture || '/default-avatar.png'}
              alt={user.username}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                objectFit: "cover",
                marginRight: 12,
              }}
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {user.username}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                @{user.username}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                {user.following_count || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Seguindo
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                {user.followers_count || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Seguidores
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;