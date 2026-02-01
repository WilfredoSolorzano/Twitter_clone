import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";
import {
  Home as HomeIcon,
  Explore as ExploreIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const drawerWidth = 240;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Box sx={{ overflow: "auto", mt: 8 }}>
        <List>
          <ListItem button component={Link} to="/">
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Início" />
          </ListItem>

          <ListItem button component={Link} to="/explore">
            <ListItemIcon>
              <ExploreIcon />
            </ListItemIcon>
            <ListItemText primary="Explorar" />
          </ListItem>

          <ListItem button component={Link} to={`/profile/${user.username}`}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Perfil" />
          </ListItem>
        </List>

        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Seguindo: {user.following_count || 0}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Seguidores: {user.followers_count || 0}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
