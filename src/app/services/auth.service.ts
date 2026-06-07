/**
 * Servicio de autenticación basado en el contrato OpenAPI de Identity Access API
 * Contrato: Banco BanQuito Core V2 - Identity Access API
 */

import {
  API_BASE_URL,
  USE_MOCK_DATA,
  AUTH_ENDPOINTS,
  API_ERROR_CODES,
  HTTP_STATUS,
  DEFAULT_HEADERS,
  DEFAULT_TIMEOUT,
} from '../constants/api.constants';
import type {
  LoginRequest,
  RefreshTokenRequest,
  AuthTokenResponse,
  SessionData,
} from '../types/auth.types';

// ==================== Helper Functions ====================

/**
 * Simula delay de red para mock data
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Manejo de errores amigables para Auth API
 */
export const getAuthErrorMessage = (error: any): string => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        if (data.code === API_ERROR_CODES.INVALID_CREDENTIALS) {
          return 'Usuario o contraseña incorrectos.';
        }
        if (data.code === API_ERROR_CODES.VALIDATION_ERROR) {
          return 'Los datos ingresados no son válidos.';
        }
        return data.message || 'La solicitud contiene datos inválidos.';

      case HTTP_STATUS.UNAUTHORIZED:
        if (data.code === API_ERROR_CODES.TOKEN_EXPIRED) {
          return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        }
        if (data.code === API_ERROR_CODES.INVALID_TOKEN) {
          return 'Token inválido. Por favor, inicia sesión nuevamente.';
        }
        return 'No estás autorizado para realizar esta acción.';

      case HTTP_STATUS.FORBIDDEN:
        return 'No tienes permisos para realizar esta acción.';

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
 * Timeout para requests
 */
const withTimeout = (promise: Promise<Response>, timeout: number = DEFAULT_TIMEOUT): Promise<Response> => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ]) as Promise<Response>;
};

// ==================== Local Storage Helpers ====================

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  EXPIRES_AT: 'expires_at',
  SCOPES: 'scopes',
  USER_UUID: 'user_uuid',
  ACTOR_UUID: 'actor_uuid',
  USERNAME: 'username',
};

/**
 * Guardar sesión en localStorage
 */
export const saveSession = (authResponse: AuthTokenResponse, userUuid?: string, username?: string): void => {
  const expiresAt = Date.now() + (authResponse.expiresInSeconds * 1000);

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authResponse.accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authResponse.refreshToken);
  localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
  localStorage.setItem(STORAGE_KEYS.SCOPES, JSON.stringify(authResponse.scopes));

  if (userUuid) {
    localStorage.setItem(STORAGE_KEYS.USER_UUID, userUuid);
  }
  if (authResponse.actorUuid) {
    localStorage.setItem(STORAGE_KEYS.ACTOR_UUID, authResponse.actorUuid);
  }
  if (username) {
    localStorage.setItem(STORAGE_KEYS.USERNAME, username);
  }
};

/**
 * Obtener sesión desde localStorage
 */
export const getSession = (): SessionData | null => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
  const scopes = localStorage.getItem(STORAGE_KEYS.SCOPES);
  const userUuid = localStorage.getItem(STORAGE_KEYS.USER_UUID);
  const username = localStorage.getItem(STORAGE_KEYS.USERNAME);

  if (!accessToken || !refreshToken || !expiresAt) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    expiresIn: parseInt(expiresAt) - Date.now(),
    expiresAt: parseInt(expiresAt),
    scopes: scopes ? JSON.parse(scopes) : [],
    userUuid: userUuid || undefined,
    username: username || undefined,
  };
};

/**
 * Limpiar sesión de localStorage
 */
export const clearSession = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
  localStorage.removeItem(STORAGE_KEYS.SCOPES);
  localStorage.removeItem(STORAGE_KEYS.USER_UUID);
  localStorage.removeItem(STORAGE_KEYS.USERNAME);
};

/**
 * Verificar si el token está expirado
 */
export const isTokenExpired = (): boolean => {
  const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
  if (!expiresAt) return true;

  return Date.now() >= parseInt(expiresAt);
};

/**
 * Obtener access token
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

// ==================== Mock Data ====================

const mockLoginResponse: AuthTokenResponse = {
  accessToken: 'mock_access_token_' + Date.now(),
  refreshToken: 'mock_refresh_token_' + Date.now(),
  tokenType: 'Bearer',
  expiresInSeconds: 3600,
  sessionUuid: 'mock-session-uuid',
  actorUuid: 'mock-actor-uuid',
  actorType: 'CLIENTE',
  roles: ['CUSTOMER'],
  scopes: ['read:accounts', 'write:transfers', 'read:profile'],
};

// ==================== Auth Service ====================

export const authService = {
  /**
   * Login - Autenticar usuario
   * POST /auth/login
   */
  async login(credentials: LoginRequest): Promise<AuthTokenResponse> {
    if (USE_MOCK_DATA) {
      await delay(1000); // Simular latencia de red

      // Validar credenciales mock
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        return mockLoginResponse;
      }

      throw {
        response: {
          status: HTTP_STATUS.UNAUTHORIZED,
          data: {
            code: API_ERROR_CODES.INVALID_CREDENTIALS,
            message: 'Credenciales inválidas',
          },
        },
      };
    }

    try {
      const response = await withTimeout(
        fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`, {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(credentials),
        })
      );

      if (!response.ok) {
        throw {
          response: {
            status: response.status,
            data: await response.json(),
          },
        };
      }

      return await response.json();
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  /**
   * Refresh Token - Renovar access token
   * POST /auth/refresh
   */
  async refreshToken(refreshToken: string): Promise<AuthTokenResponse> {
    if (USE_MOCK_DATA) {
      await delay(500); // Simular latencia de red
      return mockLoginResponse;
    }

    try {
      const response = await withTimeout(
        fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH}`, {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify({ refreshToken }),
        })
      );

      if (!response.ok) {
        throw {
          response: {
            status: response.status,
            data: await response.json(),
          },
        };
      }

      return await response.json();
    } catch (error) {
      console.error('Error en refresh token:', error);
      throw error;
    }
  },

  /**
   * Logout - Cerrar sesión
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    const accessToken = getAccessToken();

    if (USE_MOCK_DATA) {
      await delay(300); // Simular latencia de red
      clearSession();
      return;
    }

    try {
      if (accessToken) {
        await withTimeout(
          fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.LOGOUT}`, {
            method: 'POST',
            headers: {
              ...DEFAULT_HEADERS,
              'Authorization': `Bearer ${accessToken}`,
            },
          })
        );
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Siempre limpiar sesión localmente
      clearSession();
    }
  },
};

/**
 * Obtener detalle del usuario (incluye UUID_REFERENCIA_EXTERNA)
 */
export const getUserDetail = async (userUuid: string): Promise<any> => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const response = await fetch(`${API_BASE_URL}/iam/users/${userUuid}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Error fetching user detail');
  }

  return response.json();
};
