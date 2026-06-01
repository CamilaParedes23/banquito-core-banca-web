import { useState } from 'react';
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import Layout from '../components/Layout';

interface Transaction {
  id: number;
  date: string;
  description: string;
  reference: string;
  amount: number;
  balance: number;
  status: string;
}

interface Account {
  id: number;
  name: string;
  number: string;
  balance: number;
  type: string;
  icon: JSX.Element;
  color: string;
  movements: number;
  interestRate?: number;
  transactions: Transaction[];
}

export default function Accounts() {
  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState(1);
  const [balanceVisibility, setBalanceVisibility] = useState<Record<number, boolean>>({});

  const accounts: Account[] = [
    {
      id: 1,
      name: 'Cuenta Corriente',
      number: '3001234521',
      balance: 5230.50,
      type: 'Corriente',
      icon: <AccountBalance />,
      color: '#0f3460',
      movements: 245,
      transactions: [
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
    },
    {
      id: 2,
      name: 'Cuenta de Ahorros',
      number: '2001237823',
      balance: 12840.00,
      type: 'Ahorros',
      icon: <Savings />,
      color: '#D4AF37',
      movements: 89,
      interestRate: 4.5,
      transactions: [
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
    },
  ];

  const toggleBalanceVisibility = (accountId: number) => {
    setBalanceVisibility(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const isBalanceVisible = (accountId: number) => {
    return balanceVisibility[accountId] !== false;
  };

  const formatAccountNumber = (accountNumber: string) => {
    const lastFour = accountNumber.slice(-4);
    return `Nº ********${lastFour}`;
  };

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

      <Grid container spacing={3}>
        {accounts.map((account, index) => (
          <Grid size={{ xs: 12, md: 6 }} key={account.id}>
            <Box
              onClick={() => setSelectedAccount(account.id)}
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${account.color} 0%, ${account.color}dd 100%)`,
                color: 'white',
                cursor: 'pointer',
                border: selectedAccount === account.id ? '3px solid #D4AF37' : '3px solid transparent',
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
                  {account.type}
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mb: 0.5 }}>
                Número de Cuenta
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                {formatAccountNumber(account.number)}
              </Typography>

              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 3 }} />

              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mb: 1 }}>
                Saldo Disponible
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {isBalanceVisible(account.id)
                    ? `$${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : '$ •••••••'
                  }
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => toggleBalanceVisibility(account.id)}
                  sx={{ color: 'white' }}
                >
                  {isBalanceVisible(account.id) ? (
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

      <Grid size={12} sx={{ mt: 3 }}>
        <Card sx={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)', borderRadius: 3, border: '1px solid #f0f0f0' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f3460' }}>
                Últimos Movimientos - {accounts.find(a => a.id === selectedAccount)?.name}
              </Typography>
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
                  {accounts.find(a => a.id === selectedAccount)?.transactions.map((transaction) => (
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
    </Layout>
  );
}
