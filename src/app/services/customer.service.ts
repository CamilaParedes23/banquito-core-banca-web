// Servicio de Clientes - Customer API
// Banco BanQuito Core V2
// Basado en contrato OpenAPI 3.1.0

import {
  CustomerResponse,
  CustomerUpdateRequest,
} from '../types/customer.types';
import {
  API_BASE_URL,
  USE_MOCK_DATA,
  CUSTOMER_ENDPOINTS,
  DEFAULT_HEADERS,
  DEFAULT_TIMEOUT,
  HTTP_STATUS,
} from '../constants/api.constants';
import { getErrorMessage } from './account.service';

/**
 * Helper para simular delay de red (mock)
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper para obtener token de autenticación
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
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
const mockCustomer: CustomerResponse = {
  uuid: 'cust-uuid-123',
  identification: '1712345678',
  names: 'Juan',
  surnames: 'Díaz García',
  birthDate: '1990-05-15',
  email: 'juan.diaz@banquito.com',
  mobilePhone: '+593 99 123 4567',
  address: 'Av. Amazonas 123, Quito',
  type: 'NATURAL',
  status: 'ACTIVO',
  subtypeCode: 'PERSONA_NATURAL',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-05-30T15:45:00Z',
};

/**
 * Servicio de Clientes - Customer API
 */
export const customerService = {
  /**
   * GET /customers/{customerUuid}
   * Consultar cliente por UUID
   */
  async getCustomer(customerUuid: string): Promise<CustomerResponse> {
    if (USE_MOCK_DATA) {
      await delay(800);
      return mockCustomer;
    }

    const token = getAuthToken();
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${CUSTOMER_ENDPOINTS.GET_CUSTOMER(customerUuid)}`,
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
   * PATCH /customers/{customerUuid}
   * Actualizar datos básicos del cliente
   */
  async updateCustomer(
    customerUuid: string,
    request: CustomerUpdateRequest
  ): Promise<CustomerResponse> {
    if (USE_MOCK_DATA) {
      await delay(1000);
      // Simular actualización
      return {
        ...mockCustomer,
        ...request,
        updatedAt: new Date().toISOString(),
      };
    }

    const token = getAuthToken();
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${CUSTOMER_ENDPOINTS.UPDATE_CUSTOMER(customerUuid)}`,
      {
        method: 'PATCH',
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

  /**
   * GET /customers/by-identification/{identification}
   * Buscar cliente por identificación
   */
  async getCustomerByIdentification(identification: string): Promise<CustomerResponse> {
    if (USE_MOCK_DATA) {
      await delay(800);
      // Solo retornar si coincide con el mock
      if (identification === mockCustomer.identification) {
        return mockCustomer;
      }
      throw {
        response: {
          status: HTTP_STATUS.NOT_FOUND,
          data: {
            code: 'CUSTOMER_NOT_FOUND',
            message: 'Cliente no encontrado',
          },
        },
      };
    }

    const token = getAuthToken();
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${CUSTOMER_ENDPOINTS.GET_CUSTOMER_BY_IDENTIFICATION(identification)}`,
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
};

export default customerService;
