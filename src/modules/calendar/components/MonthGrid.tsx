import type { CalendarEntry } from '@/core/modules/types';
import { WEEKDAY_INITIALS, dayKey, formatDayLong, isToday } from '@/core/utils/date';
import { cn, toneSolid, type Tone } from '@/ui';

/* ============================================================================
   REJILLA DEL MES
   ----------------------------------------------------------------------------
   Seis semanas fijas para que la altura del calendario no salte al cambiar de
   mes. Cada día muestra hasta tres puntos de color —uno por módulo de origen—
   y un "+n" cuando hay más.
   ========================================================================== */

const MAX_DOTS = 3;

export function MonthGrid({
  days,
  month,
  byDay,
  toneOf,
  selected,
  onSelect,
}: {
  /** Los 42 días de la rejilla, ya calculados. */
  days: Date[];
  /** Mes que se está mostrando: los días de otros meses se atenúan. */
  month: Date;
  byDay: Record<string, CalendarEntry[]>;
  toneOf: (sourceId: string) => Tone;
  selected: string | null;
  onSelect: (key: string | null) => void;
}) {
  return (
    <div>
      <div
        aria-hidden
        className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase text-ink-3"
      >
        {WEEKDAY_INITIALS.map((initial, index) => (
          <span key={index} className="py-1">
            {initial}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = dayKey(day);
          const entries = byDay[key] ?? [];
          const inMonth = day.getMonth() === month.getMonth();
          const today = isToday(day);
          const active = selected === key;

          // Un punto por módulo distinto, para no repetir el mismo color.
          const dots = Array.from(new Set(entries.map((entry) => entry.sourceId)));

          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              aria-label={`${formatDayLong(day)}. ${
                entries.length === 0
                  ? 'Sin actividades'
                  : entries.length === 1
                    ? '1 actividad'
                    : `${entries.length} actividades`
              }`}
              onClick={() => onSelect(active ? null : key)}
              className={cn(
                'flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border transition',
                active
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : today
                    ? 'border-accent-500 bg-surface text-ink'
                    : 'border-transparent bg-surface text-ink hover:border-line-strong',
                !inMonth && !active && 'text-ink-3',
              )}
            >
              <span
                className={cn(
                  'text-[13.5px] leading-none',
                  today || active ? 'font-extrabold' : 'font-semibold',
                )}
              >
                {day.getDate()}
              </span>

              <span className="flex h-1.5 items-center gap-[3px]">
                {dots.slice(0, MAX_DOTS).map((sourceId) => (
                  <span
                    key={sourceId}
                    aria-hidden
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      active ? 'bg-white' : toneSolid[toneOf(sourceId)],
                    )}
                  />
                ))}
                {dots.length > MAX_DOTS ? (
                  <span
                    aria-hidden
                    className={cn(
                      'text-[8.5px] font-bold leading-none',
                      active ? 'text-white' : 'text-ink-3',
                    )}
                  >
                    +{dots.length - MAX_DOTS}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
