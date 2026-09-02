import { seedAnnouncements } from './announcements';
import { seedBenefits } from './benefits';
import { seedEvents } from './events';
import { seedNews } from './news';
import { seedReports } from './reports';
import { seedProjects } from './projects';
import { seedRegistrations, seedSignupActivities } from './signups';
import { seedSportsResults } from './sports';
import { seedUsers } from './users';

/* ============================================================================
   CONTENIDO INICIAL
   ----------------------------------------------------------------------------
   Datos con los que arranca la aplicación. Hay DOS orígenes posibles:

   1. CONTENIDO PROPIO — `contenido.json` en esta misma carpeta.
      Es el archivo que descarga el botón "Exportar contenido" del panel de
      administración. Si existe, manda: es el contenido oficial de la app.

   2. CONTENIDO DE EJEMPLO — los archivos .ts de esta carpeta.
      Se usan mientras no haya un `contenido.json`. Sirven para demostrar la
      app completa y como plantilla del formato que espera cada módulo.

   CÓMO PERSONALIZAR LA APP SIN PROGRAMAR
     1. Publica y edita todo desde el panel de administración.
     2. Pulsa "Exportar contenido": se descarga `contenido.json`.
     3. Guarda ese archivo en `src/content/seed/`, reemplazando el anterior.
   Desde ahí el contenido queda grabado en el proyecto y ya no depende del
   navegador de nadie.

   IMPORTANTE: al editar a mano cualquier archivo .ts de esta carpeta, sube
   `FALLBACK_VERSION`. Ese cambio hace que la base local se vuelva a sembrar.
   ========================================================================== */

/** Versión del contenido de ejemplo. Subirla fuerza a re-sembrar. */
const FALLBACK_VERSION = '2026-08-31.proyectos-13-colaboradores-15';

interface ContentFile {
  version?: string;
  announcements?: unknown[];
  news?: unknown[];
  events?: unknown[];
  signupActivities?: unknown[];
  benefits?: unknown[];
  sportsResults?: unknown[];
  projects?: unknown[];
}

/*
 * Carga opcional: si `contenido.json` no existe, esto queda vacío y la app
 * sigue funcionando con el contenido de ejemplo. No hay que crear el archivo
 * ni dejar uno en blanco.
 */
const found = import.meta.glob('./contenido.json', {
  eager: true,
  import: 'default',
}) as Record<string, ContentFile>;

const own: ContentFile | undefined = Object.values(found)[0];

/** Toma la colección del archivo propio si viene; si no, la de ejemplo. */
function pick<T>(fromFile: unknown[] | undefined, fallback: T[]): T[] {
  return Array.isArray(fromFile) ? (fromFile as T[]) : fallback;
}

/*
 * Inscripciones y reportes de ejemplo solo acompañan al contenido de ejemplo.
 * Con contenido propio no corresponde arrancar con inscritos ni reportes
 * ficticios: son datos de operación, no contenido editorial.
 */
const demoOperations = own ? [] : null;

export const seedData = {
  version: own?.version ?? FALLBACK_VERSION,

  // Las cuentas SIEMPRE salen de la nómina oficial, nunca del archivo.
  users: seedUsers,

  news: pick(own?.news, seedNews),
  events: pick(own?.events, seedEvents),
  signupActivities: pick(own?.signupActivities, seedSignupActivities),
  registrations: demoOperations ?? seedRegistrations,
  announcements: pick(own?.announcements, seedAnnouncements),
  benefits: pick(own?.benefits, seedBenefits),
  sportsResults: pick(own?.sportsResults, seedSportsResults),
  projects: pick(own?.projects, seedProjects),
  reports: demoOperations ?? seedReports,
};

/** ¿La app está usando contenido propio en vez del de ejemplo? */
export const usingOwnContent = Boolean(own);
