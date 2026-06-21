type RuntimeEnv = Partial<Record<keyof ImportMetaEnv, string>>;

const runtimeEnv: RuntimeEnv = window.__APP_CONFIG__ || {};

const readEnv = (key: keyof ImportMetaEnv): string | undefined =>
  runtimeEnv[key] ?? import.meta.env[key];

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');
const asBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined || value === '') return fallback;
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

export const env = {
  apiBaseUrl: normalizeBaseUrl(
    readEnv('VITE_API_BASE_URL') || 'http://localhost:8000/api/v1',
  ),
  requestTimeoutMs: Number(readEnv('VITE_REQUEST_TIMEOUT_MS') || 20000),
  sessionWarningSeconds: Number(readEnv('VITE_SESSION_WARNING_SECONDS') || 120),
  switchPortalUrl: (readEnv('VITE_SWITCH_PORTAL_URL') || '').trim(),
  enableP2pIdempotency: asBoolean(readEnv('VITE_ENABLE_P2P_IDEMPOTENCY'), false),
} as const;
