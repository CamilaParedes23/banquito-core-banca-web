// Servicio de Cuentas - Account API
// Banco BanQuito Core V2
// Basado en contrato OpenAPI 3.1.0

import {
  BalanceResponse,
  P2PTransferRequest,
  P2PTransferResponse,
  AccountResponse,
  AccountOwnerResponse,
  TransactionsRequest,
  TransactionResponse,
  ApiError,
} from '../types/account.types';
import {
  API_BASE_URL,
  USE_MOCK_DATA,
  ACCOUNT_ENDPOINTS,
  DEFAULT_HEADERS,
  DEFAULT_TIMEOUT,
  API_ERROR_CODES,
  HTTP_STATUS,
} from '../constants/api.constants';

/**
 * Helper para simular delay de red (mock)
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper para obtener mensaje de error amigable
 */
export const getErrorMessage = (error: any): string => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data as ApiError;

    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        if (data.code === API_ERROR_CODES.INSUFFICIENT_FUNDS) {
          return 'Saldo insuficiente para realizar la transferencia.';
        }
        if (data.code === API_ERROR_CODES.INVALID_ACCOUNT) {
          return 'El número de cuenta ingresado no es válido.';
        }
        if (data.code === API_ERROR_CODES.ACCOUNT_INACTIVE) {
          return 'La cuenta destino está inactiva y no puede recibir transferencias.';
        }
        if (data.code === API_ERROR_CODES.SAME_ACCOUNT) {
          return 'No puedes transferir a la misma cuenta de origen.';
        }
        if (data.code === API_ERROR_CODES.ACCOUNT_BLOCKED) {
          return 'La cuenta está bloqueada y no puede realizar operaciones.';
        }
        return data.message || 'La solicitud contiene datos inválidos.';

      case HTTP_STATUS.UNAUTHORIZED:
        return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';

      case HTTP_STATUS.FORBIDDEN:
        return 'No tienes permisos para realizar esta operación.';

      case HTTP_STATUS.NOT_FOUND:
        return 'La cuenta destino no existe en el sistema.';

      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return 'Error del servidor. Por favor, intenta más tarde.';

      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return 'El servicio no está disponible en este momento. Por favor, intenta más tarde.';

      default:
        return 'Ocurrió un error inesperado. Por favor, contacta a soporte.';
    }
  }

  if (error.request) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
  }

  return 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
};

/**
 * Helper para obtener token de autenticación
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * Helper para hacer fetch con timeout
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Datos Mock para desarrollo
const mockBalance: BalanceResponse = {
  accountingBalance: 5230.50,
  availableBalance: 5230.50,
  retainedAmount: 0,
  currency: 'USD',
};

const mockAccount: AccountResponse = {
  accountNumber: '3001234521',
  accountType: 'CHECKING',
  accountSubtypeCode: 'CORRIENTE',
  balance: 5230.50,
  availableBalance: 5230.50,
  currency: 'USD',
  status: 'ACTIVA',
  holderName: 'Juan Díaz García',
  customerUuid: 'cust-uuid-123',
  branchCode: '001',
  createdAt: '2024-01-15T10:30:00Z',
};

const mockAccountOwner: AccountOwnerResponse = {
  accountNumber: '9876543210',
  holderName: 'Ana García López',
  identification: '1712345678',
  status: 'ACTIVA',
  customerUuid: 'cust-uuid-456',
};

const mockTransactions: TransactionResponse[] = [
  {
    transactionUuid: 'txn-uuid-1',
    date: '2024-05-30',
    description: 'Transferencia recibida',
    reference: 'TRF-2024-05-30-001',
    amount: 500.00,
    balance: 5230.50,
    status: 'COMPLETED',
    type: 'CREDIT',
  },
  {
    transactionUuid: 'txn-uuid-2',
    date: '2024-05-29',
    description: 'Pago de servicios',
    reference: 'PAGO-2024-05-29-001',
    amount: -150.00,
    balance: 4730.50,
    status: 'COMPLETED',
    type: 'DEBIT',
  },
  {
    transactionUuid: 'txn-uuid-3',
    date: '2024-05-28',
    description: 'Depósito en efectivo',
    reference: 'DEP-2024-05-28-001',
    amount: 1000.00,
    balance: 4880.50,
    status: 'COMPLETED',
    type: 'CREDIT',
  },
];

/**
 * Servicio de Cuentas - Account API
 */
