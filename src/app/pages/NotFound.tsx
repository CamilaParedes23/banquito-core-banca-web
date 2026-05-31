import { useNavigate } from 'react-router';
import { Container, Box, Typography, Button } from '@mui/material';
import { Home, ErrorOutline } from '@mui/icons-material';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center' }}>
          <ErrorOutline sx={{ fontSize: 120, color: 'error.main', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            404
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Página no encontrada
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            La página que buscas no existe o ha sido movida.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Home />}
            onClick={() => navigate('/')}
          >
            Volver al Inicio
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
