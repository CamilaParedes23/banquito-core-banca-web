import type {
  AccountOwnerResponse,
  AccountResponse,
  P2PTransferRequest,
  P2PTransferResponse,
  TransactionResponse,
  TransactionsRequest,
} from '../types/account.types';
import { ApiError, httpService } from './http.service';
import { cleanBusinessLabel } from '../utils/formatters';
import { env } from '../config/env';

const asNumber = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const asOptionalNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const firstText = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
};

const normalizeAccount = (raw: Record<string, unknown>): AccountResponse => ({
  accountUuid: String(raw.accountUuid ?? raw.uuid ?? ''),
  accountNumber: String(raw.accountNumber ?? raw.numeroCuenta ?? ''),
  customerUuid: String(raw.customerUuid ?? raw.clienteUuid ?? ''),
  identification: firstText(raw.identification, raw.identificacion),
  holderName: String(raw.holderName ?? raw.nombreTitular ?? ''),
  branchCode: firstText(raw.branchCode, raw.codigoSucursal),
  branchName: firstText(
    raw.branchName,
    raw.branchDescription,
    raw.sucursalNombre,
    raw.nombreSucursal,
  ),
  subtypeCode: firstText(raw.subtypeCode, raw.codigoSubtipo),
  subtypeName: firstText(
    raw.subtypeName,
    raw.accountSubtypeName,
    raw.subtypeDescription,
    raw.nombreSubtipo,
  ),
  productName: firstText(raw.productName, raw.productDescription, raw.nombreProducto),
  status: String(raw.status ?? raw.estado ?? ''),
  accountingBalance: asNumber(raw.accountingBalance ?? raw.saldoContable),
  availableBalance: asNumber(raw.availableBalance ?? raw.saldoDisponible),
  withheldAmount: asNumber(raw.withheldAmount ?? raw.retainedAmount ?? raw.montoRetenido),
  favoritePaymentAccount: Boolean(raw.favoritePaymentAccount ?? raw.isFavorite),
  massPaymentMainAccount: Boolean(raw.massPaymentMainAccount),
  accountPurpose: firstText(raw.accountPurpose, raw.propositoCuenta),
  accountPurposeName: firstText(
    raw.accountPurposeName,
    raw.purposeDescription,
    raw.nombreProposito,
  ),
  operationalAlias: firstText(raw.operationalAlias, raw.aliasOperativo),
});

const normalizeTransaction = (raw: Record<string, unknown>): TransactionResponse => {
  const movementType = String(raw.movementType ?? raw.type ?? raw.tipoMovimiento ?? '');
  const type =
    movementType === 'CREDITO'
      ? 'CREDIT'
      : movementType === 'DEBITO'
        ? 'DEBIT'
        : movementType;
  const subtypeName = firstText(
    raw.subtypeName,
    raw.transactionSubtypeName,
    raw.subtypeDescription,
    raw.nombreSubtipo,
  );
  const rawDescription = firstText(raw.description, raw.descripcion);
  const businessDescription = cleanBusinessLabel(rawDescription) || cleanBusinessLabel(subtypeName);

  return {
    transactionUuid: String(raw.transactionUuid ?? raw.uuidTransaccion ?? raw.uuid ?? ''),
    date: String(raw.timestamp ?? raw.date ?? raw.fechaTransaccion ?? raw.accountingDate ?? ''),
    description: businessDescription || '',
    subtypeName,
    reference: firstText(raw.reference, raw.referencia, raw.externalReference),
    amount: asNumber(raw.amount ?? raw.monto),
    balance: asOptionalNumber(raw.balance ?? raw.saldoResultante ?? raw.resultingAvailableBalance),
    status: firstText(raw.status, raw.estado),
    type,
    movementType,
    subtypeCode: firstText(raw.subtypeCode, raw.codigoSubtipo),
    accountingDate: firstText(raw.accountingDate, raw.fechaContable),
    channel: firstText(raw.channelName, raw.channel, raw.originChannel, raw.canalOrigen),
    accountNumber: firstText(raw.accountNumber, raw.numeroCuenta),
  };
};

const dateOnly = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
};

