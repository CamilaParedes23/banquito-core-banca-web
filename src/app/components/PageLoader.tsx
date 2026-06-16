import { Box, CircularProgress, Typography } from '@mui/material';

export default function PageLoader() {
  return (
    <Box sx={{ minHeight: '45vh', display: 'grid', placeItems: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={36} sx={{ mb: 2 }} />
        <Typography color="text.secondary">Cargando información segura…</Typography>
      </Box>
    </Box>
  );
}
