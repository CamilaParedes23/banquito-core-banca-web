import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
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
  LinearProgress,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AccountBalance,
  ArrowForward,
  BusinessCenter,
  OpenInNew,
  ReceiptLong,
  Refresh,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import AccountRail from '../components/AccountRail';
import { env } from '../config/env';
import { accountService } from '../services/account.service';
import { customerService } from '../services/customer.service';
import { getFriendlyApiError } from '../services/http.service';
import { sessionService } from '../services/session.service';
import type { AccountResponse, TransactionResponse } from '../types/account.types';
import {
  formatCurrency,
  formatDateTime,
  getAccountLabel,
  getTransactionLabel,
} from '../utils/formatters';

export default function Dashboard() {
  const navigate = useNavigate();
  const session = sessionService.get();
  const customerUuid = session?.profile.customerUuid || '';
  const isCompany = session?.profile.roles.includes('CLIENTE_EMPRESA') ?? false;
  const canTransfer = session?.profile.scopes.includes('core.account.transfer.p2p') ?? false;

  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [accountsError, setAccountsError] = useState('');
  const [showBalances, setShowBalances] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState('');
  const [massPaymentsEnabled, setMassPaymentsEnabled] = useState<boolean | undefined>(undefined);
  const [loadingCompanyProfile, setLoadingCompanyProfile] = useState(false);

  const loadAccounts = async () => {
    setLoadingAccounts(true);
    setAccountsError('');
    try {
      const data = await accountService.getAccountsByCustomer(customerUuid, { includeBalance: true });
      setAccounts(data);
      setSelectedAccount((current) =>
        data.some((account) => account.accountNumber === current)
          ? current
          : data[0]?.accountNumber || '',
      );
    } catch (error) {
      setAccountsError(getFriendlyApiError(error));
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    void loadAccounts();
  }, [customerUuid]);

  useEffect(() => {
    if (!isCompany || !customerUuid) return;
    let active = true;
    setLoadingCompanyProfile(true);
    customerService
      .getCustomer(customerUuid)
      .then((customer) => {
        if (active) setMassPaymentsEnabled(customerService.getMassPaymentsEnabled(customer));
      })
      .catch(() => {
        if (active) setMassPaymentsEnabled(undefined);
      })
      .finally(() => {
        if (active) setLoadingCompanyProfile(false);
      });
    return () => {
      active = false;
    };
  }, [customerUuid, isCompany]);

  useEffect(() => {
    if (!selectedAccount) {
      setTransactions([]);
      return;
    }
    let active = true;
    setLoadingTransactions(true);
    setTransactionsError('');
    accountService
      .getTransactions({ accountNumber: selectedAccount, limit: 5 })
      .then((data) => active && setTransactions(data))
      .catch((error) => active && setTransactionsError(getFriendlyApiError(error)))
      .finally(() => active && setLoadingTransactions(false));
    return () => {
      active = false;
    };
  }, [selectedAccount]);

  const totals = useMemo(
    () =>
      accounts.reduce(
        (summary, account) => ({
          accounting: summary.accounting + account.accountingBalance,
          available: summary.available + account.availableBalance,
          withheld: summary.withheld + (account.withheldAmount || 0),
          active: summary.active + (['ACTIVA', 'ACTIVE'].includes(account.status.toUpperCase()) ? 1 : 0),
        }),
        { accounting: 0, available: 0, withheld: 0, active: 0 },
      ),
    [accounts],
  );

  const distribution = useMemo(() => {
    const positiveTotal = accounts.reduce((sum, account) => sum + Math.max(account.availableBalance, 0), 0);
    return [...accounts]
      .sort((a, b) => b.availableBalance - a.availableBalance)
      .slice(0, 5)
      .map((account) => ({
        account,
        percentage: positiveTotal > 0 ? (Math.max(account.availableBalance, 0) / positiveTotal) * 100 : 0,
      }));
  }, [accounts]);

  const mainPaymentAccount = accounts.find((account) => account.massPaymentMainAccount);
  const selectedAccountData = accounts.find((account) => account.accountNumber === selectedAccount);

  const openSwitchPortal = () => {
    if (env.switchPortalUrl) window.location.assign(env.switchPortalUrl);
  };

  return (
    <Layout>
      <Box sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 850, color: '#123f70', mb: 0.5 }}>
            {isCompany ? 'Panel empresarial' : 'Panel personal'}
          </Typography>
          <Typography color="text.secondary">
            {isCompany
              ? 'Controla tus cuentas y el acceso a los servicios empresariales de BanQuito.'
              : 'Consulta tus saldos y gestiona tus operaciones desde un solo lugar.'}
          </Typography>
        </Box>
        <Button startIcon={<Refresh />} onClick={loadAccounts} disabled={loadingAccounts}>
          Actualizar
        </Button>
      </Box>

      {accountsError && (
        <Alert severity="error" action={<Button color="inherit" onClick={loadAccounts}>Reintentar</Button>} sx={{ mb: 3 }}>
          {accountsError}
        </Alert>
      )}

      {loadingAccounts ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, xl: 3 }}>
              <Card><CardContent><Skeleton width="55%" /><Skeleton height={48} /></CardContent></Card>
            </Grid>
          ))}
        </Grid>
      ) : accounts.length > 0 ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Cuentas activas', value: String(totals.active), money: false },
            { label: 'Saldo contable total', value: totals.accounting, money: true },
            { label: 'Saldo disponible total', value: totals.available, money: true },
            { label: 'Fondos retenidos', value: totals.withheld, money: true },
          ].map((item) => (
            <Grid key={item.label} size={{ xs: 12, sm: 6, xl: 3 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ py: 2.25 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.65, fontWeight: 750 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 0.75, fontWeight: 900, color: '#123f70' }}>
                    {item.money ? (showBalances ? formatCurrency(Number(item.value)) : '$ ••••••') : item.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : null}

      {!loadingAccounts && accounts.length === 0 && !accountsError && (
        <Alert severity="info">No tienes cuentas asociadas a tu perfil.</Alert>
      )}

      {!loadingAccounts && accounts.length > 0 && (
        <>
          <Card sx={{ border: '1px solid #e5e7eb', mb: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={850}>Mis cuentas</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Selecciona una cuenta para consultar sus últimos movimientos.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Tooltip title={showBalances ? 'Ocultar saldos' : 'Mostrar saldos'}>
                    <IconButton onClick={() => setShowBalances((current) => !current)} aria-label={showBalances ? 'Ocultar saldos' : 'Mostrar saldos'}>
                      {showBalances ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </Tooltip>
                  <Button onClick={() => navigate('/cuentas')}>Ver todas</Button>
                </Stack>
              </Box>
              <AccountRail
                accounts={accounts}
                selectedAccountNumber={selectedAccount}
                showBalances={showBalances}
                onSelect={(account) => setSelectedAccount(account.accountNumber)}
              />
            </CardContent>
          </Card>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={850}>
                    {isCompany ? 'Pagos empresariales' : 'Accesos rápidos'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
                    {isCompany
                      ? 'El servicio de pagos masivos se administra desde el portal especializado del Switch.'
                      : 'Accede rápidamente a las operaciones más utilizadas.'}
                  </Typography>

                  {isCompany ? (
                    <>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                        <Chip
                          label={loadingCompanyProfile ? 'Consultando servicio…' : massPaymentsEnabled === true ? 'Pagos masivos habilitados' : massPaymentsEnabled === false ? 'Pagos masivos no habilitados' : 'Estado no informado'}
                          color={massPaymentsEnabled === true ? 'success' : massPaymentsEnabled === false ? 'warning' : 'default'}
                          variant="outlined"
                        />
                        {mainPaymentAccount && <Chip label={`Cuenta matriz · ${mainPaymentAccount.accountNumber.slice(-4)}`} color="primary" variant="outlined" />}
                      </Stack>
                      <Alert severity={massPaymentsEnabled === false ? 'info' : 'success'} sx={{ mb: 2.5 }}>
                        {massPaymentsEnabled === false
                          ? 'La habilitación del servicio se realiza desde Backoffice por un usuario autorizado del banco.'
                          : mainPaymentAccount
                            ? `La cuenta ${getAccountLabel(mainPaymentAccount)} está marcada como cuenta matriz para pagos empresariales.`
                            : 'La configuración de cuenta matriz se administra desde Backoffice.'}
                      </Alert>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                        <Button variant="outlined" startIcon={<AccountBalance />} onClick={() => navigate('/cuentas')}>
                          Ver cuentas
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<BusinessCenter />}
                          endIcon={<OpenInNew />}
                          onClick={openSwitchPortal}
                          disabled={!env.switchPortalUrl || massPaymentsEnabled === false}
                          sx={{ bgcolor: '#123f70' }}
                        >
                          Ir al Portal de Pagos Masivos
                        </Button>
                      </Stack>
                      {!env.switchPortalUrl && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>
                          El acceso se habilitará cuando el Portal del Switch esté desplegado.
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Grid container spacing={1.5}>
                      {canTransfer && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Button fullWidth variant="contained" startIcon={<ArrowForward />} onClick={() => navigate('/transferencias', { state: { sourceAccount: selectedAccount } })} sx={{ minHeight: 54, bgcolor: '#123f70' }}>
                            Transferir dinero
                          </Button>
                        </Grid>
                      )}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Button fullWidth variant="outlined" startIcon={<ReceiptLong />} onClick={() => navigate('/cuentas', { state: { accountNumber: selectedAccount } })} sx={{ minHeight: 54 }}>
                          Ver movimientos
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Card sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={850}>Distribución del saldo disponible</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
                    Participación de tus principales cuentas sobre el saldo disponible total.
                  </Typography>
                  <Stack spacing={1.75}>
                    {distribution.map(({ account, percentage }) => (
                      <Box key={account.accountNumber}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={700} noWrap>{getAccountLabel(account)} · {account.accountNumber.slice(-4)}</Typography>
                          <Typography variant="body2" fontWeight={750}>{showBalances ? formatCurrency(account.availableBalance) : '$ ••••••'}</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={Math.min(100, percentage)} sx={{ height: 7, borderRadius: 7, bgcolor: '#edf2f7', '& .MuiLinearProgress-bar': { bgcolor: '#d9b74a', borderRadius: 7 } }} />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ border: '1px solid #e8edf3' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', md: 'row' }, mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 850 }}>Movimientos recientes</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAccountData ? `${getAccountLabel(selectedAccountData)} · ${selectedAccountData.accountNumber.slice(-4)}` : 'Selecciona una cuenta.'}
                  </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 260 }}>
                  <InputLabel>Cuenta</InputLabel>
                  <Select value={selectedAccount} label="Cuenta" onChange={(event) => setSelectedAccount(event.target.value)}>
                    {accounts.map((account) => <MenuItem key={account.accountNumber} value={account.accountNumber}>{getAccountLabel(account)} · {account.accountNumber.slice(-4)}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
              <Divider sx={{ mb: 1 }} />
              {loadingTransactions && Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} height={66} />)}
              {transactionsError && <Alert severity="warning" sx={{ my: 2 }}>{transactionsError}</Alert>}
              {!loadingTransactions && !transactionsError && transactions.length === 0 && <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No hay movimientos recientes para esta cuenta.</Typography>}
              {!loadingTransactions && transactions.map((transaction) => {
                const isCredit = transaction.type === 'CREDIT' || transaction.movementType === 'CREDITO';
                return (
                  <Box key={transaction.transactionUuid || `${transaction.date}-${transaction.amount}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, py: 1.75, borderBottom: '1px solid #eef1f5' }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700}>{getTransactionLabel(transaction)}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatDateTime(transaction.date)}{transaction.reference ? ` · ${transaction.reference}` : ''}</Typography>
                    </Box>
                    <Typography fontWeight={850} color={isCredit ? 'success.main' : 'text.primary'}>{isCredit ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}</Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}
    </Layout>
  );
}
