/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_REQUEST_TIMEOUT_MS?: string;
  readonly VITE_SESSION_WARNING_SECONDS?: string;
  readonly VITE_SWITCH_PORTAL_URL?: string;
  readonly VITE_ENABLE_P2P_IDEMPOTENCY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
