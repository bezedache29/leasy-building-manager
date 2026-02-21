import { defineConfig, loadEnv } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig(({ mode }) => {
    // Vite charge les variables du fichier .env
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [
            laravel({
                input: "resources/js/app.tsx",
                refresh: true,
            }),
            react(),
        ],
        server: {
            host: "0.0.0.0",
            port: 5173,
            strictPort: true,
            https: {
                key: fs.readFileSync(`/etc/traefik/certs/wildcard-key.pem`),
                cert: fs.readFileSync(`/etc/traefik/certs/wildcard.pem`),
            },
            hmr: {
                host: env.APP_DOMAIN || "localhost",
                protocol: "wss",
            },
        },
    };
});
