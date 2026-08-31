import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  ClipboardList,
  KeyRound,
  LogOut,
  Moon,
  Pencil,
  RotateCcw,
  Store,
  Sun,
  SunMoon,
} from 'lucide-react';
import { appConfig } from '@/config/app.config';
import { useAuth } from '@/core/auth/AuthContext';
import { db } from '@/core/data';
import { ROLE_LABEL } from '@/core/types';
import { useTheme, type ThemePreference } from '@/app/theme/ThemeContext';
import { useListingList } from '@/modules/marketplace/api';
import { useActivityList, useMyRegistrations } from '@/modules/signups/api';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Page,
  SectionHeader,
  SegmentedTabs,
  StatusBadge,
  cn,
  useToast,
} from '@/ui';
import { ChangePasswordSheet } from './components/ChangePasswordSheet';
import { EditProfileSheet } from './components/EditProfileSheet';

/* Perfil de usuario (§6.8): nombre, curso, correo institucional, fotografía
   opcional y publicaciones realizadas dentro de la plataforma. */

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const { preference, setPreference } = useTheme();
  const notify = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const { data: listings } = useListingList();
  const { data: activities } = useActivityList();
  const { registrations } = useMyRegistrations(user?.id);

  const myListings = useMemo(
    () => (listings ?? []).filter((listing) => listing.seller.id === user?.id),
    [listings, user],
  );

  if (!user) return null;

  /* Borra todo lo publicado desde la app y vuelve al contenido inicial. Con
     trabajo real cargado esto es destructivo, así que se confirma y se avisa
     dónde está el respaldo. */
  const handleReset = async () => {
    const confirmed = window.confirm(
      '¿Restaurar el contenido inicial?\n\n' +
        'Se borrará TODO lo que hayas publicado o editado desde la app en este navegador ' +
        'y no se puede deshacer.\n\n' +
        'Si no lo has exportado, cancela y usa antes "Exportar contenido" en Administración.',
    );
    if (!confirmed) return;

    await db.reset();
    notify('Contenido inicial restaurado. Recarga la página para verlo.', 'info');
  };

  return (
    <Page>
      {/* Identidad de la cuenta: nombre real y curso (§7). */}
      <Card className="mb-5">
        <div className="flex items-start gap-4">
          <Avatar name={user.name} avatarKey={user.avatarKey} size="xl" />

          <div className="min-w-0 flex-1 pt-1">
            <h1 className="truncate text-[20px] font-extrabold leading-tight text-ink">
              {user.name}
            </h1>
            <p className="mt-0.5 text-[13.5px] text-ink-2">{user.grade}</p>
            <p className="truncate text-[12.5px] text-ink-3">{user.email}</p>
            <Badge tone={user.role === 'student' ? 'neutral' : 'brand'} className="mt-2">
              {ROLE_LABEL[user.role]}
            </Badge>
          </div>
        </div>

        {user.bio ? (
          <p className="mt-4 text-[13.5px] leading-relaxed text-ink-2">{user.bio}</p>
        ) : null}

        <Button
          variant="secondary"
          size="sm"
          icon={Pencil}
          onClick={() => setEditOpen(true)}
          className="mt-4 w-full"
        >
          Editar perfil
        </Button>
      </Card>

      {/* Resumen de participación */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <StatCard icon={ClipboardList} value={registrations.length} label="Inscripciones" />
        <StatCard icon={Store} value={myListings.length} label="Publicaciones" />
      </div>

      {/* Mis inscripciones */}
      <section className="mb-6">
        <SectionHeader title="Mis inscripciones" to="/inscripciones" linkLabel="Ver todas" />
        {registrations.length === 0 ? (
          <Card>
            <p className="text-[13.5px] text-ink-2">
              Todavía no te has inscrito en ninguna actividad.
            </p>
          </Card>
        ) : (
          <ul className="space-y-2">
            {registrations.map((registration) => {
              const activity = (activities ?? []).find((a) => a.id === registration.activityId);
              return (
                <li key={registration.id}>
                  <Link
                    to={`/inscripciones/${registration.activityId}`}
                    className="flex items-center gap-3 rounded-card border border-line bg-surface p-3.5 transition hover:border-line-strong"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-ink">
                        {activity?.title ?? 'Actividad'}
                      </span>
                      <span className="block text-[12px] text-ink-3">
                        {registration.state === 'waitlist' ? 'En lista de espera' : 'Confirmada'}
                      </span>
                    </span>
                    <ChevronRight size={17} className="shrink-0 text-ink-3" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Mis publicaciones, con su estado de moderación (§7.1) */}
      <section className="mb-6">
        <SectionHeader
          title="Mis publicaciones"
          description="Incluye lo que está en revisión y solo tú puedes ver."
        />
        {myListings.length === 0 ? (
          <Card>
            <p className="text-[13.5px] text-ink-2">Aún no has publicado contenido.</p>
          </Card>
        ) : (
          <ul className="space-y-2">
            {myListings.map((listing) => (
              <li key={listing.id}>
                <PublicationRow
                  to={`/marketplace/${listing.id}`}
                  title={listing.title}
                  context="Marketplace"
                  status={listing.status}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Preferencias */}
      <section className="mb-6">
        <SectionHeader title="Apariencia" />
        <SegmentedTabs
          value={preference}
          onChange={(value) => setPreference(value as ThemePreference)}
          options={[
            { value: 'light', label: 'Claro' },
            { value: 'dark', label: 'Oscuro' },
            { value: 'system', label: 'Automático' },
          ]}
        />
        <div className="mt-2 flex items-center gap-1.5 text-[12px] text-ink-3">
          {preference === 'light' ? <Sun size={13} /> : null}
          {preference === 'dark' ? <Moon size={13} /> : null}
          {preference === 'system' ? <SunMoon size={13} /> : null}
          <span>
            {preference === 'system'
              ? 'Sigue la configuración de tu dispositivo.'
              : 'Preferencia guardada en este dispositivo.'}
          </span>
        </div>
      </section>

      {/* Seguridad de la cuenta */}
      <section className="mb-6">
        <SectionHeader title="Seguridad" />
        <Card>
          <p className="text-[13px] leading-relaxed text-ink-2">
            Tu contraseña se guarda cifrada en este dispositivo. Si la olvidas, el Centro de
            Alumnos puede restablecerla desde el panel de cuentas.
          </p>
          <Button
            variant="secondary"
            size="sm"
            icon={KeyRound}
            onClick={() => setPasswordOpen(true)}
            className="mt-3 w-full"
          >
            Cambiar contraseña
          </Button>
        </Card>
      </section>

      {/* Acerca de */}
      <Card className="mb-4">
        <h2 className="text-[14.5px] font-bold text-ink">
          {appConfig.organization.fullName}
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
          {appConfig.organization.institution} · {appConfig.organization.term}
        </p>
        <p className="mt-3 text-[12.5px] leading-relaxed text-ink-3">
          Plataforma administrada en conjunto por el Centro de Alumnos y los equipos designados por
          la institución. El acceso está restringido a cuentas institucionales y toda publicación de
          estudiantes pasa por revisión previa.
        </p>
      </Card>

      <div className="space-y-2">
        <Button variant="secondary" icon={RotateCcw} onClick={handleReset} className="w-full">
          Restaurar contenido de ejemplo
        </Button>
        <Button variant="ghost" icon={LogOut} onClick={signOut} className="w-full">
          Cerrar sesión
        </Button>
      </div>

      <EditProfileSheet open={editOpen} onClose={() => setEditOpen(false)} user={user} />
      <ChangePasswordSheet
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        user={user}
      />
    </Page>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-card border border-line bg-surface p-3 text-center">
      <Icon size={17} className="mx-auto mb-1.5 text-ink-3" />
      <p className="text-[19px] font-extrabold leading-none text-ink">{value}</p>
      <p className="mt-1 text-[11.5px] font-medium text-ink-3">{label}</p>
    </div>
  );
}

function PublicationRow({
  to,
  title,
  context,
  status,
}: {
  to: string;
  title: string;
  context: string;
  status: Parameters<typeof StatusBadge>[0]['status'];
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 rounded-card border border-line bg-surface p-3.5 transition',
        'hover:border-line-strong',
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold text-ink">{title}</span>
        <span className="block text-[12px] text-ink-3">{context}</span>
      </span>
      <StatusBadge status={status} />
    </Link>
  );
}
