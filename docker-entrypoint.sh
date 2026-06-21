#!/bin/sh
set -eu

: "${VITE_API_BASE_URL:=http://localhost:8000/api/v1}"
: "${VITE_REQUEST_TIMEOUT_MS:=20000}"
: "${VITE_SESSION_WARNING_SECONDS:=120}"
: "${VITE_SWITCH_PORTAL_URL:=}"
: "${VITE_ENABLE_P2P_IDEMPOTENCY:=false}"

node <<'EOF'
const fs = require('fs');

const templatePath = '/app/dist/env.template.js';
const outputPath = '/app/dist/env.js';

const env = {
  VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  VITE_REQUEST_TIMEOUT_MS: process.env.VITE_REQUEST_TIMEOUT_MS || '20000',
  VITE_SESSION_WARNING_SECONDS: process.env.VITE_SESSION_WARNING_SECONDS || '120',
  VITE_SWITCH_PORTAL_URL: process.env.VITE_SWITCH_PORTAL_URL || '',
  VITE_ENABLE_P2P_IDEMPOTENCY: process.env.VITE_ENABLE_P2P_IDEMPOTENCY || 'false',
};

const template = fs.readFileSync(templatePath, 'utf8');
const content = template.replace(/\$\{([A-Z0-9_]+)\}/g, (_, key) => JSON.stringify(env[key] ?? ''));

fs.writeFileSync(outputPath, content + '\n');
EOF

exec "$@"