export const accountService = {
  async getAccountsByCustomer(
    customerUuid: string,
    filters: {
      status?: string;
      onlyTransferable?: boolean;
      purpose?: string;
      includeBalance?: boolean;
    } = {},
  ): Promise<AccountResponse[]> {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.onlyTransferable !== undefined) {
      params.set('onlyTransferable', String(filters.onlyTransferable));
    }
    if (filters.purpose) params.set('purpose', filters.purpose);
    params.set('includeBalance', String(filters.includeBalance ?? true));

    const data = await httpService.request<unknown[]>(
      `/accounts/by-customer/${encodeURIComponent(customerUuid)}?${params.toString()}`,
    );

    return Array.isArray(data)
      ? data.map((item) => normalizeAccount(item as Record<string, unknown>))
      : [];
  },

  async getAccount(accountNumber: string): Promise<AccountResponse> {
    const data = await httpService.request<Record<string, unknown>>(
      `/accounts/${encodeURIComponent(accountNumber)}`,
    );
    return normalizeAccount(data);
  },

  async getBeneficiaryPreview(accountNumber: string): Promise<AccountOwnerResponse> {
    const normalizedAccountNumber = accountNumber.trim();
    const data = await httpService.request<Record<string, unknown>>(
      '/accounts/transfers/p2p/beneficiary-validation',
      {
        method: 'POST',
        body: { accountNumber: normalizedAccountNumber },
      },
    );

    const accountExists = Boolean(data.accountExists);
    if (!accountExists) {
      throw new ApiError(
        'La cuenta destino no existe en Banco BanQuito.',
        404,
        'ACCOUNT_NOT_FOUND',
      );
    }

    return {
      accountNumber: normalizedAccountNumber,
      maskedAccountNumber: firstText(data.maskedAccountNumber),
      holderName: firstText(data.holderDisplayName),
      status: String(data.accountStatus ?? ''),
      institution: firstText(data.institution) || 'Banco BanQuito',
      verified: true,
    };
  },

  async getTransactions(request: TransactionsRequest): Promise<TransactionResponse[]> {
    const data = await httpService.request<unknown[]>(
      `/accounts/${encodeURIComponent(request.accountNumber)}/transactions`,
    );

    let transactions = Array.isArray(data)
      ? data.map((item) => normalizeTransaction(item as Record<string, unknown>))
      : [];

    // El contrato vigente no expone filtros ni paginación para este endpoint.
    // Los filtros se aplican localmente hasta que el backend publique esos parámetros.
    if (request.fromDate) {
      transactions = transactions.filter((transaction) => dateOnly(transaction.date) >= request.fromDate!);
    }
    if (request.toDate) {
      transactions = transactions.filter((transaction) => dateOnly(transaction.date) <= request.toDate!);
    }
    if (request.limit && request.limit > 0) {
      transactions = transactions.slice(0, request.limit);
    }

    return transactions;
  },

  async transferP2P(
    request: P2PTransferRequest,
    idempotencyKey?: string,
  ): Promise<P2PTransferResponse> {
    const correlationId = httpService.createRequestId();

    const headers =
      env.enableP2pIdempotency && idempotencyKey
        ? { 'Idempotency-Key': idempotencyKey }
        : undefined;

    const data = await httpService.request<unknown>('/accounts/transfers/p2p', {
      method: 'POST',
      body: request,
      correlationId,
      headers,
    });

    const results = (Array.isArray(data) ? data : [data])
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object');
    const sourceResult = results.find((item) => {
      const accountNumber = String(item.accountNumber ?? item.numeroCuenta ?? '');
      const movement = String(item.movementType ?? item.tipoMovimiento ?? '').toUpperCase();
      return accountNumber === request.sourceAccountNumber || movement === 'DEBITO' || movement === 'DEBIT';
    }) || results[0] || {};

    return {
      transactionUuid: String(
        sourceResult.transactionUuid ?? sourceResult.uuidTransaccion ?? sourceResult.uuid ?? correlationId,
      ),
      status: String(sourceResult.status ?? sourceResult.estado ?? 'PROCESADA'),
      timestamp: String(
        sourceResult.timestamp ?? sourceResult.fechaTransaccion ?? new Date().toISOString(),
      ),
      sourceAccountNumber: String(
        sourceResult.accountNumber ?? sourceResult.numeroCuenta ?? request.sourceAccountNumber,
      ),
      targetAccountNumber: request.targetAccountNumber,
      amount: asNumber(sourceResult.amount ?? sourceResult.monto ?? request.amount),
      fee: asOptionalNumber(sourceResult.fee ?? sourceResult.commission ?? sourceResult.commissionAmount ?? sourceResult.comision),
      newBalance: asOptionalNumber(
        sourceResult.resultingAvailableBalance ??
          sourceResult.availableBalanceAfter ??
          sourceResult.newBalance ??
          sourceResult.saldoResultante,
      ),
      correlationId,
    };
  },
};
