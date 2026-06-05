/**
 * Tipos TypeScript basados en el contrato OpenAPI de Identity Access API
 * Contrato: Banco BanQuito Core V2 - Identity Access API
 */

// ==================== Auth Endpoints ====================

/**
 * Solicitud de login
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Solicitud de renovación de token
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Respuesta de autenticación con tokens
 */
export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  scopes: string[];
}

// ==================== IAM Users (No usado en frontend) ====================

/**
 * Solicitud de creación de usuario de identidad
 */
export interface IdentityUserCreateRequest {
  username: string;
  email?: string;
  password?: string;
  userType: 'CLIENTE' | 'EMPLEADO' | 'SERVICIO';
  externalReferenceUuid?: string;
}

/**
 * Respuesta de usuario de identidad
 */
export interface IdentityUserResponse {
  userUuid: string;
  username: string;
  userType: string;
  status: string;
}

// ==================== Tipos extendidos para el frontend ====================

/**
 * Datos de sesión almacenados en localStorage
 */
export interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number; // Timestamp de expiración
  scopes: string[];
  userUuid?: string;
  username?: string;
}

/**
 * Estado de autenticación
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: {
    username?: string;
    userUuid?: string;
    scopes?: string[];
  } | null;
}
