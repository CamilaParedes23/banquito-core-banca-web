import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AccountBalance,
  Dashboard as DashboardIcon,
  ExitToApp,
  Menu as MenuIcon,
  SwapHoriz,
} from '@mui/icons-material';
import { env } from '../config/env';
import { authService } from '../services/auth.service';
import { customerService } from '../services/customer.service';
import { sessionService } from '../services/session.service';

interface LayoutProps {
  children: ReactNode;
}

const drawerWidth = 280;

const initials = (value: string): string =>
  value
    .split(/\s|\./)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'BQ';

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState(() => sessionService.get());
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sessionWarningOpen, setSessionWarningOpen] = useState(false);
  const [refreshingSession, setRefreshingSession] = useState(false);
  const refreshInProgress = useRef(false);

  useEffect(() => {
    const syncSession = () => setSession(sessionService.get());
    const handleUnauthorized = () => navigate('/login', { replace: true });
    window.addEventListener('banquito:session-changed', syncSession);
    window.addEventListener('banquito:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('banquito:session-changed', syncSession);
      window.removeEventListener('banquito:unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  useEffect(() => {
    if (!session?.expiresAt) return;

    const refreshAt = session.expiresAt - env.sessionWarningSeconds * 1000;
    const delay = Math.max(1000, refreshAt - Date.now());
    const timer = window.setTimeout(async () => {
      if (refreshInProgress.current) return;
      if (!session.refreshToken) {
        setSessionWarningOpen(true);
        return;
      }

      refreshInProgress.current = true;
      try {
        const refreshed = await authService.refreshSession();
        if (!refreshed) setSessionWarningOpen(true);
      } catch {
        setSessionWarningOpen(true);
      } finally {
        refreshInProgress.current = false;
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [session?.expiresAt, session?.refreshToken]);

  useEffect(() => {
    const customerUuid = session?.profile.customerUuid;
    if (!customerUuid || session.customerName) return;

    let active = true;
    customerService
      .getCustomer(customerUuid)
      .then((customer) => {
        if (!active) return;
        const displayName = customerService.getDisplayName(
          customer,
          session.profile.username,
        );
        sessionService.setCustomerName(displayName);
      })
      .catch(() => {
        // El nombre de usuario ya permite operar; la ficha se reintentará en una próxima sesión.
      });

    return () => {
      active = false;
    };
  }, [session?.profile.customerUuid, session?.profile.username, session?.customerName]);

  const displayName = session?.customerName || session?.profile.username || 'Cliente BanQuito';
  const isCompany = session?.profile.roles.includes('CLIENTE_EMPRESA') ?? false;
  const portalLabel = isCompany ? 'Banca Web Empresas' : 'Banca Web Personas';
  const canTransfer = session?.profile.scopes.includes('core.account.transfer.p2p') ?? false;

  const menuItems = useMemo(
    () => [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
      { text: 'Mis cuentas', icon: <AccountBalance />, path: '/cuentas' },
      ...(canTransfer
        ? [{ text: 'Transferencias', icon: <SwapHoriz />, path: '/transferencias' }]
        : []),
    ],
    [canTransfer],
  );

  const handleLogout = async () => {
    setLoggingOut(true);
    await authService.logout();
    navigate('/login', { replace: true });
  };

  const handleContinueSession = async () => {
    if (refreshingSession) return;
    setRefreshingSession(true);
    try {
      const refreshed = await authService.refreshSession();
      if (refreshed) {
        setSessionWarningOpen(false);
      } else {
        await handleLogout();
      }
    } catch {
      await handleLogout();
    } finally {
      setRefreshingSession(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#123f70' }}>
      <Box sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <AccountBalance sx={{ color: '#d9b74a', fontSize: 34 }} />
        <Box>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 750, lineHeight: 1.1 }}>
            Banco BanQuito
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.72)' }}>
            {portalLabel}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,.12)' }} />
      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.75 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                minHeight: 52,
                borderRadius: 2,
                color: 'rgba(255,255,255,.86)',
                '&.Mui-selected': {
                  color: '#f4d56b',
                  bgcolor: 'rgba(255,255,255,.12)',
                },
                '&:hover': { bgcolor: 'rgba(255,255,255,.08)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 42, color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 650 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,.12)' }} />
      <Box sx={{ p: 2 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(255,255,255,.08)', borderRadius: 2 }}>
          <Avatar sx={{ bgcolor: '#d9b74a', color: '#123f70', fontWeight: 800 }}>
            {initials(displayName)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 700 }} noWrap>
              {displayName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.7)' }}>
              {isCompany ? 'Cliente empresa' : 'Cliente persona'}
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
          bgcolor: 'white',
          color: '#123f70',
          borderBottom: '1px solid #e5e7eb',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ minHeight: 72 }}>
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' }, mr: 1 }}
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box component="img" src="/lateral.png" alt="Banco BanQuito" sx={{ height: 58, maxWidth: 230, objectFit: 'contain' }} />
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.25, mx: 1.5, px: 1.5, py: 0.8, borderRadius: 2, bgcolor: '#f5f7fa' }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: '#123f70', fontSize: 14 }}>
              {initials(displayName)}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 700, maxWidth: 260 }} noWrap>
              {displayName}
            </Typography>
          </Box>
          <Tooltip title="Cerrar sesión">
            <IconButton onClick={() => setLogoutOpen(true)} aria-label="Cerrar sesión">
              <ExitToApp />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, border: 0 } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, pt: '72px' }}>
        <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 } }}>
          {children}
        </Container>
      </Box>

      <Dialog open={sessionWarningOpen} disableEscapeKeyDown>
        <DialogTitle>Tu sesión está por finalizar</DialogTitle>
        <DialogContent>
          <Typography>
            Por seguridad, renueva la sesión para continuar operando en Banca Web.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleLogout} disabled={refreshingSession || loggingOut}>
            Cerrar sesión
          </Button>
          <Button variant="contained" onClick={handleContinueSession} disabled={refreshingSession || loggingOut} sx={{ bgcolor: '#123f70' }}>
            {refreshingSession ? 'Renovando…' : 'Continuar sesión'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={logoutOpen} onClose={() => !loggingOut && setLogoutOpen(false)}>
        <DialogTitle>Cerrar sesión</DialogTitle>
        <DialogContent>
          <Typography>¿Deseas finalizar tu sesión de Banca Web?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutOpen(false)} disabled={loggingOut}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'Cerrando…' : 'Cerrar sesión'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
