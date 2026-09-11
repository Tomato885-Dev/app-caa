import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import type { Plugin } from 'vite';

/* ============================================================================
   LA NOMINA REAL NO VIAJA EN LOS PAQUETES PUBLICOS
   ----------------------------------------------------------------------------
   `content/seed/users.ts` carga la nomina con import.meta.glob, que es una
   importacion estatica: el compilador la incluye aunque el codigo que la usa
   quede descartado. Con VITE_DEMO_ROSTER=true la aplicacion se comportaba con
   la nomina inventada, pero los 706 correos reales seguian dentro del archivo
   final igualmente.

   Eso importa porque un .aab o un .ipa se abren como un archivo comprimido.
   Cualquiera que descargue la app de la tienda podria sacar de ahi el nombre,
   el curso y el correo de 706 menores de edad.

   Lo mismo pasa con `content/seed/contenido.json`, el contenido exportado
   desde el panel de administracion: lleva el nombre y el correo de quien
   publico cada comunicado.

   Este complemento vacia los dos archivos durante la compilacion, de modo que
   no hay nada que incluir. No hacen falta para funcionar: con servidor, tanto
   la nomina como el contenido se consultan en la base de datos y estas copias
   locales no se usan nunca.
   ========================================================================== */
function sinNominaReal(): Plugin {
  const activo = process.env.VITE_DEMO_ROSTER === 'true';
  return {
    name: 'sin-nomina-real',
    enforce: 'pre',
    transform(_codigo, id) {
      if (!activo) return null;
      if (id.endsWith('roster.ts') && id.includes('content')) {
        return { code: 'export const roster = [];', map: null };
      }
      /* Lo mismo con el contenido exportado: lleva el nombre y el correo de
         quien publico cada cosa. Al vaciarlo, la aplicacion cae sola en el
         contenido de ejemplo, que es lo que hace cuando el archivo no existe. */
      if (id.endsWith('contenido.json')) {
        return { code: '{}', map: null };
      }
      return null;
    },
  };
}

/*
 * Carpeta desde la que se sirve la app.
 *   · Vercel, Netlify o un dominio propio  →  '/'  (valor por defecto)
 *   · GitHub Pages de proyecto             →  '/nombre-del-repositorio/'
 * Se pasa con la variable de entorno BASE_PATH al compilar.
 */
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [sinNominaReal(), react(), tailwindcss()],
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
