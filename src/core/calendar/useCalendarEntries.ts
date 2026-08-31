import { useQuery } from '@tanstack/react-query';
import { getCalendarSources } from '@/core/modules/registry';
import type { CalendarEntry, CalendarSource } from '@/core/modules/types';
import { dayKey, daysBetween } from '@/core/utils/date';

/* ============================================================================
   CALENDARIO AGREGADO
   ----------------------------------------------------------------------------
   Reúne el contenido fechado de todos los módulos registrados, igual que la
   cola de moderación reúne el contenido pendiente. Un módulo que declare
   `calendarSources` aparece en el calendario sin cambios adicionales.
   ========================================================================== */

export interface CalendarData {
  entries: CalendarEntry[];
  /** Entradas indexadas por día ("2026-08-19"), listas para pintar la rejilla. */
  byDay: Record<string, CalendarEntry[]>;
  /** Fuentes activas, para la leyenda de colores. */
  sources: CalendarSource[];
}

async function loadCalendar(): Promise<CalendarData> {
  const sources = getCalendarSources();
  const batches = await Promise.all(sources.map((source) => source.fetch()));

  const entries = batches
    .flat()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const byDay: Record<string, CalendarEntry[]> = {};
  for (const entry of entries) {
    // Una actividad de varios días se marca en cada uno de ellos.
    for (const key of daysBetween(entry.date, entry.endDate)) {
      (byDay[key] ??= []).push(entry);
    }
  }

  return { entries, byDay, sources };
}

export function useCalendarEntries() {
  return useQuery({
    queryKey: ['calendarEntries'],
    queryFn: loadCalendar,
    staleTime: 15_000,
  });
}

/** Entradas de un día concreto, en orden horario. */
export function entriesOfDay(data: CalendarData | undefined, date: Date): CalendarEntry[] {
  return data?.byDay[dayKey(date)] ?? [];
}
