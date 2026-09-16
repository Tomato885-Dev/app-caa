import { MapPin } from 'lucide-react';
import type { EventItem } from '@/core/types';
import { faltaPara, formatTime, parseDate } from '@/core/utils/date';
import { AppImage, Badge, CardLink } from '@/ui';

/** Bloque de fecha: día grande + mes, como en un calendario impreso. */
function DateBlock({ iso }: { iso: string }) {
  const date = parseDate(iso);
  const month = new Intl.DateTimeFormat('es-CL', { month: 'short' }).format(date).replace('.', '');

  return (
    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl bg-brand-500 text-white shadow-card">
      <span className="text-[20px] font-extrabold leading-none">{date.getDate()}</span>
      <span className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-accent-500">{month}</span>
    </div>
  );
}

export function EventCard({ event }: { event: EventItem }) {
  const falta = faltaPara(event.startsAt, event.endsAt);

  return (
    <CardLink to={`/eventos/${event.id}`}>
      <div className="flex gap-3.5">
        <DateBlock iso={event.startsAt} />

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <Badge tone="neutral">{event.category}</Badge>
            {falta ? <Badge tone="accent">{falta}</Badge> : null}
            <span className="text-[12px] font-medium text-ink-3">{formatTime(event.startsAt)}</span>
          </div>

          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-ink">{event.title}</h3>

          {event.location ? (
            <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-2">
              <MapPin size={13} className="shrink-0 text-ink-3" />
              <span className="truncate">{event.location}</span>
            </p>
          ) : null}
        </div>
      </div>
    </CardLink>
  );
}

/** Variante ancha con imagen, usada en el carrusel de Inicio. */
export function EventHighlightCard({ event }: { event: EventItem }) {
  const falta = faltaPara(event.startsAt, event.endsAt);

  return (
    <CardLink to={`/eventos/${event.id}`} flush className="w-64 shrink-0 sm:w-72">
      <AppImage imageKey={event.imageKey} ratio="16/9" rounded={false} fit="full" />
      <div className="p-3.5">
        <div className="mb-1 flex items-center gap-2">
          <Badge tone="brand">{event.category}</Badge>
          {falta ? <Badge tone="accent">{falta}</Badge> : null}
        </div>
        <h3 className="line-clamp-2 text-[14.5px] font-bold leading-snug text-ink">{event.title}</h3>
        {event.location ? (
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-2">
            <MapPin size={12.5} className="shrink-0 text-ink-3" />
            <span className="truncate">{event.location}</span>
          </p>
        ) : null}
      </div>
    </CardLink>
  );
}
