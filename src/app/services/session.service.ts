import type {
  AuthenticatedProfile,
  AuthTokenResponse,
  StoredSession,
} from '../types/auth.types';

const SESSION_KEY = 'banquito.web.session.v1';
const LEGACY_KEYS = [
  'access_token',
  'refresh_token',
  'expires_at',
  'scopes',
  'roles',
  'user_uuid',
  'actor_uuid',
  'actor_type',
  'customer_uuid',
  'reference_uuid',
  'reference_type',
  'username',
  'customer_name',
  'authToken',
  'userId',
];

const decodeJwtExpiration = (token: string): number | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const decoded = JSON.parse(atob(padded));
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

const normalizeProfile = (
  tokenResponse: AuthTokenResponse,
  profileResponse: AuthTokenResponse,
  fallbackUsername: string,
): AuthenticatedProfile => ({
  subject:
    profileResponse.subject ||
    tokenResponse.subject ||
    profileResponse.actorUuid ||
    tokenResponse.actorUuid ||
    '',
  username: profileResponse.username || tokenResponse.username || fallbackUsername,
  actorType: profileResponse.actorType || tokenResponse.actorType || '',
  clientId: null,
  roles: profileResponse.roles || tokenResponse.roles || [],
  scopes: profileResponse.scopes || tokenResponse.scopes || [],
  referenceUuid: profileResponse.referenceUuid || tokenResponse.referenceUuid || null,
  referenceType: profileResponse.referenceType || tokenResponse.referenceType || null,
  customerUuid:
    profileResponse.customerUuid ||
    tokenResponse.customerUuid ||
    profileResponse.referenceUuid ||
    tokenResponse.referenceUuid ||
    null,
  requiresPasswordChange:
    profileResponse.requiresPasswordChange ?? tokenResponse.requiresPasswordChange ?? false,
});

const calculateExpiresAt = (response: AuthTokenResponse): number => {
  const explicitSeconds = response.expiresInSeconds ?? response.expiresIn;
  if (typeof explicitSeconds === 'number' && explicitSeconds > 0) {
    return Date.now() + explicitSeconds * 1000;
  }
  return decodeJwtExpiration(response.accessToken) || Date.now() + 60 * 60 * 1000;
};

const notifySessionChanged = (): void => {
  window.dispatchEvent(new Event('banquito:session-changed'));
};

export const sessionService = {
  create(
    tokenResponse: AuthTokenResponse,
    profileResponse: AuthTokenResponse,
    fallbackUsername: string,
  ): StoredSession {
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));

    const session: StoredSession = {
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      tokenType: tokenResponse.tokenType || 'Bearer',
      expiresAt: calculateExpiresAt(tokenResponse),
      profile: normalizeProfile(tokenResponse, profileResponse, fallbackUsername),
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    notifySessionChanged();
    return session;
  },

  get(): StoredSession | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    try {
      const session = JSON.parse(raw) as StoredSession;
      if (!session.accessToken || !session.profile || !session.expiresAt) return null;
      return session;
    } catch {
      this.clear();
      return null;
    }
  },

  update(updates: Partial<StoredSession>): StoredSession | null {
    const current = this.get();
    if (!current) return null;
    const next = { ...current, ...updates };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    notifySessionChanged();
    return next;
  },

  setCustomerName(customerName: string): void {
    if (!customerName.trim()) return;
    sessionService.update({ customerName: customerName.trim() });
  },

  refresh(
    tokenResponse: AuthTokenResponse,
    profileResponse?: AuthTokenResponse,
  ): StoredSession | null {
    const current = this.get();
    if (!current || !tokenResponse.accessToken) return null;

    const nextProfile = profileResponse
      ? normalizeProfile(tokenResponse, profileResponse, current.profile.username)
      : current.profile;

    const next: StoredSession = {
      ...current,
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken || current.refreshToken,
      tokenType: tokenResponse.tokenType || current.tokenType || 'Bearer',
      expiresAt: calculateExpiresAt(tokenResponse),
      profile: nextProfile,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    notifySessionChanged();
    return next;
  },

  clear(): void {
    localStorage.removeItem(SESSION_KEY);
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    notifySessionChanged();
  },

  isExpired(session?: StoredSession | null): boolean {
    const current = session ?? sessionService.get();
    return !current || Date.now() >= current.expiresAt;
  },

  isAuthenticated(): boolean {
    const session = sessionService.get();
    return Boolean(session && !sessionService.isExpired(session));
  },

  getAccessToken(): string | null {
    const session = sessionService.get();
    return session && !sessionService.isExpired(session) ? session.accessToken : null;
  },

  hasScope(scope: string): boolean {
    return this.get()?.profile.scopes.includes(scope) ?? false;
  },

  hasAnyRole(roles: string[]): boolean {
    const currentRoles = this.get()?.profile.roles || [];
    return roles.some((role) => currentRoles.includes(role));
  },
};
