import {
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  Megaphone,
  Pin,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { announcementPriorityTone } from '@/content/taxonomies';
import { ANNOUNCEMENT_PRIORITY_LABEL, type Announcement, type AnnouncementPriority } from '@/core/types';
import { formatDate, formatRelative } from '@/core/utils/date';
import { excerpt } from '@/core/utils/text';
import { CardLink, cn, toneSolid } from '@/ui';
import { isClosed } from '../api';

/* ============================================================================
   TARJETA DE COMUNICADO
   ----------------------------------------------------------------------------
   Un listado de comunicados es, por naturaleza, una lista de párrafos grises.
   Lo que la ordena es la prioridad: cada uno lleva su barra de color a la
   izquierda y su ícono, así el ojo distingue un aviso urgente de uno
   informativo sin leer una palabra.

   EL FIJADO SE VE FIJADO
   Lleva un fondo amarillo tenue y su chincheta. Es lo que el equipo quiere que
   se lea primero, y antes se anunciaba con una insignia gris igual a todas.

   En los de inscripción, lo primero que se muestra es hasta cuándo hay plazo,
   porque es el dato que decide si vale la pena seguir leyendo.
   ========================================================================== */

const ICONO: Record<AnnouncementPriority, LucideIcon> = {
  urgente: AlertTriangle,
  importante: Megaphone,
  normal: Megaphone,
};

export function AnnouncementCard({ item }: { item: Announcement }) {
  const tone = announcementPriorityTone[item.priority];
  const esInscripcion = item.kind === 'inscripcion';
  const cerrada = esInscripcion && isClosed(item);
  const Icono = ICONO[item.priority];
  const destaca = item.priority !== 'normal';

  return (
    <CardLink to={`/comunicados/${item.id}`} flush className={cn(item.pinned && 'ring-1 ring-accent-500/35')}>
      <div className="flex">
        <span aria-hidden className={cn('w-1.5 shrink-0', toneSolid[tone])} />

        <div className="min-w-0 flex-1">
          {/* La franja de arriba: solo aparece cuando hay algo que decir. */}
          {(item.pinned || destaca) ? (
            <div
              className={cn(
                'flex items-center gap-1.5 px-4 py-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.1em]',
                item.pinned
                  ? 'bg-accent-500/15 text-accent-700 dark:text-accent-300'
                  : 'bg-surface-2 text-ink-2',
              )}
            >
              {item.pinned ? <Pin size={11} /> : <Icono size={11} />}
              {item.pinned ? 'Fijado' : ANNOUNCEMENT_PRIORITY_LABEL[item.priority]}
            </div>
          ) : null}

          <div className="p-4">
            <h3 className="text-[16px] font-bold leading-snug tracking-tight text-ink">
              {item.title}
            </h3>

            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-2">
              {excerpt(item.body, 160)}
            </p>

            {/* Las inscripciones llevan su plazo adelante: es lo que decide. */}
            {esInscripcion && item.deadline ? (
              <p
                className={cn(
                  'mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold',
                  cerrada
                    ? 'bg-surface-3 text-ink-3'
                    : 'bg-accent-500 text-on-accent',
                )}
              >
                <CalendarClock size={12} />
                {cerrada ? 'Inscripción cerrada' : `Hasta el ${formatDate(item.deadline)}`}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-2.5 text-[11.5px] font-medium text-ink-3">
              <span className="inline-flex items-center gap-1.5">
                <Users size={12.5} />
                {item.audience}
              </span>
              {esInscripcion && item.activityDate ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={12.5} />
                  {formatDate(item.activityDate)}
                </span>
              ) : null}
              <span className="ml-auto">{formatRelative(item.publishedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </CardLink>
  );
}
