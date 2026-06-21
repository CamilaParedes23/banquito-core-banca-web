const fs = require('fs');
const { spawn } = require('child_process');

const env = {
  VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || 'http://10.128.0.8:8000/api/v1',
  VITE_REQUEST_TIMEOUT_MS: process.env.VITE_REQUEST_TIMEOUT_MS || '20000',
  VITE_SESSION_WARNING_SECONDS: process.env.VITE_SESSION_WARNING_SECONDS || '120',
  VITE_SWITCH_PORTAL_URL: process.env.VITE_SWITCH_PORTAL_URL || '',
  VITE_ENABLE_P2P_IDEMPOTENCY: process.env.VITE_ENABLE_P2P_IDEMPOTENCY || 'false',
};

const templatePath = '/app/dist/env.template.js';
const outputPath = '/app/dist/env.js';

const template = fs.readFileSync(templatePath, 'utf8');
const content = template.replace(/\$\{([A-Z0-9_]+)\}/g, (_, key) => JSON.stringify(env[key] || ''));

fs.writeFileSync(outputPath, `${content}\n`);

const port = process.env.PORT || '3000';
const server = spawn('serve', ['-s', 'dist', '-l', port], { stdio: 'inherit' });

server.on('exit', (code) => {
  process.exit(code ?? 0);
});

server.on('error', (error) => {
  console.error(error);
  process.exit(1);
});

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    server.kill(signal);
  });
});
