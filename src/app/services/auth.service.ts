import type { AuthTokenResponse, LoginRequest } from '../types/auth.types';
import { httpService } from './http.service';
import { sessionService } from './session.service';

export const authService = {
  login(credentials: LoginRequest): Promise<AuthTokenResponse> {
    return httpService.request<AuthTokenResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: credentials,
    });
  },

  me(accessToken?: string): Promise<AuthTokenResponse> {
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined;
    return httpService.request<AuthTokenResponse>('/auth/me', {
      method: 'GET',
      auth: !accessToken,
      headers,
    });
  },

  async refreshSession(): Promise<boolean> {
    const current = sessionService.get();
    if (!current?.refreshToken) return false;

    const tokenResponse = await httpService.request<AuthTokenResponse>('/auth/refresh', {
      method: 'POST',
      auth: false,
      body: { refreshToken: current.refreshToken },
    });
    const profileResponse = await this.me(tokenResponse.accessToken);
    return Boolean(sessionService.refresh(tokenResponse, profileResponse));
  },

  async logout(): Promise<void> {
    try {
      if (sessionService.getAccessToken()) {
        await httpService.request<void>('/auth/logout', {
          method: 'POST',
          timeoutMs: 5000,
        });
      }
    } catch {
      // El cierre local debe completarse aunque el endpoint de logout no esté disponible.
    } finally {
      sessionService.clear();
    }
  },
};
