// Configuración base de la API del Core Bancario
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const USE_MOCK_DATA = false; // Cambiar a false cuando el Core esté disponible

// Tipos de datos
export interface Account {
  accountNumber: string;
  accountType: string;
  balance: number;
  availableBalance: number;
  currency: string;
  status: string;
  holderName: string;
}

export interface AccountsResponse {
  customerId: string;
  accounts: Account[];
}

export interface TransferRequest {
  sourceAccount: string;
  destinationAccount: string;
  amount: number;
  concept: string;
  reference?: string;
}

export interface TransferResponse {
  transactionId: string;
  status: string;
  timestamp: string;
  sourceAccount: string;
  destinationAccount: string;
  amount: number;
  newBalance: number;
}

export interface AccountHolderResponse {
  accountNumber: string;
  holderName: string;
  status: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

// Manejo de errores amigables
export const getErrorMessage = (error: any): string => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data as ApiError;

    switch (status) {
      case 400:
        if (data.code === 'INSUFFICIENT_FUNDS') {
          return 'Saldo insuficiente para realizar la transferencia.';
        }
        if (data.code === 'INVALID_ACCOUNT') {
          return 'El número de cuenta ingresado no es válido.';
        }
        if (data.code === 'ACCOUNT_INACTIVE') {
          return 'La cuenta destino está inactiva y no puede recibir transferencias.';
        }
        if (data.code === 'SAME_ACCOUNT') {
          return 'No puedes transferir a la misma cuenta de origen.';
        }
        return data.message || 'La solicitud contiene datos inválidos.';

      case 404:
        return 'La cuenta destino no existe en el sistema.';

      case 500:
        return 'Error del servidor. Por favor, intenta más tarde.';

      case 503:
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

// Datos Mock para desarrollo
const mockAccounts: AccountsResponse = {
  customerId: 'CUST-001',
  accounts: [
    {
      accountNumber: '1234567890124521',
      accountType: 'CHECKING',
      balance: 5230.50,
      availableBalance: 5230.50,
      currency: 'USD',
      status: 'ACTIVE',
      holderName: 'Juan Díaz García',
    },
    {
      accountNumber: '1234567890127823',
      accountType: 'SAVINGS',
      balance: 12840.00,
      availableBalance: 12840.00,
      currency: 'USD',
      status: 'ACTIVE',
      holderName: 'Juan Díaz García',
    },
  ],
};

const mockHolders: Record<string, AccountHolderResponse> = {
  '9876543210987654': {
    accountNumber: '9876543210987654',
    holderName: 'Ana García López',
    status: 'ACTIVE',
  },
  '5432109876543210': {
    accountNumber: '5432109876543210',
    holderName: 'Carlos Hernández Ruiz',
    status: 'ACTIVE',
  },
  '1111222233334444': {
    accountNumber: '1111222233334444',
    holderName: 'María Rodríguez Pérez',
    status: 'ACTIVE',
  },
};

// Función helper para simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Servicios API
export const apiService = {
  // RF-03: Consulta de saldos
  async getAccounts(customerId: string): Promise<AccountsResponse> {
    if (USE_MOCK_DATA) {
      await delay(800); // Simular latencia de red
      return mockAccounts;
    }

    try {
      // Obtener customerUuid del localStorage (se guarda al hacer login como actor_uuid)
      // El actorUuid del login es el UUID del cliente cuando está vinculado
      const customerUuid = localStorage.getItem('actor_uuid') || customerId;

      const response = await fetch(`${API_BASE_URL}/accounts/by-customer/${customerUuid}?includeBalance=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw { response: { status: response.status, data: await response.json() } };
      }

      const accounts = await response.json();

      // Mapeo de códigos de subtipo a tipos de cuenta legibles
      const subtypeToType: Record<string, string> = {
        'AHO_STD': 'savings',
        'AHO_JUV': 'savings',
        'AHO_VIV': 'savings',
        'CTE_STD': 'checking',
        'CTE_EMP': 'checking',
        'CTE_PAG': 'checking',
      };

      // Convertir formato del backend al formato local
      return {
        customerId: customerUuid,
        accounts: accounts.map((acc: any) => ({
          accountNumber: acc.accountNumber,
          accountType: subtypeToType[acc.subtypeCode] || 'checking',
          balance: acc.accountingBalance || 0,
          availableBalance: acc.availableBalance || 0,
          currency: 'USD',
          status: acc.status || 'ACTIVE',
          holderName: acc.holderName || 'Cliente',
        })),
      };
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  },

  // Validación de destinatario (muestra nombre del titular)
  async getAccountHolder(accountNumber: string): Promise<AccountHolderResponse> {
    if (USE_MOCK_DATA) {
      await delay(1000); // Simular latencia de red

      // Validar que la cuenta existe en los datos mock
      const holder = mockHolders[accountNumber];

      if (!holder) {
        throw {
          response: {
            status: 404,
            data: {
              code: 'ACCOUNT_NOT_FOUND',
              message: 'La cuenta no existe',
            },
          },
        };
      }

      return holder;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${accountNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw { response: { status: response.status, data: await response.json() } };
      }

      const account = await response.json();

      return {
        accountNumber: account.accountNumber,
        holderName: account.holderName,
        status: account.status,
      };
    } catch (error) {
      console.error('Error fetching account holder:', error);
      throw error;
    }
  },

  // RF-04: Transferencias P2P
  async createTransfer(transferData: TransferRequest): Promise<TransferResponse> {
    if (USE_MOCK_DATA) {
      await delay(1500); // Simular latencia de red

      // Validar cuenta de origen
      const sourceAccount = mockAccounts.accounts.find(
        acc => acc.accountNumber === transferData.sourceAccount
      );

      if (!sourceAccount) {
        throw {
          response: {
            status: 400,
            data: {
              code: 'INVALID_ACCOUNT',
              message: 'Cuenta de origen inválida',
            },
          },
        };
      }

      // Validar fondos suficientes
      if (sourceAccount.availableBalance < transferData.amount) {
        throw {
          response: {
            status: 400,
            data: {
              code: 'INSUFFICIENT_FUNDS',
              message: 'Fondos insuficientes',
            },
          },
        };
      }

      // Validar cuenta destino
      if (!mockHolders[transferData.destinationAccount]) {
        throw {
          response: {
            status: 404,
            data: {
              code: 'ACCOUNT_NOT_FOUND',
              message: 'Cuenta destino no encontrada',
            },
          },
        };
      }

      // Validar que no sea la misma cuenta
      if (transferData.sourceAccount === transferData.destinationAccount) {
        throw {
          response: {
            status: 400,
            data: {
              code: 'SAME_ACCOUNT',
              message: 'No puedes transferir a la misma cuenta',
            },
          },
        };
      }

      // Simular transferencia exitosa
      const newBalance = sourceAccount.availableBalance - transferData.amount;

      // Actualizar saldo mock (solo para simulación en esta sesión)
      sourceAccount.balance = newBalance;
      sourceAccount.availableBalance = newBalance;

      return {
        transactionId: `TRF-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        sourceAccount: transferData.sourceAccount,
        destinationAccount: transferData.destinationAccount,
        amount: transferData.amount,
        newBalance: newBalance,
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/accounts/transfers/p2p`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          sourceAccountNumber: transferData.sourceAccount,
          targetAccountNumber: transferData.destinationAccount,
          amount: transferData.amount,
          reference: transferData.reference || transferData.concept,
        }),
      });

      if (!response.ok) {
        throw { response: { status: response.status, data: await response.json() } };
      }

      const result = await response.json();

      // El backend devuelve un array con 2 transacciones (DEBITO y CREDITO)
      // Usamos la primera (DEBITO) para el comprobante
      const debitTransaction = Array.isArray(result) ? result[0] : result;

      // Convertir formato del backend al formato local
      return {
        transactionId: debitTransaction.transactionUuid,
        status: debitTransaction.status,
        timestamp: debitTransaction.timestamp,
        sourceAccount: debitTransaction.accountNumber || transferData.sourceAccount,
        destinationAccount: transferData.destinationAccount,
        amount: debitTransaction.amount,
        newBalance: debitTransaction.resultingAvailableBalance,
      };
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw error;
    }
  },
};
