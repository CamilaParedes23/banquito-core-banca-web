import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  CreditCard,
  Savings,
  Refresh,
  Visibility,
  VisibilityOff,
  ArrowForward,
  Receipt,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import Layout from '../components/Layout';
import { apiService, getErrorMessage, Account } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balanceVisibility, setBalanceVisibility] = useState<Record<string, boolean>>({});
  const customerId = 'CUST-001'; // En producción vendría del contexto de autenticación

  // RF-03: Consumir API de saldos al cargar el dashboard
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAccounts(customerId);
      setAccounts(response.accounts);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Función helper para obtener icono según tipo de cuenta
  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'savings':
      case 'ahorros':
        return <Savings />;
      case 'credit':
      case 'credito':
        return <CreditCard />;
      default:
        return <AccountBalance />;
    }
  };

  // Función helper para obtener color según tipo de cuenta
  const getAccountColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'savings':
      case 'ahorros':
        return '#D4AF37';
      case 'credit':
      case 'credito':
        return '#e53935';
      default:
        return '#0f3460';
    }
  };

  // Formatear número de cuenta para mostrar solo últimos 4 dígitos con formato de seguridad
  const formatAccountNumber = (accountNumber: string) => {
    const lastFour = accountNumber.slice(-4);
    return `Nº ********${lastFour}`;
  };

  // Toggle visibilidad de saldo
  const toggleBalanceVisibility = (accountNumber: string) => {
    setBalanceVisibility(prev => ({
      ...prev,
      [accountNumber]: !prev[accountNumber]
    }));
  };

  // Verificar si el saldo está visible
  const isBalanceVisible = (accountNumber: string) => {
    return balanceVisibility[accountNumber] !== false; // Por defecto visible
  };

  const recentTransactions = [
    {
      description: 'Transferencia a Ana García',
      amount: -250.00,
      date: '28 May 2026',
      category: 'Transferencia',
    },
    {
      description: 'Depósito Nómina',
      amount: 3500.00,
      date: '27 May 2026',
      category: 'Ingreso',
    },
    {
      description: 'Pago Servicios',
      amount: -85.00,
      date: '26 May 2026',
      category: 'Servicios',
    },
    {
      description: 'Compra en Línea',
      amount: -124.50,
      date: '25 May 2026',
      category: 'Compras',
    },
    {
      description: 'Retiro ATM',
      amount: -300.00,
      date: '24 May 2026',
      category: 'Retiro',
    },
  ];

  return (
    <Layout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f3460', mb: 1 }}>
            Panel Consolidado
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Balance actual de tus cuentas
          </Typography>
        </Box>
        <Button
          startIcon={<Refresh />}
          onClick={fetchAccounts}
          disabled={loading}
          sx={{ color: '#0f3460' }}
        >
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress sx={{ color: '#0f3460' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {accounts.map((account, index) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
            <Card
              sx={{
                height: '100%',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                borderRadius: 3,
                border: '1px solid #f0f0f0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Header con tipo de cuenta e icono */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: '#1a1a1a',
                        mb: 0.5,
                        fontSize: '0.95rem',
                        letterSpacing: '0.3px',
                      }}
                    >
                      {account.accountType === 'SAVINGS' ? 'Cuenta de Ahorros' :
                       account.accountType === 'CHECKING' ? 'Cuenta Corriente' :
                       account.accountType === 'CREDIT' ? 'Tarjeta de Crédito' : account.accountType}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#666',
                        fontWeight: 500,
                        letterSpacing: '0.5px',
                      }}
                    >
                      {formatAccountNumber(account.accountNumber)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: `${getAccountColor(account.accountType)}10`,
                      color: getAccountColor(account.accountType),
                    }}
                  >
                    {getAccountIcon(account.accountType)}
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Sección de Saldo Disponible con toggle de visibilidad */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#666',
                      display: 'block',
                      mb: 1,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      letterSpacing: '0.8px',
                    }}
                  >
                    Saldo Disponible
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: getAccountColor(account.accountType),
                        letterSpacing: '-0.5px',
                      }}
                    >
                      {isBalanceVisible(account.accountNumber)
                        ? `$${account.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                        : '$ •••••••'
                      }
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => toggleBalanceVisibility(account.accountNumber)}
                      sx={{
                        color: '#666',
                        '&:hover': {
                          bgcolor: '#f5f5f5',
                        },
                      }}
                    >
                      {isBalanceVisible(account.accountNumber) ? (
                        <Visibility fontSize="small" />
                      ) : (
                        <VisibilityOff fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                </Box>

                {/* Estado de cuenta */}
                <Box sx={{ mb: 3 }}>
                  <Chip
                    label={account.status === 'ACTIVE' ? 'Activa' : account.status}
                    size="small"
                    sx={{
                      bgcolor: account.status === 'ACTIVE' ? '#fef3c7' : '#ffebee',
                      color: account.status === 'ACTIVE' ? '#D4AF37' : '#e53935',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 24,
                    }}
                  />
                </Box>

                {/* Botones de Acción */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForward fontSize="small" />}
                    onClick={() => navigate('/transferencias')}
                    sx={{
                      bgcolor: '#0f3460',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      py: 1,
                      textTransform: 'none',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(15, 52, 96, 0.25)',
                      '&:hover': {
                        bgcolor: '#16213e',
                        boxShadow: '0 4px 12px rgba(15, 52, 96, 0.35)',
                      },
                    }}
                  >
                    Transferir
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    endIcon={<Receipt fontSize="small" />}
                    onClick={() => navigate('/cuentas')}
                    sx={{
                      borderColor: '#0f3460',
                      color: '#0f3460',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      py: 1,
                      textTransform: 'none',
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#16213e',
                        bgcolor: '#f0f7ff',
                      },
                    }}
                  >
                    Movimientos
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          ))}

        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)', borderRadius: 3, border: '1px solid #f0f0f0' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.3px' }}>
                  Movimientos Recientes
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForward fontSize="small" />}
                  onClick={() => navigate('/cuentas')}
                  sx={{
                    color: '#0f3460',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: '#f0f7ff',
                    },
                  }}
                >
                  Ver Todos
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {recentTransactions.map((transaction, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2.5,
                    px: 2,
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#f8f9fa',
                    },
                    borderBottom: index < recentTransactions.length - 1 ? '1px solid #f0f0f0' : 'none',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.5 }}>
                      {transaction.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#999', fontWeight: 500 }}>
                        {transaction.date}
                      </Typography>
                      <Chip
                        label={transaction.category}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: '#f0f0f0',
                          color: '#666',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                        color: transaction.amount > 0 ? '#D4AF37' : '#1a1a1a',
                        letterSpacing: '-0.3px',
                      }}
                    >
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                    {transaction.amount > 0 ? (
                      <TrendingUp sx={{ color: '#D4AF37', fontSize: 20 }} />
                    ) : (
                      <TrendingDown sx={{ color: '#999', fontSize: 20 }} />
                    )}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            sx={{
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(212, 175, 55, 0.2)',
                    mr: 2,
                  }}
                >
                  <TrendingUp sx={{ color: '#D4AF37', fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', letterSpacing: '-0.3px' }}>
                  Resumen Financiero
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    display: 'block',
                    mb: 1,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    letterSpacing: '0.8px',
                  }}
                >
                  Balance Total
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>
                  ${accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, p: 2.5, mb: 3 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    display: 'block',
                    mb: 1,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                  }}
                >
                  Ingresos del mes
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#D4AF37', mb: 2.5, letterSpacing: '-0.3px' }}>
                  +$3,500.00
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    display: 'block',
                    mb: 1,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                  }}
                >
                  Gastos del mes
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f87171', letterSpacing: '-0.3px' }}>
                  -$759.50
                </Typography>
              </Box>
              <Button
                fullWidth
                variant="contained"
                sx={{
                  bgcolor: '#D4AF37',
                  color: '#0f3460',
                  fontWeight: 700,
                  py: 1.2,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                  '&:hover': {
                    bgcolor: '#B89928',
                    boxShadow: '0 6px 16px rgba(212, 175, 55, 0.4)',
                  },
                }}
              >
                Ver Análisis Completo
              </Button>
            </CardContent>
          </Card>
        </Grid>
        </Grid>
      )}
    </Layout>
  );
}
