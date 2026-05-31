import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Container,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance,
  SwapHoriz,
  Person,
  Notifications,
  ExitToApp,
} from '@mui/icons-material';

interface LayoutProps {
  children: ReactNode;
}

const drawerWidth = 260;

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Mis Cuentas', icon: <AccountBalance />, path: '/cuentas' },
    { text: 'Transferencias', icon: <SwapHoriz />, path: '/transferencias' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0066CC' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <AccountBalance sx={{ color: '#10B981', fontSize: 32 }} />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
          Banco BanQuito
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
      <List sx={{ flex: 1, px: 2, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                color: 'white',
                '&.Mui-selected': {
                  bgcolor: 'rgba(16, 185, 129, 0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(16, 185, 129, 0.25)',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? '#10B981' : 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
          <Avatar sx={{ bgcolor: '#10B981', width: 40, height: 40 }}>JD</Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
              Juan Díaz
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                color: '#1a1a1a',
                fontWeight: 700,
                letterSpacing: '-0.5px',
              }}
            >
              Banca Web Personas
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#999',
                fontWeight: 500,
                ml: 1,
              }}
            >
              Banco BanQuito
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              sx={{
                color: '#666',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  color: '#0066CC',
                },
              }}
            >
              <Notifications />
            </IconButton>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: '#f8f9fa',
                ml: 1,
              }}
            >
              <Avatar sx={{ bgcolor: '#0066CC', width: 32, height: 32, fontSize: '0.9rem' }}>
                JD
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', lineHeight: 1.2 }}>
                  Juan Díaz
                </Typography>
              </Box>
            </Box>
            <IconButton
              sx={{
                color: '#666',
                ml: 1,
                '&:hover': {
                  bgcolor: '#ffebee',
                  color: '#e53935',
                },
              }}
              onClick={() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                navigate('/login');
              }}
            >
              <ExitToApp />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
