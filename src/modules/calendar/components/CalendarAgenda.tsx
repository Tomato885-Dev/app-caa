import { Link } from 'react-router-dom';
import { ChevronRight, Clock } from 'lucide-react';
import type { CalendarEntry } from '@/core/modules/types';
import { dayKey, formatDayLong, formatTime, isToday } from '@/core/utils/date';
import { Card, cn, toneSolid, type Tone } from '@/ui';

/* Agenda: las actividades de uno o varios días, en orden. Es la lectura
   detallada de lo que la rejilla resume en puntos de color. */

export function CalendarAgenda({
  groups,
  toneOf,
  labelOf,
}: {
  /** Días con actividades, ya ordenados. */
  groups: { key: string; date: Date; entries: CalendarEntry[] }[];
  toneOf: (sourceId: string) => Tone;
  labelOf: (sourceId: string) => string;
}) {
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.key}>
          <h3 className="mb-2 flex items-center gap-2 text-[13px] font-bold text-ink">
            {formatDayLong(group.date)}
            {isToday(group.date) ? (
              <span className="rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-accent">
                Hoy
              </span>
            ) : null}
          </h3>

          <ul className="space-y-2">
            {group.entries.map((entry) => (
              <li key={`${group.key}:${entry.id}`}>
                <AgendaItem
                  entry={entry}
                  dayOf={group.key}
                  tone={toneOf(entry.sourceId)}
                  source={labelOf(entry.sourceId)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function AgendaItem({
  entry,
  dayOf,
  tone,
  source,
}: {
  entry: CalendarEntry;
  /** Día de la agenda en que se está pintando esta entrada. */
  dayOf: string;
  tone: Tone;
  source: string;
}) {
  // Una actividad de varios días solo lleva hora el primer día; los siguientes
  // son jornada completa, no un evento que vuelve a empezar a las 08:30.
  const startsToday = dayKey(entry.date) === dayOf;
  const timeLabel = entry.allDay || !startsToday ? 'Todo el día' : formatTime(entry.date);

  const body = (
    <Card flush className="transition hover:border-line-strong">
      <div className="flex">
        <span aria-hidden className={cn('w-1.5 shrink-0', toneSolid[tone])} />

        <div className="min-w-0 flex-1 px-3.5 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-3">{source}</p>
          <p className="mt-0.5 text-[14px] font-semibold leading-snug text-ink">{entry.title}</p>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-ink-2">
            <span className="inline-flex items-center gap-1.5">
              <Clock size={12.5} className="text-ink-3" />
              {timeLabel}
            </span>
            {entry.detail ? <span className="truncate">{entry.detail}</span> : null}
          </div>
        </div>

        {entry.href ? (
          <span className="flex items-center pr-2.5">
            <ChevronRight size={17} className="text-ink-3" />
          </span>
        ) : null}
      </div>
    </Card>
  );

  return entry.href ? (
    <Link to={entry.href} className="block active:scale-[0.995]">
      {body}
    </Link>
  ) : (
    body
  );
}