export const accountService = {
  /**
   * GET /accounts/{accountNumber}/balance
   * Consultar saldo contable y disponible
   */
  async getAccountBalance(accountNumber: string): Promise<BalanceResponse> {
    if (USE_MOCK_DATA) {
      await delay(800);
      return mockBalance;
    }

    const token = getAuthToken();
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${ACCOUNT_ENDPOINTS.GET_ACCOUNT_BALANCE(accountNumber)}`,
      {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { status: response.status, data: errorData } };
    }

    return response.json();
  },

  /**
   * GET /accounts/{accountNumber}
   * Consultar cuenta por número
   */
  async getAccount(accountNumber: string): Promise<AccountResponse> {
    if (USE_MOCK_DATA) {
      await delay(800);
      return mockAccount;
    }

    const token = getAuthToken();
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${ACCOUNT_ENDPOINTS.GET_ACCOUNT(accountNumber)}`,
      {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { status: response.status, data: errorData } };
    }

    return response.json();
  },

  /**
   * GET /accounts/by-customer/{customerUuid}
   * Listar cuentas por cliente
   */
  async getAccountsByCustomer(customerUuid: string, status?: string, onlyTransferable?: boolean, includeBalance?: boolean): Promise<AccountResponse[]> {
    if (USE_MOCK_DATA) {
      await delay(800);
      return [mockAccount];
    }

    const token = getAuthToken();
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (onlyTransferable !== undefined) params.append('onlyTransferable', onlyTransferable.toString());
    if (includeBalance !== undefined) params.append('includeBalance', includeBalance.toString());

    const response = await fetchWithTimeout(
      `${API_BASE_URL}${ACCOUNT_ENDPOINTS.GET_ACCOUNTS_BY_CUSTOMER(customerUuid)}${params.toString() ? `?${params.toString()}` : ''}`,
      {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { status: response.status, data: errorData } };
    }

    return response.json();
  },

  /**
   * GET /accounts/{accountNumber}/transactions
   * Consultar últimos N movimientos
   */
  async getAccountTransactions(request: TransactionsRequest): Promise<TransactionResponse[]> {
    if (USE_MOCK_DATA) {
      await delay(1000);
      return mockTransactions;
    }

    const token = getAuthToken();
    const params = new URLSearchParams();
    if (request.limit) params.append('limit', request.limit.toString());
    if (request.fromDate) params.append('fromDate', request.fromDate);
    if (request.toDate) params.append('toDate', request.toDate);

    const response = await fetchWithTimeout(
      `${API_BASE_URL}${ACCOUNT_ENDPOINTS.GET_ACCOUNT_TRANSACTIONS(request.accountNumber)}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { status: response.status, data: errorData } };
    }

    const transactions = await response.json();

    // Mapeo de subtipos a descripciones amigables
    const subtypeDescriptions: Record<string, string> = {
      'TRF_P2P_DEB': 'Transferencia P2P enviada',
      'TRF_P2P_CRE': 'Transferencia P2P recibida',
      'DEP_VENTANILLA': 'Depósito en ventanilla',
      'RET_VENTANILLA': 'Retiro en ventanilla',
      'APERTURA_CUENTA': 'Apertura de cuenta',
    };

    // Mapear formato del backend al formato local
    return transactions.map((txn: any) => ({
      transactionUuid: txn.transactionUuid || txn.uuidTransaccion,
      date: txn.timestamp || txn.date || txn.fechaTransaccion || txn.accountingDate,
      description: subtypeDescriptions[txn.subtypeCode] || txn.description || txn.descripcion || 'Transacción',
      reference: txn.reference || txn.referencia || txn.externalReference,
      amount: txn.amount || txn.monto,
      balance: txn.balance || txn.saldoResultante || txn.resultingAvailableBalance,
      status: txn.status || txn.estado,
      type: txn.type || txn.tipoMovimiento || txn.movementType === 'CREDITO' ? 'CREDIT' : txn.movementType === 'DEBITO' ? 'DEBIT' : txn.movementType,
      movementType: txn.movementType || txn.type || txn.tipoMovimiento,
    }));
  },

  /**
   * GET /accounts/{accountNumber}/owner
   * Consultar titular de cuenta para validación previa
   */
  async getAccountOwner(accountNumber: string): Promise<AccountOwnerResponse> {
    if (USE_MOCK_DATA) {
      await delay(1000);
      return mockAccountOwner;
    }

    const token = getAuthToken();
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${ACCOUNT_ENDPOINTS.GET_ACCOUNT_OWNER(accountNumber)}`,
      {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { status: response.status, data: errorData } };
    }

    return response.json();
  },

  /**
   * POST /accounts/transfers/p2p
   * Transferencia P2P entre cuentas BanQuito
   */
  async transferP2P(request: P2PTransferRequest): Promise<P2PTransferResponse> {
    if (USE_MOCK_DATA) {
      await delay(1500);

      // Validar fondos suficientes
      if (mockBalance.availableBalance < request.amount) {
        throw {
          response: {
            status: HTTP_STATUS.BAD_REQUEST,
            data: {
              code: API_ERROR_CODES.INSUFFICIENT_FUNDS,
              message: 'Fondos insuficientes',
            },
          },
        };
      }

      // Validar que no sea la misma cuenta
      if (request.sourceAccountNumber === request.targetAccountNumber) {
        throw {
          response: {
            status: HTTP_STATUS.BAD_REQUEST,
            data: {
              code: API_ERROR_CODES.SAME_ACCOUNT,
              message: 'No puedes transferir a la misma cuenta',
            },
          },
        };
      }

      // Simular transferencia exitosa
      return {
        transactionUuid: `txn-${Date.now()}`,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        sourceAccountNumber: request.sourceAccountNumber,
        targetAccountNumber: request.targetAccountNumber,
        amount: request.amount,
        newBalance: mockBalance.availableBalance - request.amount,
      };
    }

    const token = getAuthToken();
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${ACCOUNT_ENDPOINTS.TRANSFER_P2P}`,
      {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { status: response.status, data: errorData } };
    }

    return response.json();
  },
};

export default accountService;
