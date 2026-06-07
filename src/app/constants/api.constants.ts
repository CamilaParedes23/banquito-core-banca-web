// Constantes de API - Banco BanQuito Core V2
// Basado en contratos OpenAPI

/**
 * URL base de la API
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Flag para usar datos mock en desarrollo
 */
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

/**
 * Endpoints de Account API
 */
export const ACCOUNT_ENDPOINTS = {
  GET_ACCOUNT: (accountNumber: string) => `/accounts/${accountNumber}`,
  GET_ACCOUNT_BALANCE: (accountNumber: string) => `/accounts/${accountNumber}/balance`,
  GET_ACCOUNT_TRANSACTIONS: (accountNumber: string) => `/accounts/${accountNumber}/transactions`,
  GET_ACCOUNT_OWNER: (accountNumber: string) => `/accounts/${accountNumber}/owner`,
  GET_ACCOUNTS_BY_CUSTOMER: (customerUuid: string) => `/accounts/by-customer/${customerUuid}`,
  TRANSFER_P2P: '/accounts/transfers/p2p',
} as const;

/**
 * Endpoints de Customer API
 */
export const CUSTOMER_ENDPOINTS = {
  GET_CUSTOMER: (customerUuid: string) => `/customers/${customerUuid}`,
  UPDATE_CUSTOMER: (customerUuid: string) => `/customers/${customerUuid}`,
  GET_CUSTOMER_BY_IDENTIFICATION: (identification: string) => `/customers/by-identification/${identification}`,
} as const;

/**
 * Endpoints de Auth API
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
} as const;

/**
 * Endpoints de Document API
 */
export const DOCUMENT_ENDPOINTS = {
  DOWNLOAD_DOCUMENT: (documentUuid: string) => `/documents/${documentUuid}/download`,
} as const;

/**
 * Códigos de error de API
 */
export const API_ERROR_CODES = {
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INVALID_ACCOUNT: 'INVALID_ACCOUNT',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
  SAME_ACCOUNT: 'SAME_ACCOUNT',
  ACCOUNT_BLOCKED: 'ACCOUNT_BLOCKED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
} as const;

/**
 * Estados HTTP
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Headers por defecto
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;

/**
 * Timeout por defecto en milisegundos
 */
export const DEFAULT_TIMEOUT = 30000;

/**
 * Límite de transacciones por defecto
 */
export const DEFAULT_TRANSACTIONS_LIMIT = 20;

/**
 * Límite máximo de transacciones
 */
export const MAX_TRANSACTIONS_LIMIT = 200;
