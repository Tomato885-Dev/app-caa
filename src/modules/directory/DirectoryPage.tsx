import { useMemo, useState } from 'react';
import { Mail, Phone, Search, ShieldCheck, UserSearch } from 'lucide-react';
import { appConfig } from '@/config/app.config';
import { ROLE_LABEL } from '@/core/types';
import type { User } from '@/core/types';
import { matchesSearch } from '@/core/utils/text';
import {
  Avatar,
  Badge,
  Card,
  CardListSkeleton,
  EmptyState,
  FilterChips,
  Input,
  Page,
  PageHeader,
} from '@/ui';
import { listedInDirectory, telHref, useDirectory } from './api';

/* ============================================================================
   BASE DE CONTACTOS
   ----------------------------------------------------------------------------
   Buscador de personas de la comunidad. No es una entidad nueva: lee las
   mismas cuentas que administra el panel de administración, de modo que no hay
   dos listas de datos personales que mantener sincronizadas.

   Solo aparece quien tiene la cuenta activa y no pidió quedar fuera del
   buscador desde su perfil.
   ========================================================================== */

const ALL = 'todos';

export function DirectoryPage() {
  const { data, isLoading } = useDirectory();
  const [query, setQuery] = useState('');
  const [grade, setGrade] = useState(ALL);

  const people = useMemo(() => listedInDirectory(data ?? []), [data]);

  const filtered = useMemo(
    () =>
      people.filter(
        (person) =>
          (grade === ALL || person.grade === grade) &&
          matchesSearch(query, person.name, person.email, person.grade, person.phone),
      ),
    [people, grade, query],
  );

  const gradeOptions = useMemo(
    () => [
      { value: ALL, label: 'Todos', count: people.length },
      ...appConfig.grades
        .map((name) => ({
          value: name,
          label: name,
          count: people.filter((person) => person.grade === name).length,
        }))
        .filter((option) => option.count > 0),
    ],
    [people],
  );

  return (
    <Page>
      <PageHeader
        title="Contactos"
        description="Busca a una persona de la comunidad y contáctala por correo o teléfono."
      />

      {/* La lupa es el punto de entrada de esta pantalla: va primero. */}
      <div className="relative mb-3">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre, curso o correo"
          aria-label="Buscar una persona"
          autoComplete="off"
          autoFocus
          className="pl-10"
        />
      </div>

      <FilterChips options={gradeOptions} value={grade} onChange={setGrade} className="mb-4" />

      <p className="mb-4 flex items-start gap-2 rounded-field bg-surface-2 p-3 text-[12px] leading-relaxed text-ink-2">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-ink-3" />
        <span>
          Estos datos son de uso interno de la comunidad. Si prefieres no aparecer en el buscador,
          desactiva la opción desde <span className="font-semibold text-ink">Mi perfil</span>.
        </span>
      </p>

      {isLoading ? (
        <CardListSkeleton count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UserSearch}
          title="Sin resultados"
          description="No encontramos a nadie con ese nombre. Prueba escribiendo solo el apellido."
        />
      ) : (
        <>
          <p className="mb-2.5 text-[12px] font-medium text-ink-3">
            {filtered.length === 1 ? '1 persona' : `${filtered.length} personas`}
          </p>
          <ul className="space-y-2.5">
            {filtered.map((person) => (
              <li key={person.id}>
                <ContactRow person={person} />
              </li>
            ))}
          </ul>
        </>
      )}
    </Page>
  );
}

function ContactRow({ person }: { person: User }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <Avatar name={person.name} avatarKey={person.avatarKey} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-semibold text-ink">{person.name}</p>
          <p className="truncate text-[12.5px] text-ink-3">{person.grade}</p>
        </div>

        {person.role !== 'student' ? (
          <Badge tone="brand">{ROLE_LABEL[person.role]}</Badge>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <ContactLink
          icon={Mail}
          label="Correo"
          value={person.email}
          href={`mailto:${person.email}`}
        />
        {person.phone ? (
          <ContactLink
            icon={Phone}
            label="Teléfono"
            value={person.phone}
            href={telHref(person.phone)}
          />
        ) : (
          <div className="flex items-center gap-2.5 rounded-field border border-dashed border-line px-3 py-2.5">
            <Phone size={16} className="shrink-0 text-ink-3" />
            <span className="text-[12.5px] text-ink-3">Sin teléfono registrado</span>
          </div>
        )}
      </div>
    </Card>
  );
}

function ContactLink({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2.5 rounded-field border border-line px-3 py-2.5 transition hover:border-line-strong hover:bg-surface-2"
    >
      <Icon size={16} className="shrink-0 text-brand-600 dark:text-brand-300" />
      <span className="min-w-0">
        <span className="block text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
          {label}
        </span>
        <span className="block truncate text-[13px] font-medium text-ink">{value}</span>
      </span>
    </a>
  );
}
