const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');
const asBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined || value === '') return fallback;
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

export const env = {
  apiBaseUrl: normalizeBaseUrl(
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  ),
  requestTimeoutMs: Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS || 20000),
  sessionWarningSeconds: Number(import.meta.env.VITE_SESSION_WARNING_SECONDS || 120),
  switchPortalUrl: (import.meta.env.VITE_SWITCH_PORTAL_URL || '').trim(),
  enableP2pIdempotency: asBoolean(import.meta.env.VITE_ENABLE_P2P_IDEMPOTENCY, false),
} as const;
