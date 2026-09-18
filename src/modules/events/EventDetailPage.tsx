import { useParams } from 'react-router-dom';
import { CalendarDays, ClipboardList, Clock, FileQuestion, Mail, MapPin, User } from 'lucide-react';
import { dayKey, faltaPara, formatDate, formatTime } from '@/core/utils/date';
import {
  AppImage,
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  MetaRow,
  Page,
  Prose,
  SectionHeader,
  Skeleton,
  VideoIncrustado,
} from '@/ui';
import { useEventItem } from './api';

export function EventDetailPage() {
  const { id } = useParams();
  const { data: event, isLoading } = useEventItem(id);

  if (isLoading) {
    return (
      <Page>
        <Skeleton className="mb-4 aspect-[16/9] w-full" />
        <Skeleton className="mb-2 h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </Page>
    );
  }

  if (!event) {
    return (
      <Page>
        <EmptyState
          icon={FileQuestion}
          title="Evento no encontrado"
          description="Es posible que haya sido retirado o que el enlace no sea válido."
          action={<ButtonLink to="/eventos">Volver a eventos</ButtonLink>}
        />
      </Page>
    );
  }

  /* Solo se muestra un rango si de verdad son días distintos. Antes un evento
     de una tarde decía "18 de septiembre — 18 de septiembre". */
  const dateLabel =
    event.endsAt && dayKey(event.endsAt) !== dayKey(event.startsAt)
      ? `${formatDate(event.startsAt)} — ${formatDate(event.endsAt)}`
      : formatDate(event.startsAt);
  const falta = faltaPara(event.startsAt, event.endsAt);

  const timeLabel = event.endsAt
    ? `${formatTime(event.startsAt)} a ${formatTime(event.endsAt)}`
    : formatTime(event.startsAt);

  return (
    <Page>
      <AppImage imageKey={event.imageKey} ratio="16/9" fit="natural" className="mb-5" />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="brand">{event.category}</Badge>
        {falta ? <Badge tone="accent">{falta}</Badge> : null}
      </div>

      <h1 className="text-[25px] font-extrabold leading-[1.2] tracking-tight text-ink">
        {event.title}
      </h1>

      <Card className="my-5 divide-y divide-line">
        <MetaRow icon={CalendarDays} label="Fecha" value={dateLabel} />
        <MetaRow icon={Clock} label="Horario" value={timeLabel} />
        {event.location ? <MetaRow icon={MapPin} label="Ubicación" value={event.location} /> : null}
        {event.requirements ? (
          <MetaRow icon={ClipboardList} label="Requisitos" value={event.requirements} />
        ) : null}
        {event.contactName ? (
          <MetaRow icon={User} label="Organiza" value={event.contactName} />
        ) : null}
        {event.contactEmail ? (
          <MetaRow
            icon={Mail}
            label="Contacto"
            value={
              <a
                href={`mailto:${event.contactEmail}`}
                className="font-semibold text-brand-600 underline-offset-2 hover:underline dark:text-brand-300"
              >
                {event.contactEmail}
              </a>
            }
          />
        ) : null}
      </Card>

      <h2 className="mb-2 text-[15px] font-bold text-ink">Sobre la actividad</h2>
      <Prose text={event.description} />

      {/* La transmision del evento, si la hay. */}
      {event.videoUrl ? (
        <section className="mt-6">
          <SectionHeader title="Video" />
          <VideoIncrustado url={event.videoUrl} titulo={`Video de ${event.title}`} />
        </section>
      ) : null}

    </Page>
  );
}
