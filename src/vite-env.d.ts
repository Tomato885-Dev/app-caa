/// <reference types="vite/client" />

/* Tipos del entorno de Vite. Habilita `import.meta.glob`, que se usa en
   `src/content/seed/index.ts` para cargar `contenido.json` solo si existe. */

interface ImportMetaEnv {
  /** Dirección del proyecto de Supabase. Vacío = la app funciona sin servidor. */
  readonly VITE_SUPABASE_URL?: string;
  /** Clave pública del proyecto. Lo que protege los datos son las reglas de
   *  acceso de la base de datos, no el secreto de esta clave. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Fuerza la nómina de demostración aunque exista la real. */
  readonly VITE_DEMO_ROSTER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
