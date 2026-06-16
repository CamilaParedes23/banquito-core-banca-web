import { RouterProvider } from 'react-router';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ErrorBoundary from './components/ErrorBoundary';
import { router } from './routes';

const theme = createTheme({
  palette: {
    primary: { main: '#123f70', light: '#3f6893', dark: '#0c2b4d' },
    secondary: { main: '#d3ad35' },
    success: { main: '#137333' },
    background: { default: '#f5f7fa', paper: '#ffffff' },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { styleOverrides: { root: { minHeight: 42 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 16 } } },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
