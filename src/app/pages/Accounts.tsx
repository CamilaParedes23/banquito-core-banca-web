import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Download,
  FilterAltOff,
  Refresh,
  SwapHoriz,
  ViewAgenda,
  ViewList,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import AccountNumberDisplay from '../components/AccountNumberDisplay';
import AccountRail from '../components/AccountRail';
import { accountService } from '../services/account.service';
import { getFriendlyApiError } from '../services/http.service';
import { sessionService } from '../services/session.service';
import type { AccountResponse, TransactionResponse } from '../types/account.types';
import {
  formatCurrency,
  formatDateOnly,
  formatDateTime,
  formatTimeOnly,
  getAccountBranchLabel,
  getAccountLabel,
  getAccountProductLabel,
  getAccountPurposeLabel,
  getMovementTypeLabel,
  getStatusPresentation,
  getTransactionChannelLabel,
  getTransactionLabel,
  humanizeStatus,
  maskAccountNumber,
} from '../utils/formatters';

interface LocationState {
  accountNumber?: string;
}

const escapeCsv = (value: unknown): string => `"${String(value ?? '').replace(/"/g, '""')}"`;

export default function Accounts() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialAccount = (location.state as LocationState | null)?.accountNumber || '';
  const session = sessionService.get();
  const customerUuid = session?.profile.customerUuid || '';
  const canTransfer = session?.profile.scopes.includes('core.account.transfer.p2p') ?? false;

  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [selectedAccountNumber, setSelectedAccountNumber] = useState(initialAccount);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [showBalances, setShowBalances] = useState(true);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.accountNumber === selectedAccountNumber),
    [accounts, selectedAccountNumber],
  );

  const loadAccounts = async () => {
    setLoadingAccounts(true);
    setError('');
    try {
      const data = await accountService.getAccountsByCustomer(customerUuid, { includeBalance: true });
      setAccounts(data);
      setSelectedAccountNumber((current) =>
        data.some((account) => account.accountNumber === current)
          ? current
          : data[0]?.accountNumber || '',
      );
    } catch (requestError) {
      setError(getFriendlyApiError(requestError));
    } finally {
      setLoadingAccounts(false);
    }
  };

  const loadTransactions = async (filters = { from: fromDate, to: toDate }) => {
    if (!selectedAccountNumber) return;
    if (filters.from && filters.to && filters.from > filters.to) {
      setError('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }

    setLoadingTransactions(true);
    setError('');
    try {
      const data = await accountService.getTransactions({
        accountNumber: selectedAccountNumber,
        limit: 100,
        fromDate: filters.from || undefined,
        toDate: filters.to || undefined,
      });
      setTransactions(data);
    } catch (requestError) {
      setTransactions([]);
      setError(getFriendlyApiError(requestError));
    } finally {
      setLoadingTransactions(false);
    }
  };

  const clearFilters = async () => {
    setFromDate('');
    setToDate('');
    await loadTransactions({ from: '', to: '' });
  };

  useEffect(() => {
    void loadAccounts();
  }, [customerUuid]);

  useEffect(() => {
    if (selectedAccountNumber) void loadTransactions({ from: '', to: '' });
  }, [selectedAccountNumber]);

  const exportTransactions = () => {
    if (!selectedAccount || transactions.length === 0) return;
    const headers = [
      'Fecha',
      'Hora',
      'Fecha contable',
      'Tipo de movimiento',
      'Descripción',
      'Concepto o referencia',
      'Monto débito',
      'Monto crédito',
      'Saldo posterior',
      'Estado',
      'Canal',
      'Cuenta',
      'Referencia técnica',
    ];
    const rows = transactions.map((transaction) => {
      const isCredit = transaction.type === 'CREDIT' || transaction.movementType === 'CREDITO';
      const amount = Math.abs(transaction.amount);
      return [
        formatDateOnly(transaction.date),
        formatTimeOnly(transaction.date),
        transaction.accountingDate ? formatDateOnly(transaction.accountingDate) : '',
        getMovementTypeLabel(transaction),
        getTransactionLabel(transaction),
        transaction.reference || '',
        isCredit ? '' : amount.toFixed(2),
        isCredit ? amount.toFixed(2) : '',
        transaction.balance !== undefined ? transaction.balance.toFixed(2) : '',
        humanizeStatus(transaction.status),
        getTransactionChannelLabel(transaction),
        maskAccountNumber(selectedAccount.accountNumber).replace('N.º ', ''),
        transaction.transactionUuid,
      ];
    });
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(';')).join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const period = fromDate || toDate ? `${fromDate || 'inicio'}-a-${toDate || 'hoy'}` : 'todos';
    anchor.href = url;
    anchor.download = `movimientos-${selectedAccount.accountNumber.slice(-4)}-${period}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const status = selectedAccount ? getStatusPresentation(selectedAccount.status) : null;
  const selectedProduct = selectedAccount ? getAccountProductLabel(selectedAccount) : undefined;
  const selectedPurpose = selectedAccount ? getAccountPurposeLabel(selectedAccount) : undefined;
  const selectedBranch = selectedAccount ? getAccountBranchLabel(selectedAccount) : undefined;

  return (
    <Layout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 850, color: '#123f70', mb: 0.5 }}>Mis cuentas</Typography>
          <Typography color="text.secondary">Selecciona una cuenta para revisar su información y movimientos.</Typography>
        </Box>
        <Button startIcon={<Refresh />} onClick={loadAccounts} disabled={loadingAccounts}>Actualizar cuentas</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loadingAccounts ? (
        <Card><CardContent><Skeleton height={34} width="30%" /><Skeleton height={210} /></CardContent></Card>
      ) : accounts.length === 0 ? (
        <Alert severity="info">No se encontraron cuentas asociadas a tu perfil.</Alert>
      ) : (
        <>
          <Card sx={{ border: '1px solid #e5e7eb', mb: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={850}>Tus productos</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {accounts.length} {accounts.length === 1 ? 'cuenta asociada' : 'cuentas asociadas'} a tu perfil.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Tooltip title={showBalances ? 'Ocultar saldos' : 'Mostrar saldos'}>
                    <IconButton onClick={() => setShowBalances((current) => !current)} aria-label={showBalances ? 'Ocultar saldos' : 'Mostrar saldos'}>
                      {showBalances ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </Tooltip>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={viewMode}
                    onChange={(_, value) => value && setViewMode(value)}
                    aria-label="Vista de cuentas"
                  >
                    <ToggleButton value="cards" aria-label="Vista de tarjetas"><ViewAgenda fontSize="small" /></ToggleButton>
                    <ToggleButton value="list" aria-label="Vista de lista"><ViewList fontSize="small" /></ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
              </Box>

              {viewMode === 'cards' ? (
                <AccountRail
                  accounts={accounts}
                  selectedAccountNumber={selectedAccountNumber}
                  showBalances={showBalances}
                  onSelect={(account) => setSelectedAccountNumber(account.accountNumber)}
                />
              ) : (
                <TableContainer sx={{ border: '1px solid #edf0f4', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f6f8fb' }}>
                      <TableRow>
                        <TableCell>Cuenta</TableCell>
                        <TableCell>Producto / propósito</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell align="right">Saldo disponible</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {accounts.map((account) => {
                        const accountStatus = getStatusPresentation(account.status);
                        const product = getAccountProductLabel(account) || getAccountPurposeLabel(account) || 'Cuenta bancaria';
                        const selected = account.accountNumber === selectedAccountNumber;
                        return (
                          <TableRow
                            key={account.accountNumber}
                            hover
                            selected={selected}
                            onClick={() => setSelectedAccountNumber(account.accountNumber)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={800}>{getAccountLabel(account)}</Typography>
                              <AccountNumberDisplay value={account.accountNumber} />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{product}</Typography>
                              <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                                {account.favoritePaymentAccount && <Chip label="Favorita" size="small" variant="outlined" color="warning" />}
                                {account.massPaymentMainAccount && <Chip label="Cuenta matriz" size="small" variant="outlined" color="primary" />}
                              </Stack>
                            </TableCell>
                            <TableCell><Chip label={accountStatus.label} size="small" sx={{ color: accountStatus.color, bgcolor: accountStatus.background, fontWeight: 750 }} /></TableCell>
                            <TableCell align="right"><Typography fontWeight={850}>{showBalances ? formatCurrency(account.availableBalance) : '$ ••••••'}</Typography></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          {selectedAccount && (
            <Card sx={{ border: '1px solid #e5e7eb' }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2.5 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={850}>{getAccountLabel(selectedAccount)}</Typography>
                    <AccountNumberDisplay value={selectedAccount.accountNumber} compact={false} />
                    {(selectedBranch || selectedProduct || selectedPurpose) && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {[selectedBranch ? `Sucursal: ${selectedBranch}` : '', selectedProduct || selectedPurpose || ''].filter(Boolean).join(' · ')}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                      {status && <Chip label={status.label} size="small" sx={{ color: status.color, bgcolor: status.background, fontWeight: 750 }} />}
                      {selectedPurpose && <Chip label={selectedPurpose} size="small" variant="outlined" />}
                      {selectedAccount.favoritePaymentAccount && <Chip label="Favorita" size="small" variant="outlined" color="warning" />}
                      {selectedAccount.massPaymentMainAccount && <Chip label="Cuenta matriz" size="small" variant="outlined" color="primary" />}
                    </Stack>
                  </Box>
                  {canTransfer && status?.label === 'Activa' && (
                    <Button variant="contained" startIcon={<SwapHoriz />} onClick={() => navigate('/transferencias', { state: { sourceAccount: selectedAccount.accountNumber } })} sx={{ bgcolor: '#123f70' }}>
                      Transferir desde esta cuenta
                    </Button>
                  )}
                </Box>

                <Grid container spacing={1.5} sx={{ mb: 3 }}>
                  {[
                    ['Saldo contable', selectedAccount.accountingBalance],
                    ['Fondos retenidos', selectedAccount.withheldAmount || 0],
                    ['Saldo disponible', selectedAccount.availableBalance],
                  ].map(([label, value]) => (
                    <Grid key={String(label)} size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f6f8fb', border: '1px solid #edf0f4' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 750 }}>{label}</Typography>
                        <Typography variant="h6" fontWeight={900} color="#123f70" sx={{ mt: 0.5 }}>
                          {showBalances ? formatCurrency(Number(value)) : '$ ••••••'}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ mb: 2.5 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end', mb: 2.5 }}>
                  <TextField label="Desde" type="date" size="small" value={fromDate} onChange={(event) => setFromDate(event.target.value)} InputLabelProps={{ shrink: true }} />
                  <TextField label="Hasta" type="date" size="small" value={toDate} onChange={(event) => setToDate(event.target.value)} InputLabelProps={{ shrink: true }} />
                  <Button variant="outlined" onClick={() => loadTransactions()} disabled={loadingTransactions}>Aplicar filtros</Button>
                  <Button startIcon={<FilterAltOff />} onClick={clearFilters} disabled={loadingTransactions || (!fromDate && !toDate)}>Limpiar filtros</Button>
                  <Button startIcon={<Download />} onClick={exportTransactions} disabled={transactions.length === 0}>Exportar CSV</Button>
                  <FormControl size="small" sx={{ minWidth: 220, ml: { md: 'auto' } }}>
                    <InputLabel>Cuenta consultada</InputLabel>
                    <Select value={selectedAccountNumber} label="Cuenta consultada" onChange={(event) => setSelectedAccountNumber(event.target.value)}>
                      {accounts.map((account) => <MenuItem key={account.accountNumber} value={account.accountNumber}>{getAccountLabel(account)} · {account.accountNumber.slice(-4)}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>

                <TableContainer sx={{ border: '1px solid #edf0f4', borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f6f8fb' }}>
                      <TableRow>
                        <TableCell>Fecha y hora</TableCell>
                        <TableCell>Movimiento</TableCell>
                        <TableCell>Concepto o referencia</TableCell>
                        <TableCell align="right">Débito</TableCell>
                        <TableCell align="right">Crédito</TableCell>
                        <TableCell align="right">Saldo posterior</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loadingTransactions && Array.from({ length: 4 }).map((_, index) => <TableRow key={index}><TableCell colSpan={6}><Skeleton height={36} /></TableCell></TableRow>)}
                      {!loadingTransactions && transactions.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>No existen movimientos para los filtros seleccionados.</TableCell></TableRow>}
                      {!loadingTransactions && transactions.map((transaction) => {
                        const isCredit = transaction.type === 'CREDIT' || transaction.movementType === 'CREDITO';
                        const detail = [
                          getMovementTypeLabel(transaction),
                          humanizeStatus(transaction.status),
                          getTransactionChannelLabel(transaction),
                        ].filter(Boolean).join(' · ');
                        return (
                          <TableRow key={transaction.transactionUuid || `${transaction.date}-${transaction.amount}`} hover>
                            <TableCell sx={{ minWidth: 150 }}>{formatDateTime(transaction.date)}</TableCell>
                            <TableCell sx={{ minWidth: 190 }}>
                              <Typography variant="body2" fontWeight={650}>{getTransactionLabel(transaction)}</Typography>
                              {detail && <Typography variant="caption" color="text.secondary">{detail}</Typography>}
                            </TableCell>
                            <TableCell sx={{ minWidth: 170 }}>{transaction.reference || '—'}</TableCell>
                            <TableCell align="right">
                              {!isCredit ? <Typography fontWeight={800}>-{formatCurrency(Math.abs(transaction.amount))}</Typography> : '—'}
                            </TableCell>
                            <TableCell align="right">
                              {isCredit ? <Typography fontWeight={800} color="success.main">+{formatCurrency(Math.abs(transaction.amount))}</Typography> : '—'}
                            </TableCell>
                            <TableCell align="right">{transaction.balance !== undefined ? formatCurrency(transaction.balance) : '—'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Layout>
  );
}
