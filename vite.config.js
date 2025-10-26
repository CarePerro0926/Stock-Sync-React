// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // ← permite conexiones desde fuera de localhost
    port: 5173,
    strictPort: true,
    allowedHosts: ['.ngrok-free.dev'] // ← permite cualquier enlace de ngrok
  }
});