export interface CustomerResponse {
  uuid?: string;
  customerUuid?: string;
  identification?: string;
  type?: string;
  status?: string;
  massPaymentsEnabled?: boolean;
  massPaymentEnabled?: boolean;
  massPaymentsStatus?: string;
  massPaymentStatus?: string;
  pagosMasivosHabilitados?: boolean;
  naturalPerson?: {
    names?: string;
    lastNames?: string;
    surnames?: string;
  };
  legalPerson?: {
    legalName?: string;
    businessName?: string;
  };
  names?: string;
  surnames?: string;
  lastNames?: string;
  legalName?: string;
  razonSocial?: string;
  businessName?: string;
}
