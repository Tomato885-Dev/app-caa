import { CalendarClock, CalendarDays, Pin, Users } from 'lucide-react';
import { announcementPriorityTone } from '@/content/taxonomies';
import { ANNOUNCEMENT_PRIORITY_LABEL, type Announcement } from '@/core/types';
import { formatDate, formatRelative } from '@/core/utils/date';
import { excerpt } from '@/core/utils/text';
import { Badge, CardLink, cn, toneSolid } from '@/ui';
import { isClosed } from '../api';

/**
 * Tarjeta de comunicado. Lleva una barra de color a la izquierda con el tono
 * de su prioridad: se distinguen de un vistazo al recorrer el listado.
 *
 * En los de inscripción, lo primero que se muestra es hasta cuándo hay plazo,
 * porque es el dato que decide si vale la pena seguir leyendo.
 */
export function AnnouncementCard({ item }: { item: Announcement }) {
  const tone = announcementPriorityTone[item.priority];
  const esInscripcion = item.kind === 'inscripcion';
  const cerrada = esInscripcion && isClosed(item);

  return (
    <CardLink to={`/comunicados/${item.id}`} flush>
      <div className="flex">
        <span aria-hidden className={cn('w-1.5 shrink-0', toneSolid[tone])} />

        <div className="min-w-0 flex-1 p-4">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            {item.priority !== 'normal' ? (
              <Badge tone={tone}>{ANNOUNCEMENT_PRIORITY_LABEL[item.priority]}</Badge>
            ) : null}
            {item.pinned ? (
              <Badge tone="neutral" icon={Pin}>
                Fijado
              </Badge>
            ) : null}
            {esInscripcion && item.deadline ? (
              <Badge tone={cerrada ? 'neutral' : 'accent'} icon={CalendarClock}>
                {cerrada ? 'Cerrada' : `Hasta el ${formatDate(item.deadline)}`}
              </Badge>
            ) : null}
            {esInscripcion && item.activityDate ? (
              <Badge tone="neutral" icon={CalendarDays}>
                {formatDate(item.activityDate)}
              </Badge>
            ) : null}
            <span className="text-[12px] text-ink-3">{formatRelative(item.publishedAt)}</span>
          </div>

          <h3 className="text-[15.5px] font-bold leading-snug text-ink">{item.title}</h3>

          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-2">
            {excerpt(item.body, 160)}
          </p>

          <p className="mt-2.5 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-3">
            <Users size={12.5} />
            {item.audience}
          </p>
        </div>
      </div>
    </CardLink>
  );
}
