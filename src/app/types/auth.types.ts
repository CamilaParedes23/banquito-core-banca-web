export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresInSeconds?: number;
  expiresIn?: number;
  sessionUuid?: string;
  actorUuid?: string;
  actorType?: string;
  roles?: string[];
  scopes?: string[];
  subject?: string;
  username?: string;
  referenceUuid?: string;
  referenceType?: string;
  customerUuid?: string;
  requiresPasswordChange?: boolean;
}

export interface AuthenticatedProfile {
  subject: string;
  username: string;
  actorType: string;
  clientId?: string | null;
  roles: string[];
  scopes: string[];
  referenceUuid?: string | null;
  referenceType?: string | null;
  customerUuid?: string | null;
  requiresPasswordChange?: boolean;
}

export interface StoredSession {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresAt: number;
  profile: AuthenticatedProfile;
  customerName?: string;
}
