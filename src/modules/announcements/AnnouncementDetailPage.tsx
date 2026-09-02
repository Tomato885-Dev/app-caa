import { useParams } from 'react-router-dom';
import { CalendarClock, ClipboardList, FileQuestion, Pin, Users } from 'lucide-react';
import { announcementPriorityTone } from '@/content/taxonomies';
import { ANNOUNCEMENT_PRIORITY_LABEL } from '@/core/types';
import { formatDate, formatTime } from '@/core/utils/date';
import {
  Avatar,
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  MetaRow,
  Page,
  Prose,
  Skeleton,
} from '@/ui';
import { isClosed, useAnnouncement } from './api';

export function AnnouncementDetailPage() {
  const { id } = useParams();
  const { data: item, isLoading } = useAnnouncement(id);

  if (isLoading) {
    return (
      <Page>
        <Skeleton className="mb-3 h-6 w-2/3" />
        <Skeleton className="mb-2 h-4 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </Page>
    );
  }

  if (!item) {
    return (
      <Page>
        <EmptyState
          icon={FileQuestion}
          title="Comunicado no encontrado"
          description="Es posible que haya sido retirado o que el enlace no sea válido."
          action={<ButtonLink to="/comunicados">Volver a comunicados</ButtonLink>}
        />
      </Page>
    );
  }

  return (
    <Page>
      <article>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {item.kind === 'inscripcion' ? (
            <Badge tone="accent" icon={ClipboardList}>
              Inscripción
            </Badge>
          ) : null}
          {item.priority !== 'normal' ? (
            <Badge tone={announcementPriorityTone[item.priority]}>
              {ANNOUNCEMENT_PRIORITY_LABEL[item.priority]}
            </Badge>
          ) : null}
          {item.pinned ? (
            <Badge tone="neutral" icon={Pin}>
              Fijado
            </Badge>
          ) : null}
        </div>

        <h1 className="text-[24px] font-extrabold leading-[1.2] tracking-tight text-ink">
          {item.title}
        </h1>

        <div className="my-5 flex items-center gap-3 border-y border-line py-3.5">
          <Avatar name={item.author.name} avatarKey={item.author.avatarKey} size="md" />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold text-ink">{item.author.name}</p>
            <p className="text-[12px] text-ink-3">
              {formatDate(item.publishedAt)} · {formatTime(item.publishedAt)}
            </p>
          </div>
        </div>

        {/* El plazo va antes del texto: es lo que decide si conviene leerlo. */}
        {item.kind === 'inscripcion' && item.deadline ? (
          <div
            className={
              'mb-5 rounded-card border p-4 ' +
              (isClosed(item)
                ? 'border-line bg-surface-2'
                : 'border-brand-200 bg-brand-50 dark:border-brand-500 dark:bg-brand-950')
            }
          >
            <p
              className={
                'text-[14px] font-bold ' +
                (isClosed(item) ? 'text-ink-2' : 'text-brand-700 dark:text-brand-300')
              }
            >
              {isClosed(item)
                ? `Las postulaciones cerraron el ${formatDate(item.deadline)}`
                : `Puedes postular hasta el ${formatDate(item.deadline)}`}
            </p>
            {isClosed(item) ? null : (
              <p className="mt-1 text-[13px] leading-relaxed text-brand-700 dark:text-brand-300">
                Revisa más abajo cómo participar.
              </p>
            )}
          </div>
        ) : null}

        <Prose text={item.body} className="mb-6" />

        <Card>
          <MetaRow icon={Users} label="Dirigido a" value={item.audience} />
          {item.kind === 'inscripcion' && item.deadline ? (
            <MetaRow
              icon={ClipboardList}
              label="Último día para postular"
              value={formatDate(item.deadline)}
            />
          ) : null}
          <MetaRow
            icon={CalendarClock}
            label="Publicado"
            value={`${formatDate(item.publishedAt)} a las ${formatTime(item.publishedAt)}`}
          />
        </Card>
      </article>
    </Page>
  );
}
