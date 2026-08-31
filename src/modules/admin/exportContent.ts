import { db, readSeedSignature } from '@/core/data';
import type { Repository } from '@/core/data';
import type { BaseEntity } from '@/core/types';

/* ============================================================================
   EXPORTAR EL CONTENIDO CARGADO
   ----------------------------------------------------------------------------
   Convierte todo lo publicado desde la app en un archivo `contenido.json` que
   se guarda dentro del proyecto. A partir de ese momento el contenido deja de
   vivir solo en un navegador: pasa a ser parte de la aplicación.

   PARA QUÉ SIRVE
   Permite personalizar la app trabajando cómodo —con los formularios, desde el
   teléfono— y luego dejar ese trabajo grabado en firme, sin escribir código.

   QUÉ NO SE EXPORTA
   • `users`        se genera desde la nómina (`src/content/roster.ts`).
   • `registrations` y `reports` son datos de operación, no contenido: quiénes
     se inscribieron y qué se reportó no corresponde congelarlos en el arranque.
   ========================================================================== */

/** Colecciones que forman el contenido editorial del Centro de Alumnos. */
export const EXPORTED_COLLECTIONS = [
  'announcements',
  'news',
  'events',
  'signupActivities',
  'benefits',
  'sportsResults',
  'projects',
  'communityGroups',
  'marketplaceListings',
] as const;

export type ExportedCollection = (typeof EXPORTED_COLLECTIONS)[number];

/** Nombre legible de cada colección, para el resumen que ve el administrador. */
export const COLLECTION_LABEL: Record<ExportedCollection, string> = {
  announcements: 'Comunicados',
  news: 'Noticias',
  events: 'Eventos',
  signupActivities: 'Inscripciones',
  benefits: 'Beneficios',
  sportsResults: 'Resultados 365',
  projects: 'Proyectos',
  communityGroups: 'Comunidad',
  marketplaceListings: 'Marketplace',
};

const repositories: Record<ExportedCollection, Repository<BaseEntity>> = {
  announcements: db.announcements as Repository<BaseEntity>,
  news: db.news as Repository<BaseEntity>,
  events: db.events as Repository<BaseEntity>,
  signupActivities: db.signupActivities as Repository<BaseEntity>,
  benefits: db.benefits as Repository<BaseEntity>,
  sportsResults: db.sportsResults as Repository<BaseEntity>,
  projects: db.projects as Repository<BaseEntity>,
  communityGroups: db.communityGroups as Repository<BaseEntity>,
  marketplaceListings: db.marketplaceListings as Repository<BaseEntity>,
};

export type ExportCounts = Record<ExportedCollection, number>;

/**
 * Marca de versión del archivo exportado.
 * Al cambiar, la app vuelve a sembrar el navegador con el contenido nuevo, así
 * que cada exportación se aplica sola al reemplazar el archivo.
 */
function versionStamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    '.',
    pad(date.getHours()),
    pad(date.getMinutes()),
  ].join('');
}

/** Lee todas las colecciones exportables y arma el objeto del archivo. */
export async function buildContentSnapshot(): Promise<{
  payload: Record<string, unknown>;
  counts: ExportCounts;
  total: number;
}> {
  const now = new Date();
  const entries = await Promise.all(
    EXPORTED_COLLECTIONS.map(async (name) => [name, await repositories[name].list()] as const),
  );

  const counts = Object.fromEntries(
    entries.map(([name, rows]) => [name, rows.length]),
  ) as ExportCounts;

  const payload: Record<string, unknown> = {
    /* Comentarios dentro del propio archivo: quien lo abra entiende qué es. */
    _leeme:
      'Contenido de la App CAA exportado desde el panel de administración. ' +
      'Guarda este archivo en src/content/seed/contenido.json para que sea el contenido oficial de la aplicación.',
    version: versionStamp(now),
    exportadoEl: now.toISOString(),
  };

  for (const [name, rows] of entries) payload[name] = rows;

  return {
    payload,
    counts,
    total: entries.reduce((sum, [, rows]) => sum + rows.length, 0),
  };
}

/** Descarga el contenido como `contenido.json`. */
export async function downloadContentSnapshot(): Promise<{
  counts: ExportCounts;
  total: number;
}> {
  const { payload, counts, total } = await buildContentSnapshot();

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'contenido.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return { counts, total };
}


/* ============================================================================
   CAMBIOS SIN EXPORTAR
   ----------------------------------------------------------------------------
   Compara lo que hay ahora en el navegador con el contenido con el que arrancó
   la aplicación. La diferencia es exactamente el trabajo que todavía no está
   guardado en el proyecto y que se perdería al restaurar o al re-sembrar.
   ========================================================================== */

export interface PendingChanges {
  added: number;
  edited: number;
  removed: number;
  total: number;
}

/**
 * Compara con la huella del último sembrado, no con el contenido inicial en
 * memoria: ese usa fechas relativas ("hace 4 horas") que se recalculan en cada
 * carga y harían parecer editado todo lo que nadie tocó.
 *
 * Devuelve `null` si no hay huella guardada, es decir, si no se puede saber.
 */
export async function getPendingChanges(): Promise<PendingChanges | null> {
  const signature = readSeedSignature();
  if (!signature) return null;

  let added = 0;
  let edited = 0;
  let removed = 0;

  await Promise.all(
    EXPORTED_COLLECTIONS.map(async (name) => {
      const rows = await repositories[name].list();
      const current = new Map(rows.map((row) => [row.id, row.updatedAt]));
      const initial = signature[name] ?? {};

      for (const [id, updatedAt] of current) {
        if (!(id in initial)) added += 1;
        else if (initial[id] !== updatedAt) edited += 1;
      }
      for (const id of Object.keys(initial)) {
        if (!current.has(id)) removed += 1;
      }
    }),
  );

  return { added, edited, removed, total: added + edited + removed };
}
