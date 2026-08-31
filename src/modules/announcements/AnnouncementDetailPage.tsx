import { useParams } from 'react-router-dom';
import { CalendarClock, FileQuestion, Pin, Users } from 'lucide-react';
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
import { useAnnouncement } from './api';

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

        <Prose text={item.body} className="mb-6" />

        <Card>
          <MetaRow icon={Users} label="Dirigido a" value={item.audience} />
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
