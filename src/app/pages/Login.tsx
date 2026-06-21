import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import {
  Phone,
  Security,
  TrendingUp,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { authService } from '../services/auth.service';
import { getFriendlyApiError } from '../services/http.service';
import { sessionService } from '../services/session.service';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionService.isAuthenticated()) navigate('/', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const reason = (location.state as { reason?: string } | null)?.reason;
    if (reason === 'expired') setError('Tu sesión expiró. Ingresa nuevamente.');
    if (reason === 'customer-only') setError('Este portal es exclusivo para clientes de Banca Web.');
  }, [location.state]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Ingresa tu usuario y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const tokens = await authService.login({ username: username.trim(), password });
      const profile = await authService.me(tokens.accessToken);

      const customerUuid = profile.customerUuid || profile.referenceUuid;
      const isCustomer =
        profile.actorType === 'CLIENTE' &&
        profile.referenceType === 'CUSTOMER' &&
        Boolean(customerUuid);

      if (!isCustomer) {
        setError('Este portal es exclusivo para clientes de Banca Web.');
        return;
      }

      sessionService.create(tokens, { ...profile, customerUuid }, username.trim());
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(getFriendlyApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <Box
        sx={{
          width: '50%',
          display: { xs: 'none', md: 'flex' },
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          background: 'linear-gradient(135deg, #123f70 0%, #102b50 100%)',
        }}
      >
        <Box sx={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.05)', top: -120, right: -100 }} />
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 540, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 5 }}>
            {[<Security key="security" />, <TrendingUp key="growth" />, <Phone key="phone" />].map((icon) => (
              <Box key={icon.key} sx={{ display: 'grid', placeItems: 'center', width: 76, height: 76, borderRadius: '50%', color: '#e0bd4f', bgcolor: 'rgba(224,189,79,.12)', border: '2px solid rgba(224,189,79,.3)', '& svg': { fontSize: 38 } }}>
                {icon}
              </Box>
            ))}
          </Box>
          <Typography variant="h2" sx={{ color: 'white', fontWeight: 800, lineHeight: 1.2, mb: 3 }}>
            Tu banco digital, donde sea que estés
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,.86)', fontWeight: 400 }}>
            Consulta tus productos y realiza operaciones autorizadas de forma segura.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ width: { xs: '100%', md: '50%' }, display: 'grid', placeItems: 'center', p: { xs: 2, sm: 4 } }}>
        <Card sx={{ maxWidth: 500, width: '100%', borderRadius: 4, boxShadow: '0 12px 40px rgba(16,43,80,.12)' }}>
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Box component="img" src="/Baco.png" alt="Banco BanQuito" sx={{ display: 'block', height: 92, maxWidth: '100%', objectFit: 'contain', mx: 'auto', mb: 3 }} />
            <Typography variant="h4" align="center" sx={{ fontWeight: 800, color: '#102b50', mb: 1 }}>
              Inicia sesión en tu cuenta
            </Typography>
            <Typography align="center" color="text.secondary" sx={{ mb: 4 }}>
              Banca Web Personas
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Usuario"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                disabled={loading}
                sx={{ mb: 2.5 }}
              />
              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((current) => !current)} edge="end" aria-label="Mostrar u ocultar contraseña">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
              <Button fullWidth type="submit" variant="contained" size="large" disabled={loading} sx={{ minHeight: 52, bgcolor: '#123f70', fontWeight: 750 }}>
                {loading ? 'Validando acceso…' : 'Ingresar'}
              </Button>
              <Button fullWidth type="button" variant="text" sx={{ mt: 1.5, color: '#123f70', fontWeight: 700 }} onClick={() => navigate('/activar')}>
                Activar acceso digital
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
