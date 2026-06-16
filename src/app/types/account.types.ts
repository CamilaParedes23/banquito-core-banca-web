export type AccountStatus = 'ACTIVA' | 'INACTIVA' | 'BLOQUEADA' | 'SUSPENDIDA' | 'CERRADA' | string;

export interface AccountResponse {
  accountUuid: string;
  accountNumber: string;
  customerUuid: string;
  identification?: string;
  holderName: string;
  branchCode?: string;
  branchName?: string;
  subtypeCode?: string;
  subtypeName?: string;
  productName?: string;
  status: AccountStatus;
  accountingBalance: number;
  availableBalance: number;
  withheldAmount?: number;
  favoritePaymentAccount?: boolean;
  massPaymentMainAccount?: boolean;
  accountPurpose?: string;
  accountPurposeName?: string;
  operationalAlias?: string;
}

export interface AccountOwnerResponse {
  accountNumber: string;
  holderName?: string;
  identification?: string;
  status: string;
  customerUuid?: string;
  verified: boolean;
}

export interface TransactionResponse {
  transactionUuid: string;
  date: string;
  description: string;
  subtypeName?: string;
  reference?: string;
  amount: number;
  balance?: number;
  status?: string;
  type?: 'CREDIT' | 'DEBIT' | string;
  movementType?: string;
  subtypeCode?: string;
  accountingDate?: string;
  channel?: string;
  accountNumber?: string;
}

export interface TransactionsRequest {
  accountNumber: string;
  limit?: number;
  fromDate?: string;
  toDate?: string;
}

export interface P2PTransferRequest {
  sourceAccountNumber: string;
  targetAccountNumber: string;
  amount: number;
  reference?: string;
}

export interface P2PTransferResponse {
  transactionUuid: string;
  status: string;
  timestamp: string;
  sourceAccountNumber: string;
  targetAccountNumber: string;
  amount: number;
  fee?: number;
  newBalance?: number;
  correlationId: string;
}
