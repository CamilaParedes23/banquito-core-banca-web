import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { CheckCircle, Key, Security } from '@mui/icons-material';
import { authService } from '../services/auth.service';
import { getFriendlyApiError } from '../services/http.service';

const passwordHelp = 'Mínimo 10 caracteres, mayúsculas, minúsculas, números y un carácter especial.';

export default function ActivateAccount() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [params]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!token.trim()) { setError('Ingrese el token de activación recibido por correo.'); return; }
    if (password !== confirmPassword) { setError('La confirmación de contraseña no coincide.'); return; }
    setLoading(true);
    try {
      const response = await authService.activateAccount({ token: token.trim(), newPassword: password });
      setSuccess(response.message || 'Cuenta activada correctamente. Ya puede iniciar sesión.');
    } catch (requestError) {
      setError(getFriendlyApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#f5f7fa', p: 3 }}>
      <Card sx={{ width: '100%', maxWidth: 560, borderRadius: 4, boxShadow: '0 18px 60px rgba(4,30,77,0.12)' }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Security sx={{ color: '#D4A62A' }} />
            <Typography variant="overline" sx={{ letterSpacing: 3, color: '#D4A62A', fontWeight: 900 }}>Activación segura</Typography>
          </Box>
          <Typography variant="h4" sx={{ color: '#062A66', fontWeight: 900, mb: 1 }}>Active su acceso digital</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Use el token recibido por correo para definir su contraseña de Banca Web.</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircle />}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Token de activación"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              fullWidth
              multiline
              minRows={2}
              InputProps={{ startAdornment: <InputAdornment position="start"><Key /></InputAdornment> }}
            />
            <TextField
              label="Nueva contraseña"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              helperText={passwordHelp}
              fullWidth
            />
            <TextField
              label="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={loading || Boolean(success)} sx={{ py: 1.3, bgcolor: '#062A66', fontWeight: 800 }}>
              {loading ? 'Activando...' : 'Activar cuenta'}
            </Button>
            <Button variant="text" onClick={() => navigate('/login', { replace: true })}>Ir al inicio de sesión</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
