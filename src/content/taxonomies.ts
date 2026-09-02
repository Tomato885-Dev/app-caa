import type {
  AnnouncementPriority,
  MatchOutcome,
  SportDiscipline,
  SportLevel,
} from '@/core/types';
import type { Tone } from '@/ui/tone';

/* ============================================================================
   TAXONOMÍAS EDITABLES
   ----------------------------------------------------------------------------
   Categorías de cada módulo. Agregar o renombrar una categoría se hace solo
   aquí; los filtros de la interfaz se generan a partir de estas listas.
   ========================================================================== */

/** Categorías de noticias (§6.2). */
export const newsCategories = [
  'Comunicados',
  'Centro de Alumnos',
  'Académico',
  'Deportes',
  'Cultura',
  'Acción social',
] as const;

/** Categorías de eventos (§6.3). */
export const eventCategories = [
  'Institucional',
  'Deportivo',
  'Cultural',
  'Académico',
  'Solidario',
  'Recreativo',
] as const;

/** Áreas de los proyectos del colegio. */
export const projectAreas = [
  'Medioambiente',
  'Acción social',
  'Cultura y arte',
  'Deporte',
  'Ciencia y tecnología',
  'Convivencia',
] as const;

/* --- Comunicados del Centro de Alumnos --------------------------------------
   Prioridad del aviso. Solo `urgente` e `importante` se destacan visualmente:
   si todo resalta, nada resalta.                                             */
export const announcementPriorities: {
  value: AnnouncementPriority;
  label: string;
  tone: Tone;
}[] = [
  { value: 'urgente', label: 'Urgente', tone: 'accent' },
  { value: 'importante', label: 'Importante', tone: 'brand' },
  { value: 'normal', label: 'Informativo', tone: 'neutral' },
];

export const announcementPriorityTone: Record<AnnouncementPriority, Tone> = Object.fromEntries(
  announcementPriorities.map((item) => [item.value, item.tone]),
) as Record<AnnouncementPriority, Tone>;

/** Destinatarios sugeridos de un comunicado. Se pueden editar libremente. */
export const announcementAudiences = [
  'Toda la comunidad',
  'Enseñanza básica',
  'Enseñanza media',
  'I y II Medio',
  'III y IV Medio',
  'Delegados de curso',
] as const;

/* --- Beneficios canjeables por QR ------------------------------------------- */
export const benefitCategories = [
  'Alimentación',
  'Entretención',
  'Deporte',
  'Librería y útiles',
  'Servicios',
  'Otros',
] as const;

/* --- 365 · Selecciones del colegio ------------------------------------------
   Cinco disciplinas por tres categorías. Agregar una selección nueva es
   añadir una entrada a estas listas: los filtros se generan solos.           */
export const sportDisciplines: { value: SportDiscipline; label: string }[] = [
  { value: 'futbol', label: 'Fútbol' },
  { value: 'basquetbol', label: 'Básquetbol' },
  { value: 'tenis', label: 'Tenis' },
  { value: 'voleibol', label: 'Vóleibol' },
  { value: 'atletismo', label: 'Atletismo' },
];

export const sportDisciplineLabel: Record<SportDiscipline, string> = Object.fromEntries(
  sportDisciplines.map((item) => [item.value, item.label]),
) as Record<SportDiscipline, string>;

export const sportLevels: { value: SportLevel; label: string }[] = [
  { value: 'infantil', label: 'Infantil' },
  { value: 'intermedia', label: 'Intermedia' },
  { value: 'superior', label: 'Superior' },
];

export const sportLevelLabel: Record<SportLevel, string> = Object.fromEntries(
  sportLevels.map((item) => [item.value, item.label]),
) as Record<SportLevel, string>;

/**
 * Color de cada resultado. La paleta no tiene rojo: una derrota se marca en
 * neutro oscuro, nunca en un color de alarma.
 */
export const outcomeTone: Record<MatchOutcome, Tone> = {
  victoria: 'success',
  empate: 'accent',
  derrota: 'neutral',
  participacion: 'info',
};
