/* Formateo de fechas en español. Usa Intl: sin dependencias externas. */

const LOCALE = 'es-CL';

export function parseDate(iso: string): Date {
  return new Date(iso);
}

/** "12 de marzo" · "12 de marzo de 2027" si el año es distinto al actual. */
export function formatDate(iso: string): string {
  const date = parseDate(iso);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(date);
}

/** "mié 12 mar · 18:30" — formato compacto para tarjetas. */
export function formatDateTimeShort(iso: string): string {
  const date = parseDate(iso);
  const day = new Intl.DateTimeFormat(LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
  return `${day} · ${formatTime(iso)}`;
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' }).format(
    parseDate(iso),
  );
}

/** "Hoy", "Ayer", "hace 3 días", o la fecha si es más antigua. */
export function formatRelative(iso: string): string {
  const date = parseDate(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return 'Recién';
  if (diffMinutes < 60) return `hace ${diffMinutes} min`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `hace ${diffDays} días`;

  return formatDate(iso);
}

/** Texto del tiempo restante hasta una fecha límite. `null` si ya pasó. */
export function formatCountdown(iso: string): string | null {
  const diffMs = parseDate(iso).getTime() - Date.now();
  if (diffMs <= 0) return null;

  const days = Math.floor(diffMs / 86_400_000);
  if (days >= 1) return `Cierra en ${days} ${days === 1 ? 'día' : 'días'}`;

  const hours = Math.floor(diffMs / 3_600_000);
  if (hours >= 1) return `Cierra en ${hours} h`;
  return 'Cierra hoy';
}

/**
 * Cuánto falta para un evento: "Hoy", "Mañana", "En 3 días", o "En curso" si
 * dura varios días y ya empezó. Cuenta días del calendario y no horas: algo a
 * las 9 de la mañana de pasado mañana es "En 2 días", aunque falten 40 horas.
 *
 * Más allá de `maxDias` devuelve `null`: a un mes de distancia, la fecha dice
 * más que un "En 31 días".
 */
export function faltaPara(inicioISO: string, finISO?: string, maxDias = 7): string | null {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicio = new Date(parseDate(inicioISO));
  inicio.setHours(0, 0, 0, 0);

  // Math.round y no floor: un cambio de horario deja días de 23 o 25 horas.
  const dias = Math.round((inicio.getTime() - hoy.getTime()) / 86_400_000);

  if (dias < 0) {
    if (!finISO) return null;
    const fin = new Date(parseDate(finISO));
    fin.setHours(0, 0, 0, 0);
    return fin.getTime() >= hoy.getTime() ? 'En curso' : null;
  }
  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Mañana';
  if (dias <= maxDias) return `En ${dias} días`;
  return null;
}

/** "26 sept" — para un espacio chico, sin día de la semana ni hora. */
export function formatDayMonth(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' })
    .format(parseDate(iso))
    .replace('.', '');
}

export function isPast(iso: string): boolean {
  return parseDate(iso).getTime() < Date.now();
}

/** Agrupa por mes y año: "Marzo 2027". Usado en el calendario de eventos. */
export function monthLabel(iso: string): string {
  const label = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' }).format(
    parseDate(iso),
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/* ============================================================================
   REJILLA MENSUAL
   ----------------------------------------------------------------------------
   Utilidades del calendario. Trabajan siempre en hora local: lo que el
   estudiante ve como "martes 3" es el martes 3 de su propio reloj.
   ========================================================================== */

/** Clave de día en hora local: "2026-08-19". Sirve para agrupar por fecha. */
export function dayKey(value: string | Date): string {
  const date = typeof value === 'string' ? parseDate(value) : value;
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function isToday(value: string | Date): boolean {
  return dayKey(value) === dayKey(new Date());
}

/** Primer día del mes indicado. `offset` desplaza en meses (−1 = anterior). */
export function startOfMonth(reference: Date, offset = 0): Date {
  return new Date(reference.getFullYear(), reference.getMonth() + offset, 1);
}

/** "Agosto 2026", con la inicial en mayúscula. */
export function monthTitle(date: Date): string {
  const label = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Iniciales de los días, empezando en lunes: L M M J V S D. */
export const WEEKDAY_INITIALS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const;

/**
 * Las 6 semanas × 7 días que dibuja la rejilla del mes. Incluye los días de
 * relleno del mes anterior y del siguiente para que la cuadrícula sea regular.
 */
export function monthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  // getDay(): 0 = domingo. La semana chilena empieza en lunes.
  const leading = (first.getDay() + 6) % 7;
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - leading);

  return Array.from({ length: 42 }, (_, index) => {
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
  });
}

/** Todos los días que abarca una entrada, de su inicio a su término. */
export function daysBetween(startISO: string, endISO?: string): string[] {
  const start = new Date(parseDate(startISO));
  start.setHours(0, 0, 0, 0);

  const end = endISO ? new Date(parseDate(endISO)) : new Date(start);
  end.setHours(0, 0, 0, 0);

  // Rango invertido o inválido: se trata como un solo día.
  if (Number.isNaN(end.getTime()) || end < start) return [dayKey(start)];

  const keys: string[] = [];
  const cursor = new Date(start);
  // Tope defensivo: una actividad no debería ocupar más de un año de rejilla.
  while (cursor <= end && keys.length < 366) {
    keys.push(dayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

/** "martes 19 de agosto" — encabezado de la lista de un día. */
export function formatDayLong(value: string | Date): string {
  const date = typeof value === 'string' ? parseDate(value) : value;
  const label = new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}
