import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3, textAlign: 'center' }}>
      <Box>
        <Typography variant="h2" sx={{ fontWeight: 900, color: '#123f70' }}>404</Typography>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 750 }}>Página no encontrada</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>La dirección solicitada no pertenece a Banca Web.</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>Volver al inicio</Button>
      </Box>
    </Box>
  );
}
