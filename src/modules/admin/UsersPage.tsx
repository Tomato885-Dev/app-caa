import { useEffect, useMemo, useState } from 'react';
import { EyeOff, KeyRound, Phone, Search, UserCog } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthContext';
import { clearPassword, hasPassword } from '@/core/auth/credentials';
import { clearVerification, isVerified } from '@/core/auth/verification';
import { db, usingServer } from '@/core/data';
import { useCollection, useDataMutation } from '@/core/hooks/useData';
import { ROLE_LABEL, type ID, type Role, type User } from '@/core/types';
import { formatRelative } from '@/core/utils/date';
import { matchesSearch } from '@/core/utils/text';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardListSkeleton,
  EmptyState,
  Input,
  Page,
  PageHeader,
  Select,
  useToast,
} from '@/ui';
import {
  buildActivationSummary,
  downloadActivationReport,
  type ActivationSummary,
} from './activaciones';
import { ActivationSummaryCard } from './components/ActivationSummaryCard';

/* Cuentas y permisos (§8). Define quién administra, quién modera y quién
   participa como estudiante. */

export function UsersPage() {
  const { user: current } = useAuth();
  const notify = useToast();
  const { data, isLoading } = useCollection('users', db.users);
  const [query, setQuery] = useState('');
  /* Quiénes ya crearon su contraseña y quiénes comprobaron su correo.
     Solo tiene sentido preguntarlo SIN servidor, que es cuando esas dos cosas
     viven en este navegador. Con servidor, un perfil existe únicamente si su
     dueño se registró y verificó su correo: preguntar aquí daría "sin activar"
     para todos, que es justo lo contrario de la verdad. */
  const [activatedIds, setActivatedIds] = useState<Set<ID>>(() => new Set());
  const [verifiedIds, setVerifiedIds] = useState<Set<ID>>(() => new Set());
  const [summary, setSummary] = useState<ActivationSummary | null>(null);

  const updateUser = useDataMutation(
    ({ id, patch }: { id: ID; patch: Partial<User> }) => db.users.update(id, patch),
    ['users'],
  );

  const users = useMemo(
    () =>
      (data ?? [])
        .filter((entry) => matchesSearch(query, entry.name, entry.email, entry.grade))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [data, query],
  );

  useEffect(() => {
    const rows = data ?? [];
    if (usingServer) {
      setActivatedIds(new Set(rows.map((entry) => entry.id)));
      setVerifiedIds(new Set(rows.map((entry) => entry.id)));
      return;
    }
    setActivatedIds(new Set(rows.filter((entry) => hasPassword(entry.id)).map((entry) => entry.id)));
    setVerifiedIds(new Set(rows.filter((entry) => isVerified(entry.id)).map((entry) => entry.id)));
  }, [data]);

  /* Quiénes cuentan como activados. Con servidor son todos los perfiles; sin
     servidor, los que crearon contraseña en este navegador. */
  const activatedAccounts = useMemo(
    () => (data ?? []).filter((entry) => activatedIds.has(entry.id)),
    [data, activatedIds],
  );

  useEffect(() => {
    if (!data) return;
    let vigente = true;
    void buildActivationSummary(data, activatedAccounts).then((result) => {
      if (vigente) setSummary(result);
    });
    return () => {
      vigente = false;
    };
  }, [data, activatedAccounts]);

  const changeRole = (target: User, role: Role) => {
    updateUser.mutate(
      { id: target.id, patch: { role } },
      { onSuccess: () => notify(`${target.name} ahora es ${ROLE_LABEL[role].toLowerCase()}.`) },
    );
  };

  const savePhone = (target: User, value: string) => {
    const phone = value.trim();
    if (phone === (target.phone ?? '')) return;
    updateUser.mutate(
      { id: target.id, patch: { phone: phone || undefined } },
      { onSuccess: () => notify(`Teléfono de ${target.name} actualizado.`, 'info') },
    );
  };

  /* Sin servidor de correo no hay recuperación automática: la administración
     borra la contraseña y la persona vuelve a activarse desde /registro.
     Se borra también la verificación, para que vuelva a comprobar su correo. */
  const resetPassword = (target: User) => {
    const confirmed = window.confirm(
      `¿Restablecer la cuenta de ${target.name}?\n\n` +
        'Perderá el acceso hasta que vuelva a activarla: contraseña nueva y código de verificación.',
    );
    if (!confirmed) return;

    clearPassword(target.id);
    clearVerification(target.id);

    const forget = (current: Set<ID>) => {
      const next = new Set(current);
      next.delete(target.id);
      return next;
    };
    setActivatedIds(forget);
    setVerifiedIds(forget);

    notify(`${target.name} deberá activar su cuenta de nuevo.`, 'info');
  };

  const toggleActive = (target: User) => {
    updateUser.mutate(
      { id: target.id, patch: { active: !target.active } },
      {
        onSuccess: () =>
          notify(target.active ? 'Cuenta desactivada.' : 'Cuenta reactivada.', 'info'),
      },
    );
  };

  return (
    <Page>
      <PageHeader
        title="Cuentas y permisos"
        description="Administra los perfiles de acceso y los datos de contacto de la comunidad."
      />

      {summary ? (
        <ActivationSummaryCard
          summary={summary}
          onDownload={() => {
            const nombre = downloadActivationReport(activatedAccounts, summary);
            notify('Se descargó ' + nombre + '.', 'info');
          }}
        />
      ) : null}

      <div className="relative mb-5">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre, correo o curso"
          aria-label="Buscar cuentas"
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : users.length === 0 ? (
        <EmptyState icon={UserCog} title="Sin resultados" description="Prueba con otra búsqueda." />
      ) : (
        <ul className="space-y-2.5">
          {users.map((entry) => {
            const isSelf = entry.id === current?.id;
            const activated = activatedIds.has(entry.id);
            const verified = verifiedIds.has(entry.id);

            return (
              <li key={entry.id}>
                <Card>
                  <div className="flex items-center gap-3">
                    <Avatar name={entry.name} avatarKey={entry.avatarKey} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-ink">{entry.name}</p>
                      <p className="truncate text-[12px] text-ink-3">
                        {entry.grade} · {entry.email}
                      </p>
                    </div>
                    {entry.hideFromDirectory ? (
                      <Badge tone="neutral" icon={EyeOff}>
                        Oculta
                      </Badge>
                    ) : null}
                    {!entry.active ? <Badge tone="danger">Inactiva</Badge> : null}
                    {entry.active && !activated ? (
                      <Badge tone="neutral">Sin activar</Badge>
                    ) : entry.active && !verified ? (
                      <Badge tone="warning">Sin verificar</Badge>
                    ) : null}
                  </div>

                  {/* Teléfono de la base de contactos. Se guarda al salir del
                      campo, sin botón aparte: es un dato de una sola línea. */}
                  <div className="mt-3 flex items-center gap-2">
                    <Phone size={16} className="shrink-0 text-ink-3" />
                    <Input
                      type="tel"
                      aria-label={`Teléfono de ${entry.name}`}
                      placeholder="Sin teléfono registrado"
                      defaultValue={entry.phone ?? ''}
                      onBlur={(event) => savePhone(entry, event.target.value)}
                      className="flex-1"
                    />
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Select
                      aria-label={`Rol de ${entry.name}`}
                      value={entry.role}
                      disabled={isSelf}
                      onChange={(event) => changeRole(entry, event.target.value as Role)}
                      className="flex-1"
                    >
                      <option value="student">Estudiante</option>
                      <option value="moderator">Moderador</option>
                      <option value="admin">Administrador</option>
                    </Select>

                    <Button
                      size="sm"
                      variant={entry.active ? 'ghost' : 'secondary'}
                      disabled={isSelf}
                      onClick={() => toggleActive(entry)}
                    >
                      {entry.active ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-[11.5px] text-ink-3">
                      {usingServer
                        ? 'Activó su cuenta ' + formatRelative(entry.createdAt) + '.'
                        : !activated
                          ? 'Todavía no ha creado su contraseña.'
                          : verified
                            ? 'Contraseña creada y correo verificado.'
                            : 'Contraseña creada, falta verificar el correo.'}
                    </p>
                    {/* Restablecer solo existe SIN servidor, que es cuando la
                        contraseña vive en este navegador y no hay forma de
                        recuperarla por correo. Con servidor, quien la olvide
                        usa "Olvidé mi contraseña" y se la resuelve Supabase;
                        dejar el botón aquí prometería algo que no haría. */}
                    {!usingServer && activated ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={KeyRound}
                        onClick={() => resetPassword(entry)}
                      >
                        Restablecer
                      </Button>
                    ) : null}
                  </div>

                  {isSelf ? (
                    <p className="mt-2 text-[11.5px] text-ink-3">
                      No puedes modificar tu propia cuenta.
                    </p>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </Page>
  );
}
