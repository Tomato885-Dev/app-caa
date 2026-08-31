import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileQuestion,
  MapPin,
  Users,
} from 'lucide-react';
import { signupKindLabel, signupKindTone } from '@/content/taxonomies';
import { useAuth } from '@/core/auth/AuthContext';
import { formatDate } from '@/core/utils/date';
import {
  AppImage,
  Badge,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  MetaRow,
  Page,
  Prose,
  Skeleton,
  useToast,
} from '@/ui';
import {
  capacityOf,
  findRegistration,
  isOpen,
  useActivity,
  useCancelRegistration,
  useRegistrations,
} from './api';
import { RegistrationSheet } from './components/RegistrationSheet';

export function SignupDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: activity, isLoading } = useActivity(id);
  const { data: registrationData } = useRegistrations();
  const cancel = useCancelRegistration();
  const notify = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (isLoading) {
    return (
      <Page>
        <Skeleton className="mb-4 aspect-[16/9] w-full" />
        <Skeleton className="mb-2 h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </Page>
    );
  }

  if (!activity) {
    return (
      <Page>
        <EmptyState
          icon={FileQuestion}
          title="Actividad no encontrada"
          description="Es posible que la convocatoria haya sido retirada."
          action={<ButtonLink to="/inscripciones">Volver a inscripciones</ButtonLink>}
        />
      </Page>
    );
  }

  const registrations = registrationData ?? [];
  const capacity = capacityOf(activity, registrations);
  const open = isOpen(activity);
  const myRegistration = user ? findRegistration(registrations, activity.id, user.id) : undefined;

  const handleCancel = () => {
    if (!myRegistration) return;
    cancel.mutate(myRegistration.id, {
      onSuccess: () => notify('Inscripción cancelada.', 'info'),
    });
  };

  return (
    <Page>
      <AppImage imageKey={activity.imageKey} ratio="16/9" className="mb-5" />

      <Badge tone={signupKindTone[activity.kind]} className="mb-3">
        {signupKindLabel[activity.kind]}
      </Badge>

      <h1 className="text-[25px] font-extrabold leading-[1.2] tracking-tight text-ink">
        {activity.title}
      </h1>

      {/* Estado de cupos: información clave, arriba y siempre visible. */}
      <Card className="mt-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-3">
              Cupos ocupados
            </p>
            <p className="mt-0.5 text-[20px] font-extrabold text-ink">
              {capacity.taken}
              {capacity.capacity !== null ? (
                <span className="text-ink-3"> / {capacity.capacity}</span>
              ) : (
                <span className="ml-1.5 text-[13px] font-semibold text-ink-3">sin límite</span>
              )}
            </p>
          </div>

          {myRegistration ? (
            <Badge tone="success" icon={CheckCircle2}>
              {myRegistration.state === 'waitlist' ? 'En lista de espera' : 'Inscrito'}
            </Badge>
          ) : null}
        </div>

        {capacity.capacity !== null ? (
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3"
            role="progressbar"
            aria-valuenow={capacity.taken}
            aria-valuemin={0}
            aria-valuemax={capacity.capacity}
            aria-label="Cupos ocupados"
          >
            <div
              className={capacity.full ? 'h-full bg-warning-500' : 'h-full bg-brand-500'}
              style={{ width: `${Math.min(100, (capacity.taken / capacity.capacity) * 100)}%` }}
            />
          </div>
        ) : null}

        <div className="mt-4">
          {!open ? (
            <p className="text-[13.5px] font-semibold text-ink-3">
              Las inscripciones para esta actividad están cerradas.
            </p>
          ) : myRegistration ? (
            <Button
              variant="secondary"
              size="lg"
              onClick={handleCancel}
              loading={cancel.isPending}
              className="w-full"
            >
              Cancelar mi inscripción
            </Button>
          ) : (
            <Button size="lg" onClick={() => setSheetOpen(true)} className="w-full">
              {capacity.full ? 'Sumarse a lista de espera' : 'Inscribirme'}
            </Button>
          )}
        </div>
      </Card>

      <Card className="my-5 divide-y divide-line">
        <MetaRow
          icon={CalendarClock}
          label="Cierre de inscripciones"
          value={formatDate(activity.closesAt)}
        />
        {activity.location ? (
          <MetaRow icon={MapPin} label="Lugar" value={activity.location} />
        ) : null}
        {activity.requirements ? (
          <MetaRow icon={ClipboardList} label="Requisitos" value={activity.requirements} />
        ) : null}
        <MetaRow icon={Users} label="Organiza" value={activity.organizer.name} />
      </Card>

      <h2 className="mb-2 text-[15px] font-bold text-ink">Sobre la actividad</h2>
      <Prose text={activity.description} />

      {user ? (
        <RegistrationSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          activity={activity}
          user={user}
          waitlist={capacity.full}
        />
      ) : null}
    </Page>
  );
}
