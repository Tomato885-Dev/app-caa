import { useMemo, useState } from 'react';
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarEntries } from '@/core/calendar/useCalendarEntries';
import type { CalendarEntry } from '@/core/modules/types';
import { dayKey, monthGrid, monthTitle, startOfMonth } from '@/core/utils/date';
import {
  Button,
  Card,
  EmptyState,
  IconButton,
  Page,
  PageHeader,
  SectionHeader,
  Skeleton,
  cn,
  toneSolid,
  type Tone,
} from '@/ui';
import { CalendarAgenda } from './components/CalendarAgenda';
import { MonthGrid } from './components/MonthGrid';

/* ============================================================================
   CALENDARIO MENSUAL
   ----------------------------------------------------------------------------
   Qué tiene preparado el Centro de Alumnos para el mes, en una sola vista.

   No guarda contenido propio: reúne lo que ya publican los demás módulos a
   través de sus `calendarSources` (ver `src/core/modules/types.ts`). Así, una
   actividad se carga UNA vez —al publicar el evento o la convocatoria— y
   aparece aquí sola, sin doble digitación ni riesgo de que ambas listas se
   desincronicen.
   ========================================================================== */

export function CalendarPage() {
  const { data, isLoading } = useCalendarEntries();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<string | null>(null);

  const days = useMemo(() => monthGrid(month), [month]);

  // Colores y etiquetas de la leyenda, indexados por módulo de origen.
  const tones = useMemo(() => {
    const map: Record<string, Tone> = {};
    for (const source of data?.sources ?? []) map[source.id] = source.tone;
    return map;
  }, [data]);

  const labels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const source of data?.sources ?? []) map[source.id] = source.label;
    return map;
  }, [data]);

  const toneOf = (sourceId: string): Tone => tones[sourceId] ?? 'neutral';
  const labelOf = (sourceId: string): string => labels[sourceId] ?? 'Actividad';

  // Agenda: el día seleccionado, o todo el mes visible si no hay ninguno.
  const groups = useMemo(() => {
    const byDay = data?.byDay ?? {};

    const keys = selected
      ? [selected]
      : days
          .filter((day) => day.getMonth() === month.getMonth())
          .map(dayKey)
          .filter((key) => (byDay[key]?.length ?? 0) > 0);

    return keys
      .filter((key) => (byDay[key]?.length ?? 0) > 0)
      .map((key) => {
        const [year, monthNumber, day] = key.split('-').map(Number);
        return {
          key,
          date: new Date(year, monthNumber - 1, day),
          entries: sortByTime(byDay[key] ?? []),
        };
      });
  }, [data, days, month, selected]);

  const monthCount = useMemo(() => {
    const byDay = data?.byDay ?? {};
    const ids = new Set<string>();
    for (const day of days) {
      if (day.getMonth() !== month.getMonth()) continue;
      for (const entry of byDay[dayKey(day)] ?? []) ids.add(entry.id);
    }
    return ids.size;
  }, [data, days, month]);

  const goToMonth = (offset: number) => {
    setMonth((current) => startOfMonth(current, offset));
    setSelected(null);
  };

  const goToToday = () => {
    setMonth(startOfMonth(new Date()));
    setSelected(dayKey(new Date()));
  };

  return (
    <Page>
      <PageHeader
        title="Calendario"
        description="Todo lo que el Centro de Alumnos tiene preparado, mes a mes."
      />

      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <IconButton icon={ChevronLeft} label="Mes anterior" onClick={() => goToMonth(-1)} />

          <div className="min-w-0 text-center">
            <p className="truncate text-[16px] font-bold leading-tight text-ink">
              {monthTitle(month)}
            </p>
            <p className="text-[11.5px] text-ink-3">
              {monthCount === 0
                ? 'Sin actividades'
                : monthCount === 1
                  ? '1 actividad'
                  : `${monthCount} actividades`}
            </p>
          </div>

          <IconButton icon={ChevronRight} label="Mes siguiente" onClick={() => goToMonth(1)} />
        </div>

        {isLoading ? (
          <Skeleton className="aspect-[7/6] w-full" />
        ) : (
          <MonthGrid
            days={days}
            month={month}
            byDay={data?.byDay ?? {}}
            toneOf={toneOf}
            selected={selected}
            onSelect={setSelected}
          />
        )}

        {/* Leyenda: qué significa cada color de punto. */}
        {(data?.sources.length ?? 0) > 0 ? (
          <div className="mt-3.5 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 border-t border-line pt-3">
            {data?.sources.map((source) => (
              <span
                key={source.id}
                className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-2"
              >
                <span aria-hidden className={cn('h-2 w-2 rounded-full', toneSolid[source.tone])} />
                {source.label}
              </span>
            ))}
          </div>
        ) : null}
      </Card>

      <SectionHeader
        title={selected ? 'Actividades del día' : 'Actividades del mes'}
        description={selected ? undefined : 'Toca un día del calendario para verlo en detalle.'}
        action={
          selected ? (
            <Button size="sm" variant="secondary" onClick={() => setSelected(null)}>
              Ver todo el mes
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={goToToday}>
              Hoy
            </Button>
          )
        }
      />

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title={selected ? 'Nada programado ese día' : 'Mes sin actividades'}
          description={
            selected
              ? 'Elige otro día del calendario para ver qué hay agendado.'
              : 'Cuando se publique un evento o una convocatoria con fecha, aparecerá aquí.'
          }
        />
      ) : (
        <CalendarAgenda groups={groups} toneOf={toneOf} labelOf={labelOf} />
      )}
    </Page>
  );
}

/** Jornada completa primero, y el resto por hora de inicio. */
function sortByTime(entries: CalendarEntry[]): CalendarEntry[] {
  return [...entries].sort((a, b) => {
    if (Boolean(a.allDay) !== Boolean(b.allDay)) return a.allDay ? -1 : 1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}
