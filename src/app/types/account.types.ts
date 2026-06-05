// Tipos generados del contrato OpenAPI - Account API
// Banco BanQuito Core V2 - Account API

/**
 * Response del endpoint GET /accounts/{accountNumber}/balance
 */
export interface BalanceResponse {
  accountingBalance: number;
  availableBalance: number;
  retainedAmount: number;
  currency: string;
}

/**
 * Request del endpoint POST /accounts/transfers/p2p
 */
export interface P2PTransferRequest {
  sourceAccountNumber: string;
  targetAccountNumber: string;
  amount: number;
  concept?: string;
}

/**
 * Response del endpoint POST /accounts/transfers/p2p
 */
export interface P2PTransferResponse {
  transactionUuid: string;
  status: string;
  timestamp: string;
  sourceAccountNumber: string;
  targetAccountNumber: string;
  amount: number;
  newBalance?: number;
}

/**
 * Response del endpoint GET /accounts/{accountNumber}
 */
export interface AccountResponse {
  accountNumber: string;
  accountType: string;
  accountSubtypeCode: string;
  balance: number;
  availableBalance: number;
  currency: string;
  status: string;
  holderName: string;
  customerUuid: string;
  branchCode: string;
  createdAt: string;
}

/**
 * Response del endpoint GET /accounts/{accountNumber}/owner
 */
export interface AccountOwnerResponse {
  accountNumber: string;
  holderName: string;
  identification: string;
  status: string;
  customerUuid: string;
}

/**
 * Request del endpoint GET /accounts/{accountNumber}/transactions
 */
export interface TransactionsRequest {
  accountNumber: string;
  limit?: number;
  fromDate?: string;
  toDate?: string;
}

/**
 * Response del endpoint GET /accounts/{accountNumber}/transactions
 */
export interface TransactionResponse {
  transactionUuid: string;
  date: string;
  description: string;
  reference: string;
  amount: number;
  balance: number;
  status: string;
  type: 'CREDIT' | 'DEBIT';
}

/**
 * Tipos extendidos para uso en el frontend
 */
export interface Account {
  id: number;
  uuid: string;
  name: string;
  number: string;
  balance: number;
  availableBalance: number;
  type: string;
  icon: React.ReactNode;
  color: string;
  movements: number;
  interestRate?: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: number;
  uuid: string;
  date: string;
  description: string;
  reference: string;
  amount: number;
  balance: number;
  status: string;
}

/**
 * Errores de API
 */
export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

/**
 * Estados de cuenta
 */
export type AccountStatus = 'ACTIVA' | 'INACTIVA' | 'BLOQUEADA' | 'SUSPENDIDA' | 'CERRADA';

/**
 * Tipos de transacción
 */
export type TransactionType = 'CREDIT' | 'DEBIT';
