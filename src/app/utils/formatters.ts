import type { AccountResponse, TransactionResponse } from '../types/account.types';

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

export const formatDateTime = (value?: string): string => {
  if (!value) return 'Fecha no disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};


export const formatDateOnly = (value?: string): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

export const formatTimeOnly = (value?: string): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

export const maskAccountNumber = (value: string): string => {
  const visible = value.slice(-4);
  return `N.º ••••••••${visible}`;
};

export const fullAccountNumber = (value: string): string => `N.º ${value}`;

export const isTechnicalCode = (value?: string): boolean => {
  if (!value) return false;
  const normalized = value.trim();
  return (
    /^[A-Z0-9]+(?:_[A-Z0-9]+)+$/.test(normalized) ||
    /^[A-Z]{2,}[0-9_\-]*$/.test(normalized) ||
    /^\d{2,5}$/.test(normalized)
  );
};

export const cleanBusinessLabel = (value?: string): string | undefined => {
  const normalized = value?.trim();
  if (!normalized || isTechnicalCode(normalized)) return undefined;
  return normalized;
};

export const getAccountLabel = (account: AccountResponse): string =>
  cleanBusinessLabel(account.operationalAlias) ||
  cleanBusinessLabel(account.accountPurposeName) ||
  cleanBusinessLabel(account.subtypeName) ||
  cleanBusinessLabel(account.productName) ||
  'Cuenta bancaria';

export const getAccountProductLabel = (account: AccountResponse): string | undefined =>
  cleanBusinessLabel(account.subtypeName) || cleanBusinessLabel(account.productName);

export const getAccountBranchLabel = (account: AccountResponse): string | undefined =>
  cleanBusinessLabel(account.branchName);


export const getAccountPurposeLabel = (account: AccountResponse): string | undefined =>
  cleanBusinessLabel(account.accountPurposeName) ||
  (account.accountPurpose ? humanizeStatus(account.accountPurpose) : undefined);

export const getMovementTypeLabel = (transaction: TransactionResponse): string => {
  const movement = (transaction.movementType || transaction.type || '').toUpperCase();
  if (movement === 'CREDITO' || movement === 'CREDIT') return 'Crédito';
  if (movement === 'DEBITO' || movement === 'DEBIT') return 'Débito';
  return 'Movimiento';
};

export const getTransactionLabel = (transaction: TransactionResponse): string =>
  cleanBusinessLabel(transaction.subtypeName) ||
  cleanBusinessLabel(transaction.description) ||
  (getMovementTypeLabel(transaction) === 'Crédito' ? 'Abono recibido' :
    getMovementTypeLabel(transaction) === 'Débito' ? 'Débito realizado' : 'Movimiento bancario');

export const humanizeStatus = (value?: string): string => {
  const normalized = value?.trim();
  if (!normalized) return '';
  return normalized
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/(^|\s)\p{L}/gu, (letter) => letter.toUpperCase());
};

export const getStatusPresentation = (status: string): { label: string; color: string; background: string } => {
  const normalized = status.toUpperCase();
  if (normalized === 'ACTIVA' || normalized === 'ACTIVE') {
    return { label: 'Activa', color: '#137333', background: '#e6f4ea' };
  }
  if (normalized === 'INACTIVA' || normalized === 'INACTIVE') {
    return { label: 'Inactiva', color: '#8a4b08', background: '#fef7e0' };
  }
  if (normalized === 'BLOQUEADA' || normalized === 'BLOCKED') {
    return { label: 'Bloqueada', color: '#b3261e', background: '#fce8e6' };
  }
  if (normalized === 'SUSPENDIDA' || normalized === 'SUSPENDED') {
    return { label: 'Suspendida', color: '#7f1d1d', background: '#fee2e2' };
  }
  return { label: humanizeStatus(status), color: '#4b5563', background: '#f3f4f6' };
};


export const getTransactionChannelLabel = (transaction: TransactionResponse): string => {
  const label = cleanBusinessLabel(transaction.channel);
  if (label) return label;
  if (transaction.channel) return humanizeStatus(transaction.channel);
  return '';
};
