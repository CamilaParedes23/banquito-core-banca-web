import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search,
  AccountBalance,
  AttachMoney,
  MoneyOff,
  Print,
  Clear,
  CheckCircle,
  ErrorOutline,
  Logout,
  Person,
  Schedule,
} from '@mui/icons-material';

interface Account {
  accountNumber: string;
  clientName: string;
  clientId: string;
  accountType: string;
  balance: number;
  status: string;
}

export default function TellerModule() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeOperation, setActiveOperation] = useState<'deposit' | 'withdraw' | null>(null);
  const [amount, setAmount] = useState('');
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const currentTime = new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError('Debe ingresar número de cuenta o cédula');
      return;
    }

    setLoading(true);
    setError('');
    setAccount(null);

    setTimeout(() => {
      const mockAccount: Account = {
        accountNumber: searchValue.length > 10 ? searchValue : '2100123456',
        clientName: 'PÉREZ LÓPEZ JUAN CARLOS',
        clientId: '1234567890',
        accountType: 'CUENTA DE AHORROS',
        balance: 5420.75,
        status: 'ACTIVA',
      };
      setAccount(mockAccount);
      setLoading(false);
    }, 600);
  };

  const handleNumberClick = (num: string) => {
    if (num === 'C') {
      setAmount('');
    } else if (num === '.') {
      if (!amount.includes('.')) {
        setAmount(amount + num);
      }
    } else {
      setAmount(amount + num);
    }
  };

  const handleTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Monto inválido');
      return;
    }

    if (activeOperation === 'withdraw' && parseFloat(amount) > (account?.balance || 0)) {
      setError('FONDOS INSUFICIENTES');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const txId = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
      setTransactionId(txId);
      setTransactionSuccess(true);
      setLoading(false);

      if (account) {
        const newBalance = activeOperation === 'deposit'
          ? account.balance + parseFloat(amount)
          : account.balance - parseFloat(amount);
        setAccount({ ...account, balance: newBalance });
      }
    }, 800);
  };

  const handlePrint = () => {
    window.print();
    resetTransaction();
  };

  const resetTransaction = () => {
    setTransactionSuccess(false);
    setAmount('');
    setActiveOperation(null);
    setError('');
  };

  const resetAll = () => {
    setSearchValue('');
    setAccount(null);
    setAmount('');
    setError('');
    setActiveOperation(null);
    setTransactionSuccess(false);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#1a1a2e',
      p: 0,
      overflow: 'hidden',
    }}>
      {/* Header Bancario Profesional */}
      <Box sx={{
        bgcolor: '#0f3460',
        color: 'white',
        p: 2,
        borderBottom: '4px solid #D4AF37',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AccountBalance sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              BANCO BANQUITO
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Sistema de Ventanilla - Versión 2.0
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule fontSize="small" />
              {currentTime}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'capitalize' }}>
              {currentDate}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Cajero: MARÍA GONZÁLEZ
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Terminal: VNT-001 | Sucursal Centro
            </Typography>
          </Box>
          <Button
            color="inherit"
            startIcon={<Logout />}
            onClick={() => {
              if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
                window.location.reload();
              }
            }}
            sx={{
              borderLeft: '1px solid rgba(255,255,255,0.2)',
              pl: 2,
              borderRadius: 0,
            }}
          >
            Salir
          </Button>
        </Box>
      </Box>

      <Grid container sx={{ height: 'calc(100vh - 88px)' }} spacing={0}>
        {/* Panel Izquierdo - Búsqueda y Datos del Cliente */}
        <Grid size={7} sx={{ bgcolor: '#16213e', p: 3, borderRight: '2px solid #0f3460' }}>
          {/* Búsqueda */}
          <Paper sx={{
            p: 3,
            mb: 2,
            bgcolor: '#0f3460',
            border: '2px solid #D4AF37',
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 600 }}>
              BÚSQUEDA DE CUENTA
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="NÚMERO DE CUENTA O CÉDULA"
                disabled={loading || !!account}
                sx={{
                  bgcolor: 'white',
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading || !!account}
                startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                sx={{
                  minWidth: 140,
                  bgcolor: '#D4AF37',
                  color: '#0f3460',
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: '#B89928',
                  },
                }}
              >
                BUSCAR
              </Button>
              {account && (
                <Button
                  variant="outlined"
                  onClick={resetAll}
                  startIcon={<Clear />}
                  sx={{
                    minWidth: 140,
                    color: 'white',
                    borderColor: 'white',
                  }}
                >
                  LIMPIAR
                </Button>
              )}
            </Box>
          </Paper>

          {error && !account && (
            <Alert
              severity="error"
              icon={<ErrorOutline />}
              sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}
            >
              {error}
            </Alert>
          )}

          {/* Información del Cliente */}
          {account && !transactionSuccess && (
            <Paper sx={{
              p: 3,
              bgcolor: 'white',
              border: account.status === 'ACTIVA' ? '3px solid #4caf50' : '3px solid #f44336',
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f3460' }}>
                  INFORMACIÓN DEL CLIENTE
                </Typography>
                <Box sx={{
                  bgcolor: account.status === 'ACTIVA' ? '#4caf50' : '#f44336',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <CheckCircle fontSize="small" />
                  {account.status}
                </Box>
              </Box>

              <Divider sx={{ mb: 2, borderWidth: 2 }} />

              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', bgcolor: '#f5f5f5', width: '40%' }}>
                      TITULAR:
                    </TableCell>
                    <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>
                      {account.clientName}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', bgcolor: '#f5f5f5' }}>
                      CÉDULA:
                    </TableCell>
                    <TableCell sx={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'monospace' }}>
                      {account.clientId}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', bgcolor: '#f5f5f5' }}>
                      TIPO DE CUENTA:
                    </TableCell>
                    <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>
                      {account.accountType}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', bgcolor: '#f5f5f5' }}>
                      NÚMERO DE CUENTA:
                    </TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace', color: '#0f3460' }}>
                      {account.accountNumber}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Box sx={{
                mt: 3,
                p: 3,
                bgcolor: '#0f3460',
                borderRadius: 2,
                textAlign: 'center',
              }}>
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.9, mb: 1 }}>
                  SALDO DISPONIBLE
                </Typography>
                <Typography variant="h3" sx={{
                  color: '#D4AF37',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  letterSpacing: 2,
                }}>
                  ${account.balance.toFixed(2)}
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Comprobante */}
          {transactionSuccess && account && (
            <Paper sx={{
              p: 4,
              bgcolor: 'white',
              border: '3px solid #4caf50',
            }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50', mb: 1 }}>
                  TRANSACCIÓN EXITOSA
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Operación procesada correctamente
                </Typography>
              </Box>

              <Divider sx={{ my: 3, borderWidth: 2 }} />

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0f3460' }}>
                COMPROBANTE DE {activeOperation === 'deposit' ? 'DEPÓSITO' : 'RETIRO'}
              </Typography>

              <Table size="small" sx={{ mb: 3 }}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>
                      No. TRANSACCIÓN:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1.1rem' }}>
                      {transactionId}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>FECHA Y HORA:</TableCell>
                    <TableCell>{new Date().toLocaleString('es-EC')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>CLIENTE:</TableCell>
                    <TableCell>{account.clientName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>CUENTA:</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {account.accountNumber}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>OPERACIÓN:</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {activeOperation === 'deposit' ? 'DEPÓSITO EN EFECTIVO' : 'RETIRO EN EFECTIVO'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>MONTO:</TableCell>
                    <TableCell sx={{
                      fontSize: '1.3rem',
                      fontWeight: 900,
                      color: '#0f3460',
                      fontFamily: 'monospace',
                    }}>
                      ${parseFloat(amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#0f3460', color: 'white' }}>
                      NUEVO SALDO:
                    </TableCell>
                    <TableCell sx={{
                      fontSize: '1.3rem',
                      fontWeight: 900,
                      color: '#4caf50',
                      fontFamily: 'monospace',
                      bgcolor: '#f5f5f5',
                    }}>
                      ${account.balance.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<Print />}
                  onClick={handlePrint}
                  sx={{
                    bgcolor: '#0f3460',
                    fontWeight: 700,
                    py: 1.5,
                  }}
                >
                  IMPRIMIR
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={resetTransaction}
                  sx={{
                    borderColor: '#0f3460',
                    color: '#0f3460',
                    fontWeight: 700,
                    py: 1.5,
                  }}
                >
                  NUEVA OPERACIÓN
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Panel Derecho - Operaciones */}
        <Grid size={5} sx={{ bgcolor: '#1a1a2e', p: 3 }}>
          {account && !transactionSuccess ? (
            <>
              {/* Selección de Operación */}
              {!activeOperation && (
                <Box>
                  <Typography variant="h5" sx={{ color: 'white', mb: 3, fontWeight: 700 }}>
                    SELECCIONE OPERACIÓN
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        border: '3px solid transparent',
                        '&:hover': {
                          border: '3px solid #4caf50',
                          transform: 'scale(1.02)',
                        }
                      }}
                      onClick={() => setActiveOperation('deposit')}
                    >
                      <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <AttachMoney sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                          DEPÓSITO
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Depósito en efectivo
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                          Afecta cuenta: 1.1.0.02 - Bóveda Central
                        </Typography>
                      </CardContent>
                    </Card>

                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        border: '3px solid transparent',
                        '&:hover': {
                          border: '3px solid #ff9800',
                          transform: 'scale(1.02)',
                        }
                      }}
                      onClick={() => setActiveOperation('withdraw')}
                    >
                      <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <MoneyOff sx={{ fontSize: 80, color: '#ff9800', mb: 2 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                          RETIRO
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Retiro en efectivo
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                          Afecta cuenta: 1.1.0.02 - Bóveda Central
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              )}

              {/* Ingreso de Monto */}
              {activeOperation && (
                <Box>
                  <Box sx={{
                    bgcolor: activeOperation === 'deposit' ? '#4caf50' : '#ff9800',
                    color: 'white',
                    p: 2,
                    borderRadius: 2,
                    mb: 3,
                    textAlign: 'center',
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {activeOperation === 'deposit' ? 'DEPÓSITO EN EFECTIVO' : 'RETIRO EN EFECTIVO'}
                    </Typography>
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}>
                      {error}
                    </Alert>
                  )}

                  <Paper sx={{ p: 3, mb: 3, bgcolor: '#0f3460' }}>
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.8, mb: 1 }}>
                      MONTO A {activeOperation === 'deposit' ? 'DEPOSITAR' : 'RETIRAR'}
                    </Typography>
                    <Typography variant="h2" sx={{
                      color: '#D4AF37',
                      fontWeight: 900,
                      fontFamily: 'monospace',
                      letterSpacing: 2,
                      minHeight: 60,
                    }}>
                      ${amount || '0.00'}
                    </Typography>
                  </Paper>

                  {/* Teclado Numérico */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'C'].map((num) => (
                      <Grid size={4} key={num}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleNumberClick(num)}
                          sx={{
                            height: 70,
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            bgcolor: num === 'C' ? '#f44336' : '#D4AF37',
                            color: '#0f3460',
                            '&:hover': {
                              bgcolor: num === 'C' ? '#d32f2f' : '#B89928',
                            },
                          }}
                        >
                          {num}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleTransaction}
                      disabled={loading || !amount || parseFloat(amount) <= 0}
                      sx={{
                        bgcolor: '#4caf50',
                        fontWeight: 700,
                        py: 2,
                        fontSize: '1.1rem',
                        '&:hover': {
                          bgcolor: '#388e3c',
                        },
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'PROCESAR'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => {
                        setActiveOperation(null);
                        setAmount('');
                        setError('');
                      }}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        fontWeight: 700,
                        py: 2,
                        minWidth: 120,
                      }}
                    >
                      CANCELAR
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}>
              <Box sx={{ textAlign: 'center', color: 'white', opacity: 0.5 }}>
                <Person sx={{ fontSize: 120, mb: 2 }} />
                <Typography variant="h6">
                  {transactionSuccess ? 'Operación completada' : 'Busque un cliente para iniciar'}
                </Typography>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
