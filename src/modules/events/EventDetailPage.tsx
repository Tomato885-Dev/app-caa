import { Link, useParams } from 'react-router-dom';
import { CalendarDays, ClipboardList, Clock, FileQuestion, Mail, MapPin, User } from 'lucide-react';
import { formatDate, formatTime } from '@/core/utils/date';
import {
  AppImage,
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  MetaRow,
  Page,
  Prose,
  Skeleton,
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

  const dateLabel = event.endsAt
    ? `${formatDate(event.startsAt)} — ${formatDate(event.endsAt)}`
    : formatDate(event.startsAt);

  const timeLabel = event.endsAt
    ? `${formatTime(event.startsAt)} a ${formatTime(event.endsAt)}`
    : formatTime(event.startsAt);

  return (
    <Page>
      <AppImage imageKey={event.imageKey} ratio="16/9" className="mb-5" />

      <Badge tone="brand" className="mb-3">
        {event.category}
      </Badge>

      <h1 className="text-[25px] font-extrabold leading-[1.2] tracking-tight text-ink">
        {event.title}
      </h1>

      <Card className="my-5 divide-y divide-line">
        <MetaRow icon={CalendarDays} label="Fecha" value={dateLabel} />
        <MetaRow icon={Clock} label="Horario" value={timeLabel} />
        <MetaRow icon={MapPin} label="Ubicación" value={event.location} />
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

      {/* Puente entre módulos: si el evento tiene inscripción, se enlaza (§6.4). */}
      {event.signupActivityId ? (
        <Card className="mt-6 border-brand-200 bg-brand-50 dark:border-brand-700 dark:bg-brand-950">
          <p className="text-[14px] font-semibold text-ink">Este evento requiere inscripción</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
            Los cupos se gestionan desde la sección de inscripciones.
          </p>
          <Link
            to={`/inscripciones/${event.signupActivityId}`}
            className="mt-3 inline-flex text-[13.5px] font-bold text-brand-600 dark:text-brand-300"
          >
            Ir a la inscripción →
          </Link>
        </Card>
      ) : null}
    </Page>
  );
}
