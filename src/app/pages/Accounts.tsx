import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Divider,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Download,
  Visibility,
  VisibilityOff,
  AccountBalance,
  Savings,
  TrendingUp,
  TrendingDown,
  ArrowForward,
  CalendarToday,
  AccountBalanceWallet,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import Layout from '../components/Layout';
import { apiService, Account as ApiAccount } from '../services/api';

interface Transaction {
  id: number;
  date: string;
  description: string;
  reference: string;
  amount: number;
  balance: number;
  status: string;
}

interface LocalAccount {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  availableBalance: number;
  currency: string;
  status: string;
  holderName: string;
  icon: React.ReactNode;
  color: string;
  movements: number;
  interestRate?: number;
  transactions: Transaction[];
}

export default function Accounts() {
  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [balanceVisibility, setBalanceVisibility] = useState<Record<string, boolean>>({});
  const [filterFromDate, setFilterFromDate] = useState<string>('');
  const [filterToDate, setFilterToDate] = useState<string>('');
  const [accounts, setAccounts] = useState<LocalAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const customerId = 'CUST-001';

  // Datos mock de transacciones para cada cuenta
  const mockTransactions: Record<string, Transaction[]> = {
    '1234567890124521': [
      {
        id: 1,
        date: '28 May 2026',
        description: 'Transferencia P2P - Ana García López',
        reference: 'TRF-2026-0528-001',
        amount: -250.00,
        balance: 5230.50,
        status: 'Completada',
      },
      {
        id: 2,
        date: '27 May 2026',
        description: 'Depósito Nómina - Empresa XYZ S.A.',
        reference: 'NOM-2026-0527-001',
        amount: 3500.00,
        balance: 5480.50,
        status: 'Completada',
      },
      {
        id: 3,
        date: '26 May 2026',
        description: 'Pago Servicios',
        reference: 'SRV-2026-0526-001',
        amount: -85.00,
        balance: 1980.50,
        status: 'Completada',
      },
      {
        id: 4,
        date: '25 May 2026',
        description: 'Compra en Línea',
        reference: 'COM-2026-0525-001',
        amount: -124.50,
        balance: 2065.50,
        status: 'Completada',
      },
      {
        id: 5,
        date: '24 May 2026',
        description: 'Retiro ATM - Sucursal Centro',
        reference: 'ATM-2026-0524-001',
        amount: -300.00,
        balance: 2190.00,
        status: 'Completada',
      },
    ],
    '1234567890127823': [
      {
        id: 1,
        date: '28 May 2026',
        description: 'Transferencia desde Cuenta Corriente',
        reference: 'TRF-2026-0528-002',
        amount: 500.00,
        balance: 12840.00,
        status: 'Completada',
      },
      {
        id: 2,
        date: '25 May 2026',
        description: 'Rendimiento Mensual',
        reference: 'INT-2026-0525-001',
        amount: 45.80,
        balance: 12340.00,
        status: 'Completada',
      },
      {
        id: 3,
        date: '20 May 2026',
        description: 'Depósito en Efectivo',
        reference: 'DEP-2026-0520-001',
        amount: 1000.00,
        balance: 12294.20,
        status: 'Completada',
      },
    ],
  };

  // Cargar cuentas del API
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAccounts(customerId);
      
      // Convertir cuentas del API a formato local
      const localAccounts: LocalAccount[] = response.accounts.map((acc, index) => ({
        id: index + 1,
        accountNumber: acc.accountNumber,
        accountType: acc.accountType,
        balance: acc.balance,
        availableBalance: acc.availableBalance,
        currency: acc.currency,
        status: acc.status,
        holderName: acc.holderName,
        icon: acc.accountType === 'SAVINGS' ? <Savings /> : <AccountBalance />,
        color: acc.accountType === 'SAVINGS' ? '#D4AF37' : '#0f3460',
        movements: acc.accountType === 'SAVINGS' ? 89 : 245,
        interestRate: acc.accountType === 'SAVINGS' ? 4.5 : undefined,
        transactions: mockTransactions[acc.accountNumber] || [],
      }));

      setAccounts(localAccounts);
      if (!selectedAccount && localAccounts.length > 0) {
        setSelectedAccount(localAccounts[0].accountNumber);
      }
    } catch (err) {
      setError('Error al cargar las cuentas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const toggleBalanceVisibility = (accountId: string) => {
    setBalanceVisibility(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const isBalanceVisible = (accountId: string) => {
    return balanceVisibility[accountId] !== false;
  };

  const formatAccountNumber = (accountNumber: string) => {
    const lastFour = accountNumber.slice(-4);
    return `Nº ********${lastFour}`;
  };

  const getFilteredTransactions = (account: LocalAccount) => {
    if (!filterFromDate && !filterToDate) return account.transactions;
    
    return account.transactions.filter((t: Transaction) => {
      const transactionDate = new Date(t.date);
      
      if (filterFromDate) {
        const fromDate = new Date(filterFromDate);
        if (transactionDate < fromDate) return false;
      }
      
      if (filterToDate) {
        const toDate = new Date(filterToDate);
        // Establecer la hora al final del día para incluir la fecha seleccionada
        toDate.setHours(23, 59, 59, 999);
        if (transactionDate > toDate) return false;
      }
      
      return true;
    });
  };

  const getSelectedAccount = () => accounts.find(a => a.accountNumber === selectedAccount);

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f3460', mb: 1 }}>
          Mis Cuentas
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Administra y consulta tus productos bancarios
        </Typography>
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
        <>
        <Grid container spacing={3}>
        {accounts.map((account, index) => (
          <Grid size={{ xs: 12, md: 6 }} key={account.accountNumber}>
            <Box
              onClick={() => setSelectedAccount(account.accountNumber)}
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${account.color} 0%, ${account.color}dd 100%)`,
                color: 'white',
                cursor: 'pointer',
                border: selectedAccount === account.accountNumber ? '3px solid #D4AF37' : '3px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    mr: 2,
                  }}
                >
                  {account.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {account.accountType === 'CHECKING' ? 'Cuenta Corriente' :
                   account.accountType === 'SAVINGS' ? 'Cuenta de Ahorros' :
                   account.accountType === 'CREDIT' ? 'Tarjeta de Crédito' : account.accountType}
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mb: 0.5 }}>
                Número de Cuenta
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                {formatAccountNumber(account.accountNumber)}
              </Typography>

              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 3 }} />

              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mb: 1 }}>
                Saldo Disponible
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {isBalanceVisible(account.accountNumber)
                    ? `$${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : '$ •••••••'
                  }
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => toggleBalanceVisibility(account.accountNumber)}
                  sx={{ color: 'white' }}
                >
                  {isBalanceVisible(account.accountNumber) ? (
                    <Visibility fontSize="small" />
                  ) : (
                    <VisibilityOff fontSize="small" />
                  )}
                </IconButton>
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                USD
              </Typography>

              {account.interestRate && (
                <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUp sx={{ fontSize: 16 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {account.interestRate}% Tasa Anual
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  endIcon={<ArrowForward fontSize="small" />}
                  onClick={() => navigate('/transferencias')}
                  sx={{
                    bgcolor: '#D4AF37',
                    color: '#0f3460',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#B89928',
                    },
                  }}
                >
                  Transferir
                </Button>
                <IconButton
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  <Download />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Información Detallada de la Cuenta Seleccionada */}
      {getSelectedAccount() && (
        <Grid size={12} sx={{ mt: 3 }}>
          <Card sx={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)', borderRadius: 3, border: '1px solid #f0f0f0' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: `${getSelectedAccount()!.color}15`,
                    mr: 2,
                  }}
                >
                  {getSelectedAccount()!.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f3460' }}>
                    {getSelectedAccount()!.accountType === 'CHECKING' ? 'Cuenta Corriente' :
                     getSelectedAccount()!.accountType === 'SAVINGS' ? 'Cuenta de Ahorros' :
                     getSelectedAccount()!.accountType === 'CREDIT' ? 'Tarjeta de Crédito' : getSelectedAccount()!.accountType}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {formatAccountNumber(getSelectedAccount()!.accountNumber)}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <AccountBalanceWallet sx={{ fontSize: 18, color: '#0f3460' }} />
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                        Saldo Actual
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f3460' }}>
                      ${getSelectedAccount()!.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <Info sx={{ fontSize: 18, color: '#0f3460' }} />
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                        Tipo de Cuenta
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f3460' }}>
                      {getSelectedAccount()!.accountType === 'CHECKING' ? 'Cuenta Corriente' :
                       getSelectedAccount()!.accountType === 'SAVINGS' ? 'Cuenta de Ahorros' :
                       getSelectedAccount()!.accountType === 'CREDIT' ? 'Tarjeta de Crédito' : getSelectedAccount()!.accountType}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <CalendarToday sx={{ fontSize: 18, color: '#0f3460' }} />
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                        Total Movimientos
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f3460' }}>
                      {getSelectedAccount()!.movements}
                    </Typography>
                  </Box>
                </Grid>
                {getSelectedAccount()!.interestRate && (
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <TrendingUp sx={{ fontSize: 18, color: '#D4AF37' }} />
                        <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                          Tasa Anual
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#D4AF37' }}>
                        {getSelectedAccount()!.interestRate}%
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}

      <Grid size={12} sx={{ mt: 3 }}>
        <Card sx={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)', borderRadius: 3, border: '1px solid #f0f0f0' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f3460' }}>
                Movimientos - {accounts.find(a => a.accountNumber === selectedAccount)?.accountType === 'CHECKING' ? 'Cuenta Corriente' :
                 accounts.find(a => a.accountNumber === selectedAccount)?.accountType === 'SAVINGS' ? 'Cuenta de Ahorros' :
                 accounts.find(a => a.accountNumber === selectedAccount)?.accountType === 'CREDIT' ? 'Tarjeta de Crédito' : accounts.find(a => a.accountNumber === selectedAccount)?.accountType}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  type="date"
                  size="small"
                  label="Desde"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 160 }}
                />
                <TextField
                  type="date"
                  size="small"
                  label="Hasta"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 160 }}
                />
                <Button
                  size="small"
                  onClick={() => {
                    setFilterFromDate('');
                    setFilterToDate('');
                  }}
                  sx={{
                    color: '#666',
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  Limpiar
                </Button>
                <Button
                  size="small"
                  startIcon={<Download />}
                  sx={{
                    color: '#0f3460',
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  Exportar
                </Button>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#0f3460' }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0f3460' }}>Descripción</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0f3460' }}>Referencia</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#0f3460' }}>Monto</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#0f3460' }}>Saldo</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#0f3460' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getSelectedAccount() && getFilteredTransactions(getSelectedAccount()!).map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      sx={{
                        '&:hover': { bgcolor: '#f8f9fa' },
                        '&:last-child td': { border: 0 },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {transaction.date}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                          {transaction.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          {transaction.reference}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: transaction.amount > 0 ? '#D4AF37' : '#333',
                            }}
                          >
                            {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Typography>
                          {transaction.amount > 0 ? (
                            <TrendingUp sx={{ color: '#D4AF37', fontSize: 16 }} />
                          ) : (
                            <TrendingDown sx={{ color: '#999', fontSize: 16 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          ${transaction.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={transaction.status}
                          size="small"
                          sx={{
                            bgcolor: '#fef3c7',
                            color: '#D4AF37',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
      </>
      )}
    </Layout>
  );
}
