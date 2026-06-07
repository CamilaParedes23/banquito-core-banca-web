import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import {
  SwapHoriz,
  AccountBalance,
  Receipt,
  CheckCircle,
  ErrorOutline,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { apiService, getErrorMessage, Account, TransferResponse } from '../services/api';

export default function Transfers() {
  const [activeStep, setActiveStep] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos del formulario
  const [sourceAccount, setSourceAccount] = useState('');
  const [destinationAccount, setDestinationAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [reference, setReference] = useState('');

  // Validación de destinatario
  const [destinationHolder, setDestinationHolder] = useState('');
  const [validatingDestination, setValidatingDestination] = useState(false);

  // Resultado de transferencia
  const [transferResult, setTransferResult] = useState<TransferResponse | null>(null);

  const steps = ['Ingresar Datos', 'Validar Destinatario', 'Confirmar', 'Comprobante'];

  const customerId = localStorage.getItem('actor_uuid') || 'CUST-001';

  // Cargar cuentas del usuario al iniciar
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAccounts(customerId);
      // Filtrar solo cuentas activas con saldo disponible
      const filteredAccounts = response.accounts.filter(acc => acc.status === 'ACTIVE' || acc.status === 'ACTIVA');
      setAccounts(filteredAccounts);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Validar destinatario antes de continuar al siguiente paso
  const validateDestination = async () => {
    if (!destinationAccount || destinationAccount.length < 10) {
      setError('Por favor, ingresa un número de cuenta válido (mínimo 10 dígitos)');
      return;
    }

    setValidatingDestination(true);
    setError(null);

    try {
      const response = await apiService.getAccountHolder(destinationAccount);
      setDestinationHolder(response.holderName);
      setActiveStep(2); // Ir directamente a confirmación
    } catch (err) {
      setError(getErrorMessage(err));
      setActiveStep(0); // Volver al formulario si hay error
    } finally {
      setValidatingDestination(false);
    }
  };

  // Procesar transferencia
  const processTransfer = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiService.createTransfer({
        sourceAccount,
        destinationAccount,
        amount: parseFloat(amount),
        concept,
        reference: reference || undefined,
      });

      setTransferResult(result);
      setActiveStep(3); // Ir a comprobante
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setError(null);

    if (activeStep === 0) {
      // Validar formulario
      if (!sourceAccount) {
        setError('Selecciona una cuenta de origen');
        return;
      }
      if (!destinationAccount) {
        setError('Ingresa el número de cuenta destino');
        return;
      }
      if (!amount || parseFloat(amount) <= 0) {
        setError('Ingresa un monto válido mayor a cero');
        return;
      }

      const selectedAccount = accounts.find(acc => acc.accountNumber === sourceAccount);
      if (selectedAccount && parseFloat(amount) > selectedAccount.availableBalance) {
        setError('Saldo insuficiente en la cuenta seleccionada');
        return;
      }

      if (!concept) {
        setError('Ingresa el concepto de la transferencia');
        return;
      }

      // Validar destinatario
      setActiveStep(1);
      validateDestination();
    } else if (activeStep === 2) {
      // Confirmar y procesar transferencia
      processTransfer();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (activeStep === 2) {
      setActiveStep(0); // Volver al formulario
      setDestinationHolder('');
    } else {
      setActiveStep((prev) => prev - 1);
    }
  };

  const resetForm = () => {
    setActiveStep(0);
    setSourceAccount('');
    setDestinationAccount('');
    setAmount('');
    setConcept('');
    setReference('');
    setDestinationHolder('');
    setTransferResult(null);
    setError(null);
    fetchAccounts(); // Recargar saldos actualizados
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0066CC', mb: 1 }}>
          Transferencias P2P
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Envía dinero de forma rápida y segura
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} icon={<ErrorOutline />} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#0066CC', mb: 3 }}>
                    Datos de la transferencia
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Cuenta de Origen *</InputLabel>
                        <Select
                          value={sourceAccount}
                          onChange={(e) => setSourceAccount(e.target.value)}
                          label="Cuenta de Origen *"
                        >
                          {accounts.map((account) => (
                            <MenuItem key={account.accountNumber} value={account.accountNumber}>
                              {account.accountType === 'CHECKING' ? 'Cuenta Corriente' :
                               account.accountType === 'SAVINGS' ? 'Cuenta de Ahorros' :
                               account.accountType === 'CREDIT' ? 'Tarjeta de Crédito' : account.accountType} - {account.accountNumber} -
                              Disponible: ${(account.availableBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} {account.currency}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Número de Cuenta Destino *"
                        placeholder="Ingresa el número de cuenta (16 dígitos)"
                        value={destinationAccount}
                        onChange={(e) => setDestinationAccount(e.target.value.replace(/\D/g, ''))}
                        inputProps={{ maxLength: 18 }}
                        helperText="Ejemplo: 9876543210987654"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Monto *"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                        }}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Concepto *"
                        placeholder="Describe el motivo de la transferencia"
                        value={concept}
                        onChange={(e) => setConcept(e.target.value)}
                        inputProps={{ maxLength: 100 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Referencia numérica (opcional)"
                        placeholder="1234567"
                        value={reference}
                        onChange={(e) => setReference(e.target.value.replace(/\D/g, ''))}
                        inputProps={{ maxLength: 7 }}
                      />
                    </Grid>
                  </Grid>
                  <Alert severity="info" sx={{ mt: 3 }}>
                    <strong>Nota:</strong> Verifica que los datos sean correctos antes de continuar.
                    Se validará el destinatario antes de procesar la transferencia.
                  </Alert>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={loading}
                      sx={{ bgcolor: '#10B981', px: 4 }}
                    >
                      Continuar
                    </Button>
                  </Box>
                </Box>
              )}

              {activeStep === 1 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CircularProgress size={60} sx={{ color: '#0066CC', mb: 3 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#0066CC', mb: 1 }}>
                    Validando destinatario...
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Por favor espera mientras verificamos los datos de la cuenta destino
                  </Typography>
                </Box>
              )}

              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#0066CC', mb: 3 }}>
                    Confirma los datos de tu transferencia
                  </Typography>

                  {destinationHolder && (
                    <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Destinatario verificado: {destinationHolder}
                      </Typography>
                      <Typography variant="caption">
                        Verifica que sea la persona correcta antes de continuar
                      </Typography>
                    </Alert>
                  )}

                  <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 3, mb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#999' }}>Cuenta Origen</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {sourceAccount}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#999' }}>Cuenta Destino</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{destinationAccount}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" sx={{ color: '#999' }}>Beneficiario</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0066CC' }}>
                          {destinationHolder}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#999' }}>Monto</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0066CC' }}>
                          ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#999' }}>Comisión</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>$0.00</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" sx={{ color: '#999' }}>Concepto</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{concept}</Typography>
                      </Grid>
                      {reference && (
                        <Grid item xs={12}>
                          <Typography variant="caption" sx={{ color: '#999' }}>Referencia</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{reference}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <strong>Importante:</strong> Verifica que todos los datos sean correctos.
                    Esta operación no se puede cancelar una vez confirmada.
                  </Alert>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button onClick={handleBack} disabled={loading}>
                      Modificar Datos
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={loading}
                      sx={{ bgcolor: '#10B981', px: 4 }}
                    >
                      {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Confirmar Transferencia'}
                    </Button>
                  </Box>
                </Box>
              )}

              {activeStep === 3 && transferResult && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircle sx={{ fontSize: 80, color: '#10B981', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#0066CC', mb: 1 }}>
                    ¡Transferencia Exitosa!
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
                    Tu transferencia ha sido procesada correctamente
                  </Typography>
                  <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 3, mb: 3, textAlign: 'left' }}>
                    <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                      Número de Operación
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0066CC', mb: 2 }}>
                      {transferResult.transactionId?.substring(0, 8).toUpperCase()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                      Fecha y Hora
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                      {new Date(transferResult.timestamp).toLocaleString('es-EC', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                      Beneficiario
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {destinationHolder}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                      Monto Transferido
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0066CC', mb: 2 }}>
                      ${(transferResult.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                      Nuevo Saldo
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#10B981' }}>
                      ${(transferResult.newBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<Receipt />}
                      sx={{ borderColor: '#0066CC', color: '#0066CC' }}
                    >
                      Descargar Comprobante
                    </Button>
                    <Button
                      variant="contained"
                      sx={{ bgcolor: '#10B981' }}
                      onClick={resetForm}
                    >
                      Nueva Transferencia
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}
