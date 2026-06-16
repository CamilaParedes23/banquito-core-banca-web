import type { CustomerResponse } from '../types/customer.types';
import { httpService } from './http.service';

const compact = (values: Array<string | undefined>): string =>
  values.filter((value): value is string => Boolean(value?.trim())).join(' ').trim();

export const customerService = {
  getCustomer(customerUuid: string): Promise<CustomerResponse> {
    return httpService.request<CustomerResponse>(`/customers/${encodeURIComponent(customerUuid)}`);
  },

  getMassPaymentsEnabled(customer: CustomerResponse): boolean | undefined {
    if (typeof customer.massPaymentsEnabled === 'boolean') return customer.massPaymentsEnabled;
    if (typeof customer.massPaymentEnabled === 'boolean') return customer.massPaymentEnabled;
    if (typeof customer.pagosMasivosHabilitados === 'boolean') return customer.pagosMasivosHabilitados;

    const status = (customer.massPaymentsStatus || customer.massPaymentStatus || '').toUpperCase();
    if (['ENABLED', 'ACTIVE', 'ACTIVO', 'HABILITADO'].includes(status)) return true;
    if (['DISABLED', 'INACTIVE', 'INACTIVO', 'DESHABILITADO'].includes(status)) return false;
    return undefined;
  },

  getDisplayName(customer: CustomerResponse, fallback: string): string {
    const naturalName = compact([
      customer.naturalPerson?.names || customer.names,
      customer.naturalPerson?.lastNames ||
        customer.naturalPerson?.surnames ||
        customer.lastNames ||
        customer.surnames,
    ]);

    return (
      naturalName ||
      customer.legalPerson?.legalName ||
      customer.legalPerson?.businessName ||
      customer.legalName ||
      customer.razonSocial ||
      customer.businessName ||
      fallback
    );
  },
};
