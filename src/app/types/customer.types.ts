// Tipos generados del contrato OpenAPI - Customer API
// Banco BanQuito Core V2 - Customer API

/**
 * Request del endpoint POST /customers/natural-persons
 */
export interface NaturalPersonCreateRequest {
  identification: string;
  names: string;
  surnames: string;
  birthDate: string;
  email?: string;
  mobilePhone?: string;
  address?: string;
  subtypeCode?: string;
}

/**
 * Request del endpoint POST /customers/legal-persons
 */
export interface LegalPersonCreateRequest {
  ruc: string;
  legalName: string;
  incorporationDate: string;
  email?: string;
  mobilePhone?: string;
  address?: string;
  subtypeCode?: string;
}

/**
 * Response del endpoint GET /customers/{customerUuid}
 */
export interface CustomerResponse {
  uuid: string;
  identification: string;
  names?: string;
  surnames?: string;
  legalName?: string;
  birthDate?: string;
  incorporationDate?: string;
  email?: string;
  mobilePhone?: string;
  address?: string;
  type: 'NATURAL' | 'LEGAL';
  status: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';
  subtypeCode?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request del endpoint PATCH /customers/{customerUuid}
 */
export interface CustomerUpdateRequest {
  names?: string;
  surnames?: string;
  legalName?: string;
  email?: string;
  mobilePhone?: string;
  address?: string;
}

/**
 * Request del endpoint PATCH /customers/{customerUuid}/status
 */
export interface CustomerStatusChangeRequest {
  status: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';
  reason: string;
}

/**
 * Request del endpoint POST /customers/{customerUuid}/relationships
 */
export interface CustomerRelationshipRequest {
  relatedCustomerUuid: string;
  relationshipType: 'REPRESENTANTE_LEGAL' | 'APODERADO' | 'CONTACTO_AUTORIZADO' | 'BENEFICIARIO';
  validFrom?: string;
  validTo?: string;
  notes?: string;
}

/**
 * Request del endpoint PATCH /customers/{customerUuid}/mass-payments-status
 */
export interface MassPaymentsStatusRequest {
  enabled: boolean;
  reason?: string;
}

/**
 * Tipos extendidos para uso en el frontend
 */
export interface Customer {
  uuid: string;
  identification: string;
  fullName: string;
  email?: string;
  mobilePhone?: string;
  address?: string;
  type: 'NATURAL' | 'LEGAL';
  status: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';
  avatar?: string;
}

/**
 * Estados de cliente
 */
export type CustomerStatus = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';

/**
 * Tipos de cliente
 */
export type CustomerType = 'NATURAL' | 'LEGAL';

/**
 * Tipos de relación
 */
export type RelationshipType = 'REPRESENTANTE_LEGAL' | 'APODERADO' | 'CONTACTO_AUTORIZADO' | 'BENEFICIARIO';
