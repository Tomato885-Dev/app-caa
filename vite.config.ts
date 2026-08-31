import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

/*
 * Carpeta desde la que se sirve la app.
 *   · Vercel, Netlify o un dominio propio  →  '/'  (valor por defecto)
 *   · GitHub Pages de proyecto             →  '/nombre-del-repositorio/'
 * Se pasa con la variable de entorno BASE_PATH al compilar.
 */
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true, // permite abrir la app desde el celular en la misma red
  },
  build: {
    rollupOptions: {
      output: {
        // Las dependencias cambian mucho menos que el código propio:
        // separarlas mantiene su caché entre despliegues.
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            '@tanstack/react-query',
            'qrcode-generator',
          ],
        },
      },
    },
  },
});
