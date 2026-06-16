import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { CheckCircle, ContentCopy, ErrorOutline, PictureAsPdf, Print, ReceiptLong, SwapHoriz } from '@mui/icons-material';
import Layout from '../components/Layout';
import AccountNumberDisplay from '../components/AccountNumberDisplay';
import { accountService } from '../services/account.service';
import { getFriendlyApiError } from '../services/http.service';
import { sessionService } from '../services/session.service';
import type {
  AccountOwnerResponse,
  AccountResponse,
  P2PTransferResponse,
} from '../types/account.types';
import {
  formatCurrency,
  formatDateTime,
  getAccountLabel,
  humanizeStatus,
  getAccountProductLabel,
} from '../utils/formatters';
import { downloadTransferReceiptPdf, printTransferReceipt, type TransferReceiptData } from '../utils/transferReceipt';

interface LocationState {
  sourceAccount?: string;
}

const activeStatus = (status: string): boolean => ['ACTIVA', 'ACTIVE'].includes(status.toUpperCase());
const createIdempotencyKey = (): string =>
  globalThis.crypto?.randomUUID?.() ||
  `p2p-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const beneficiaryLabel = (beneficiary: AccountOwnerResponse): string =>
  beneficiary.holderName?.trim() || 'Titular pendiente de validación por el Core';

export default function Transfers() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = sessionService.get();
  const customerUuid = session?.profile.customerUuid || '';
  const requestedSource = (location.state as LocationState | null)?.sourceAccount || '';
  const submissionLock = useRef(false);
  const idempotencyKeyRef = useRef('');

  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [sourceAccount, setSourceAccount] = useState(requestedSource);
  const [targetAccount, setTargetAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [beneficiary, setBeneficiary] = useState<AccountOwnerResponse | null>(null);
  const [result, setResult] = useState<P2PTransferResponse | null>(null);
  const [step, setStep] = useState(0);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.accountNumber === sourceAccount),
    [accounts, sourceAccount],
  );

  const loadAccounts = async () => {
    setLoadingAccounts(true);
    setError('');
    try {
      const data = await accountService.getAccountsByCustomer(customerUuid, {
        onlyTransferable: true,
        includeBalance: true,
      });
      const transferable = data.filter((account) => activeStatus(account.status));
      setAccounts(transferable);
      setSourceAccount((current) =>
        transferable.some((account) => account.accountNumber === current)
          ? current
          : transferable[0]?.accountNumber || '',
      );
    } catch (requestError) {
      setError(getFriendlyApiError(requestError));
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    void loadAccounts();
  }, [customerUuid]);

  const validateForm = (): string | null => {
    if (!sourceAccount) return 'Selecciona la cuenta de origen.';
    if (!/^\d+$/.test(targetAccount.trim())) return 'Ingresa un número de cuenta destino válido.';
    if (sourceAccount === targetAccount.trim()) return 'La cuenta destino debe ser diferente a la cuenta origen.';
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return 'Ingresa un monto mayor a cero.';
    if (selectedAccount && parsedAmount > selectedAccount.availableBalance) return 'El saldo disponible no cubre el monto de la transferencia.';
    if (!reference.trim()) return 'Ingresa el concepto o referencia de la transferencia.';
    return null;
  };

  const validateBeneficiary = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setValidating(true);
    setError('');
    try {
      const preview = await accountService.getBeneficiaryPreview(targetAccount.trim());
      if (preview.verified && !activeStatus(preview.status)) {
        setError('La cuenta destino no se encuentra activa para recibir transferencias.');
        return;
      }
      setBeneficiary(preview);
      idempotencyKeyRef.current = createIdempotencyKey();
      setStep(1);
    } catch (requestError) {
      setBeneficiary(null);
      setError(getFriendlyApiError(requestError));
    } finally {
      setValidating(false);
    }
  };

  const submitTransfer = async () => {
    if (!selectedAccount || !beneficiary || submissionLock.current) return;
    submissionLock.current = true;
    setSubmitting(true);
    setError('');
    try {
      const transfer = await accountService.transferP2P(
        {
          sourceAccountNumber: selectedAccount.accountNumber,
          targetAccountNumber: beneficiary.accountNumber,
          amount: Number(amount),
          reference: reference.trim(),
        },
        idempotencyKeyRef.current || undefined,
      );
      setResult(transfer);
      setStep(2);
    } catch (requestError) {
      setError(getFriendlyApiError(requestError));
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  };

  const reset = async () => {
    setStep(0);
    setTargetAccount('');
    setAmount('');
    setReference('');
    setBeneficiary(null);
    setResult(null);
    idempotencyKeyRef.current = '';
    setError('');
    await loadAccounts();
  };

  const buildReceiptData = (): TransferReceiptData | null => {
    if (!result || !beneficiary || !selectedAccount) return null;
    return {
      transactionReference: result.transactionUuid,
      correlationId: result.correlationId,
      timestamp: result.timestamp,
      status: result.status,
      sourceHolder: selectedAccount.holderName || session?.profile.username || 'Titular de la cuenta',
      sourceAccountNumber: selectedAccount.accountNumber,
      sourceProduct: getAccountProductLabel(selectedAccount),
      beneficiaryName: beneficiaryLabel(beneficiary),
      targetAccountNumber: beneficiary.accountNumber,
      targetBank: 'Banco BanQuito',
      amount: result.amount,
      fee: result.fee ?? 0,
      reference,
      newAvailableBalance: result.newBalance,
      channel: 'Banca Web Personas',
    };
  };

  const downloadReceipt = async () => {
    const receipt = buildReceiptData();
    if (receipt) await downloadTransferReceiptPdf(receipt);
  };

  const printReceipt = () => {
    const receipt = buildReceiptData();
    if (receipt) printTransferReceipt(receipt);
  };

  const copyTransactionReference = async () => {
    if (!result?.transactionUuid) return;
    try {
      await navigator.clipboard.writeText(result.transactionUuid);
    } catch {
      // La referencia permanece visible para copia manual si el navegador bloquea el portapapeles.
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#123f70', mb: 0.5 }}>Transferencia P2P</Typography>
        <Typography color="text.secondary">Transferencias uno a uno entre cuentas de Banco BanQuito.</Typography>
      </Box>

      <Card sx={{ maxWidth: 920, mx: 'auto', border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stepper activeStep={step} sx={{ mb: 4 }}>
            {['Datos', 'Confirmación', 'Comprobante'].map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>

          {error && <Alert severity="error" icon={<ErrorOutline />} sx={{ mb: 3 }}>{error}</Alert>}

          {loadingAccounts ? (
            <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /><Typography color="text.secondary" sx={{ mt: 2 }}>Cargando cuentas habilitadas…</Typography></Box>
          ) : accounts.length === 0 ? (
            <Alert severity="info">No tienes cuentas activas habilitadas para transferencias P2P.</Alert>
          ) : step === 0 ? (
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Cuenta origen</InputLabel>
                  <Select value={sourceAccount} label="Cuenta origen" onChange={(event) => setSourceAccount(event.target.value)}>
                    {accounts.map((account) => <MenuItem key={account.accountNumber} value={account.accountNumber}>{getAccountLabel(account)} · {account.accountNumber.slice(-4)} · Disponible {formatCurrency(account.availableBalance)}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <TextField
                  fullWidth
                  label="Cuenta destino"
                  value={targetAccount}
                  onChange={(event) => setTargetAccount(event.target.value.replace(/\D/g, ''))}
                  inputProps={{ inputMode: 'numeric' }}
                  helperText="Ingresa el número completo. Podrás revisarlo nuevamente antes de confirmar."
                />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  label="Monto"
                  value={amount}
                  onChange={(event) => {
                    const nextValue = event.target.value.replace(',', '.');
                    if (/^\d*(\.\d{0,2})?$/.test(nextValue)) setAmount(nextValue);
                  }}
                  inputProps={{ inputMode: 'decimal' }}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  helperText="Dólares de los Estados Unidos (USD)"
                />
              </Grid>
              <Grid size={{ xs: 12 }}><TextField fullWidth label="Concepto o referencia" value={reference} onChange={(event) => setReference(event.target.value)} inputProps={{ maxLength: 140 }} helperText={`${reference.length}/140`} /></Grid>
              {selectedAccount && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info">Saldo disponible de la cuenta origen: <strong>{formatCurrency(selectedAccount.availableBalance)}</strong></Alert>
                </Grid>
              )}
              <Grid size={{ xs: 12 }}><Box sx={{ display: 'flex', justifyContent: 'flex-end' }}><Button variant="contained" size="large" startIcon={<SwapHoriz />} onClick={validateBeneficiary} disabled={validating || submitting} sx={{ bgcolor: '#123f70' }}>{validating ? 'Validando destinatario…' : 'Continuar'}</Button></Box></Grid>
            </Grid>
          ) : step === 1 && beneficiary && selectedAccount ? (
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Revisa antes de confirmar</Typography>
              <Card variant="outlined"><CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">Cuenta origen</Typography>
                    <Typography fontWeight={750}>{getAccountLabel(selectedAccount)}</Typography>
                    <AccountNumberDisplay value={selectedAccount.accountNumber} compact={false} fontWeight={650} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">Cuenta destino</Typography>
                    <Typography fontWeight={750}>{beneficiaryLabel(beneficiary)}</Typography>
                    <AccountNumberDisplay value={beneficiary.accountNumber} compact={false} fontWeight={650} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}><Typography variant="caption" color="text.secondary">Monto</Typography><Typography variant="h5" fontWeight={850} color="#123f70">{formatCurrency(Number(amount))}</Typography></Grid>
                  <Grid size={{ xs: 12, md: 6 }}><Typography variant="caption" color="text.secondary">Referencia</Typography><Typography fontWeight={650}>{reference}</Typography></Grid>
                </Grid>
              </CardContent></Card>
              <Alert severity={beneficiary.verified ? 'warning' : 'info'} sx={{ mt: 2.5 }}>
                {beneficiary.verified
                  ? 'Verifica el beneficiario, el monto y ambos números de cuenta. Usa el ícono del ojo para mostrar el número completo antes de confirmar.'
                  : 'El Core todavía no expone el titular de cuentas de terceros. Verifica el número completo con el ícono del ojo; el Core validará existencia y estado al confirmar.'}
              </Alert>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}><Button onClick={() => setStep(0)} disabled={submitting}>Regresar</Button><Button variant="contained" onClick={submitTransfer} disabled={submitting} sx={{ bgcolor: '#123f70' }}>{submitting ? 'Procesando transferencia…' : 'Confirmar transferencia'}</Button></Box>
            </Box>
          ) : step === 2 && result && beneficiary && selectedAccount ? (
            <Box sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 72, color: 'success.main', mb: 1.5 }} />
              <Typography variant="h5" fontWeight={850}>Transferencia procesada</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                La operación fue registrada correctamente. Conserva el comprobante para cualquier consulta.
              </Typography>

              <Card variant="outlined" sx={{ textAlign: 'left', maxWidth: 760, mx: 'auto', borderColor: '#dce3ea' }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Estado</Typography>
                      <Typography fontWeight={800} color="success.main">{humanizeStatus(result.status) || 'Procesada'}</Typography>
                    </Box>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography variant="caption" color="text.secondary">Fecha y hora</Typography>
                      <Typography fontWeight={700}>{formatDateTime(result.timestamp)}</Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2.5 }} />
                  <Typography variant="subtitle1" fontWeight={850} color="#123f70" sx={{ mb: 1.5 }}>Cuenta de origen</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" color="text.secondary">Titular</Typography>
                      <Typography fontWeight={700}>{selectedAccount.holderName || session?.profile.username || 'Titular de la cuenta'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" color="text.secondary">Cuenta</Typography>
                      <AccountNumberDisplay value={selectedAccount.accountNumber} compact={false} fontWeight={700} />
                    </Grid>
                    {getAccountProductLabel(selectedAccount) && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" color="text.secondary">Producto</Typography>
                        <Typography fontWeight={650}>{getAccountProductLabel(selectedAccount)}</Typography>
                      </Grid>
                    )}
                  </Grid>

                  <Divider sx={{ my: 2.5 }} />
                  <Typography variant="subtitle1" fontWeight={850} color="#123f70" sx={{ mb: 1.5 }}>Cuenta de destino</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" color="text.secondary">Beneficiario</Typography>
                      <Typography fontWeight={700}>{beneficiaryLabel(beneficiary)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" color="text.secondary">Cuenta</Typography>
                      <AccountNumberDisplay value={beneficiary.accountNumber} compact={false} fontWeight={700} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" color="text.secondary">Institución financiera</Typography>
                      <Typography fontWeight={650}>Banco BanQuito</Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2.5, p: 2.5, borderRadius: 2.5, bgcolor: '#f6f8fb' }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" color="text.secondary">Monto transferido</Typography>
                        <Typography variant="h6" fontWeight={850} color="#123f70">{formatCurrency(result.amount)}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" color="text.secondary">Comisión</Typography>
                        <Typography variant="h6" fontWeight={800}>{formatCurrency(result.fee ?? 0)}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" color="text.secondary">Total debitado</Typography>
                        <Typography variant="h6" fontWeight={850}>{formatCurrency(result.amount + (result.fee ?? 0))}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 7 }}>
                        <Typography variant="caption" color="text.secondary">Concepto o referencia</Typography>
                        <Typography fontWeight={650}>{reference || 'Sin referencia'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 5 }}>
                        <Typography variant="caption" color="text.secondary">Nuevo saldo disponible</Typography>
                        <Typography fontWeight={800} color="success.main">
                          {result.newBalance !== undefined ? formatCurrency(result.newBalance) : 'Consulta tu saldo actualizado'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 2.5 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Referencia de transacción</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontFamily="monospace" fontSize="0.88rem" sx={{ wordBreak: 'break-all', flex: 1 }}>
                        {result.transactionUuid}
                      </Typography>
                      <Tooltip title="Copiar referencia">
                        <Button size="small" onClick={copyTransactionReference} startIcon={<ContentCopy fontSize="small" />}>Copiar</Button>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 3, flexWrap: 'wrap' }}>
                <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={downloadReceipt}>Descargar PDF</Button>
                <Button variant="outlined" startIcon={<Print />} onClick={printReceipt}>Imprimir</Button>
                <Button variant="outlined" startIcon={<ReceiptLong />} onClick={() => navigate('/cuentas', { state: { accountNumber: selectedAccount.accountNumber } })}>Ver movimientos</Button>
                <Button variant="contained" onClick={reset} sx={{ bgcolor: '#123f70' }}>Nueva transferencia</Button>
              </Box>
            </Box>
          ) : null}
        </CardContent>
      </Card>
    </Layout>
  );
}
