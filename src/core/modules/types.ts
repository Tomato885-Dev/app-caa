import type { LucideIcon } from 'lucide-react';
import type { RouteObject } from 'react-router-dom';
import type { AuthorRef, ContentKind, ID, ModerationStatus, Role } from '@/core/types';
import type { Tone } from '@/ui/tone';

/* ============================================================================
   CONTRATO DE MÓDULO
   ----------------------------------------------------------------------------
   Un módulo es una carpeta autónoma dentro de `src/modules/` que describe a sí
   misma: sus rutas, su lugar en la navegación, quién puede verla y qué
   contenido suyo pasa por moderación.

   Agregar un apartado nuevo a la app = crear la carpeta, exportar un
   `AppModule` y añadir su id en `src/modules/index.ts` y en
   `appConfig.enabledModules`. Nada más cambia.
   ========================================================================== */

/** Un elemento pendiente de revisión, normalizado para la cola de moderación. */
export interface ModerationItem {
  id: ID;
  kind: ContentKind;
  title: string;
  excerpt: string;
  author: AuthorRef;
  createdAt: string;
  status: ModerationStatus;
  /** Ruta para ver el contenido en su módulo, si existe. */
  href?: string;
}

/**
 * Fuente de contenido moderable. Cada módulo que permita publicar contenido
 * de estudiantes declara una: así entra automáticamente a la cola de revisión
 * del panel de administración, sin tocar el módulo de administración.
 */
export interface ModerationSource {
  kind: ContentKind;
  /** Etiqueta en singular, p. ej. "Publicación del marketplace". */
  label: string;
  /** Etiqueta en plural para filtros, p. ej. "Marketplace". */
  pluralLabel: string;
  /** Devuelve todos los elementos moderables de este tipo. */
  fetchAll: () => Promise<ModerationItem[]>;
  /** Aplica la decisión del moderador (§7.1: aprobar, rechazar o pedir cambios). */
  decide: (input: {
    id: ID;
    status: ModerationStatus;
    note?: string;
    moderatorId: ID;
  }) => Promise<void>;
}

/* --- Calendario mensual -----------------------------------------------------
   El calendario NO guarda contenido propio: reúne lo que ya publican los demás
   módulos. Cada módulo con contenido fechado declara una `CalendarSource` y
   aparece en el mes automáticamente, sin tocar el módulo de calendario.       */

/** Una fecha marcada en el calendario, normalizada desde cualquier módulo. */
export interface CalendarEntry {
  id: ID;
  /** Fecha de inicio, ISO 8601. */
  date: string;
  /** Fecha de término, si la actividad abarca varios días. */
  endDate?: string;
  title: string;
  /** Línea de apoyo: lugar, horario o detalle breve. */
  detail?: string;
  /** Sin horario definido: se muestra como actividad de jornada completa. */
  allDay?: boolean;
  /** Ruta para abrir el contenido en su módulo de origen. */
  href?: string;
  /** Módulo que aporta la entrada; alimenta la leyenda de colores. */
  sourceId: string;
}

export interface CalendarSource {
  /** Debe coincidir con `sourceId` de las entradas que produce. */
  id: string;
  /** Etiqueta de la leyenda, p. ej. "Eventos". */
  label: string;
  tone: Tone;
  icon: LucideIcon;
  fetch: () => Promise<CalendarEntry[]>;
}

export interface ModuleNavEntry {
  /**
   * `primary`  → candidato a la barra inferior en móvil y al bloque principal
   *              del menú lateral en escritorio.
   * `secondary`→ aparece en "Más" y en el bloque secundario del menú.
   * `hidden`   → accesible por ruta, pero sin entrada de navegación.
   */
  section: 'primary' | 'secondary' | 'hidden';
  /** Menor número = más arriba. */
  order: number;
  /** Etiqueta corta para la barra inferior (por defecto usa `title`). */
  shortLabel?: string;
}

export interface AppModule {
  /** Identificador estable; debe coincidir con `appConfig.enabledModules`. */
  id: string;
  /** Título mostrado en navegación y encabezados. */
  title: string;
  /** Descripción de una línea, usada en el menú "Más". */
  description: string;
  icon: LucideIcon;
  tone: Tone;
  /** Ruta base, siempre con "/" inicial. */
  path: string;
  /** Rutas hijas, con paths relativos ('' es el índice del módulo). */
  routes: RouteObject[];
  nav: ModuleNavEntry;
  /** Rol mínimo requerido para ver el módulo. Por defecto: 'student'. */
  minRole?: Role;
  /** Contenido de este módulo que pasa por revisión previa. */
  moderationSources?: ModerationSource[];
  /** Contenido fechado de este módulo que se dibuja en el calendario mensual. */
  calendarSources?: CalendarSource[];
}
