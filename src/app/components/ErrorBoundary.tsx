import React from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error('Error no controlado en Banca Web:', error);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
          <Box sx={{ maxWidth: 560, width: '100%' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              No fue posible mostrar esta pantalla de forma segura.
            </Alert>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
              Ocurrió un inconveniente inesperado
            </Typography>
            <Typography sx={{ mb: 3, color: 'text.secondary' }}>
              Tu operación no se repetirá automáticamente. Recarga la aplicación y verifica el estado antes de volver a intentarla.
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Recargar aplicación
            </Button>
          </Box>
        </Box>
      );
    }
    return this.props.children;
  }
}
