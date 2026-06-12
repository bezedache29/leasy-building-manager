import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  // Vite charge les variables du fichier .env
  const env = loadEnv(mode, process.cwd(), '');

  // Definition des chemins des certificats Traefik
  const keyPath = '/etc/traefik/certs/wildcard-key.pem';
  const certPath = '/etc/traefik/certs/wildcard.pem';

  let httpsConfig;

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    httpsConfig = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  }

  return {
    plugins: [
      laravel({
        input: ['resources/css/app.css', 'resources/js/app.tsx'],
        refresh: true,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      // On injecte la configuration HTTPS seulement si elle est definie
      ...(httpsConfig ? { https: httpsConfig } : {}),
      hmr: {
        host: env.APP_DOMAIN || 'localhost',
        // On adapte le protocole websocket (wss si httpsConfig est defini, ws sinon)
        protocol: httpsConfig ? 'wss' : 'ws',
      },
    },
  };
});
