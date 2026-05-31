import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  IconButton,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AccountBalance,
  TrendingUp,
  Security,
  Phone,
} from '@mui/icons-material';

export default function Login() {
  const navigate = useNavigate();
  const [identification, setIdentification] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identification || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);

    // Simulación de login (en producción esto llamaría a la API de autenticación)
    setTimeout(() => {
      if (identification.length >= 8 && password.length >= 6) {
        localStorage.setItem('authToken', 'mock-token-12345');
        localStorage.setItem('userId', identification);
        navigate('/');
      } else {
        setError('Identificación o contraseña incorrectos');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: '#f5f7fa',
      }}
    >
      {/* Left Side - Hero Section */}
      <Box
        sx={{
          width: '50%',
          background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            top: -100,
            right: -100,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            bottom: -50,
            left: -50,
          }}
        />

        {/* Content */}
        <Box sx={{ zIndex: 1, textAlign: 'center', maxWidth: 500 }}>
          {/* Decorative icons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 6 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: '50%',
                bgcolor: 'rgba(16, 185, 129, 0.2)',
                border: '2px solid rgba(16, 185, 129, 0.4)',
              }}
            >
              <Security sx={{ fontSize: 40, color: '#10B981' }} />
            </Box>
            <Box
              sx={{
                p: 2,
                borderRadius: '50%',
                bgcolor: 'rgba(16, 185, 129, 0.2)',
                border: '2px solid rgba(16, 185, 129, 0.4)',
              }}
            >
              <TrendingUp sx={{ fontSize: 40, color: '#10B981' }} />
            </Box>
            <Box
              sx={{
                p: 2,
                borderRadius: '50%',
                bgcolor: 'rgba(16, 185, 129, 0.2)',
                border: '2px solid rgba(16, 185, 129, 0.4)',
              }}
            >
              <Phone sx={{ fontSize: 40, color: '#10B981' }} />
            </Box>
          </Box>

          <Typography
            variant="h3"
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 3,
              textShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
          >
            Tu banco digital, donde sea que estés
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            Gestiona tus finanzas de forma segura y sencilla, 24/7 desde cualquier lugar
          </Typography>

          {/* Features */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
            {[
              'Transferencias instantáneas P2P',
              'Consulta de saldos en tiempo real',
              'Seguridad bancaria de clase mundial',
              'Soporte 24/7 para nuestros clientes',
            ].map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  color: 'white',
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#10B981',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                  }}
                />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {feature}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
        }}
      >
        <Card
          sx={{
            maxWidth: 480,
            width: '100%',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          <CardContent sx={{ p: 5 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
              <AccountBalance sx={{ fontSize: 48, color: '#0066CC', mr: 2 }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Banco BanQuito
              </Typography>
            </Box>

            {/* Greeting */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#1a1a1a',
                mb: 1,
                textAlign: 'center',
              }}
            >
              ¡Hola! Te damos la bienvenida
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                mb: 4,
                textAlign: 'center',
              }}
            >
              a tu Banca Web
            </Typography>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
                  Identificación / Cédula
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Ej: 1234567890"
                  value={identification}
                  onChange={(e) => setIdentification(e.target.value.replace(/\D/g, ''))}
                  inputProps={{ maxLength: 13 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#f9fafb',
                      '&:hover': {
                        bgcolor: '#f3f4f6',
                      },
                      '&.Mui-focused': {
                        bgcolor: 'white',
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                    Contraseña
                  </Typography>
                  <Link
                    href="#"
                    underline="hover"
                    sx={{
                      color: '#0066CC',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      '&:hover': {
                        color: '#0052A3',
                      },
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </Box>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#666' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#f9fafb',
                      '&:hover': {
                        bgcolor: '#f3f4f6',
                      },
                      '&.Mui-focused': {
                        bgcolor: 'white',
                      },
                    },
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                  },
                  '&:disabled': {
                    background: '#e5e7eb',
                    color: '#9ca3af',
                  },
                }}
              >
                {loading ? 'Ingresando...' : 'Ingresar a mi cuenta'}
              </Button>
            </form>

            {/* Register Link */}
            <Box
              sx={{
                pt: 3,
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                ¿Eres cliente y no tienes banca web?
              </Typography>
              <Link
                href="#"
                underline="hover"
                sx={{
                  color: '#0066CC',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  '&:hover': {
                    color: '#0052A3',
                  },
                }}
              >
                Regístrate aquí
              </Link>
            </Box>

            {/* Security Notice */}
            <Box
              sx={{
                mt: 4,
                p: 2,
                borderRadius: 2,
                bgcolor: '#f0f9ff',
                border: '1px solid #bfdbfe',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Security sx={{ fontSize: 18, color: '#0066CC' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0066CC' }}>
                  Conexión Segura
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#666' }}>
                Tu información está protegida con encriptación de 256 bits
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
