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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0f3460' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
        <AccountBalance sx={{ color: '#D4AF37', fontSize: 32 }} />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, letterSpacing: 0.5 }}>
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
                color: 'rgba(255,255,255,0.8)',
                '&.Mui-selected': {
                  bgcolor: 'rgba(212, 175, 55, 0.15)',
                  color: '#D4AF37',
                  '&:hover': {
                    bgcolor: 'rgba(212, 175, 55, 0.25)',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? '#D4AF37' : 'rgba(255,255,255,0.6)', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ '& .MuiTypography-root': { fontWeight: 500 } }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
          <Avatar sx={{ bgcolor: '#D4AF37', width: 40, height: 40, color: '#0f3460', fontWeight: 700 }}>JD</Avatar>
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
            <Box
              component="img"
              src="/lateral.png"
              alt="Banco BanQuito"
              sx={{
                height: 80,
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              sx={{
                color: '#666',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  color: '#0f3460',
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
              <Avatar sx={{ bgcolor: '#0f3460', width: 32, height: 32, fontSize: '0.9rem' }}>
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
