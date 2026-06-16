import { env } from '../config/env';
import { sessionService } from './session.service';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: unknown,
    public readonly correlationId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
  timeoutMs?: number;
  correlationId?: string;
}

const createRequestId = (): string =>
  globalThis.crypto?.randomUUID?.() ||
  `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const parseResponse = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const getFriendlyApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 400) return error.message || 'La solicitud contiene datos inválidos.';
    if (error.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
    if (error.status === 403) return 'No tienes permisos para realizar esta acción.';
    if (error.status === 404) return error.message || 'No se encontró la información solicitada.';
    if (error.status === 409) return error.message || 'La operación ya fue procesada o presenta un conflicto.';
    if (error.status >= 500) return 'El servicio no está disponible temporalmente. Intenta nuevamente.';
    return error.message || 'No fue posible completar la operación.';
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'La operación tardó demasiado. Verifica que los servicios estén disponibles e intenta nuevamente.';
  }

  return 'No se pudo conectar con el Core Bancario. Verifica la disponibilidad de los servicios.';
};

export const httpService = {
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const {
      auth = true,
      timeoutMs = env.requestTimeoutMs,
      correlationId = createRequestId(),
      headers,
      body,
      ...fetchOptions
    } = options;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    const token = auth ? sessionService.getAccessToken() : null;

    const requestHeaders = new Headers(headers);
    requestHeaders.set('Accept', 'application/json');
    requestHeaders.set('X-Correlation-Id', correlationId);

    if (body !== undefined) requestHeaders.set('Content-Type', 'application/json');
    if (token) requestHeaders.set('Authorization', `Bearer ${token}`);

    try {
      const response = await fetch(`${env.apiBaseUrl}${path}`, {
        ...fetchOptions,
        headers: requestHeaders,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      const payload = await parseResponse(response);
      const responseCorrelationId =
        response.headers.get('X-Correlation-Id') || correlationId;

      if (!response.ok) {
        const data = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;
        const message =
          (typeof data.message === 'string' && data.message) ||
          (typeof payload === 'string' && payload) ||
          `Error HTTP ${response.status}`;

        if (response.status === 401 && auth) {
          sessionService.clear();
          window.dispatchEvent(new CustomEvent('banquito:unauthorized'));
        }

        throw new ApiError(
          message,
          response.status,
          typeof data.code === 'string' ? data.code : undefined,
          data.details,
          responseCorrelationId,
        );
      }

      return payload as T;
    } finally {
      window.clearTimeout(timeoutId);
    }
  },

  createRequestId,
};
