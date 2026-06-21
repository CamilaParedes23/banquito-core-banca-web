#!/bin/sh
set -eu

: "${VITE_API_BASE_URL:=http://localhost:8000/api/v1}"
: "${VITE_REQUEST_TIMEOUT_MS:=20000}"
: "${VITE_SESSION_WARNING_SECONDS:=120}"
: "${VITE_SWITCH_PORTAL_URL:=}"
: "${VITE_ENABLE_P2P_IDEMPOTENCY:=false}"

envsubst '${VITE_API_BASE_URL} ${VITE_REQUEST_TIMEOUT_MS} ${VITE_SESSION_WARNING_SECONDS} ${VITE_SWITCH_PORTAL_URL} ${VITE_ENABLE_P2P_IDEMPOTENCY}' \
  < /usr/share/nginx/html/env.template.js \
  > /usr/share/nginx/html/env.js
