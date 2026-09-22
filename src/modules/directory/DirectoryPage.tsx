import { useEffect, useMemo, useState } from 'react';
import { Mail, Phone, Search, UserSearch } from 'lucide-react';
import { appConfig } from '@/config/app.config';
import { ROLE_LABEL } from '@/core/types';
import type { User } from '@/core/types';
import { matchesSearch } from '@/core/utils/text';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardListSkeleton,
  EmptyState,
  FilterChips,
  Input,
  Page,
  PageHeader,
  cn,
  IconoWhatsApp,
} from '@/ui';
import { listedInDirectory, telHref, useDirectory, whatsappHref } from './api';

/* ============================================================================
   BASE DE CONTACTOS
   ----------------------------------------------------------------------------
   Buscador de personas de la comunidad. No es una entidad nueva: lee las
   mismas cuentas que administra el panel de administración, de modo que no hay
   dos listas de datos personales que mantener sincronizadas.

   Aparece toda la comunidad con cuenta activa, MENOS quien pidió no aparecer.

   Durante un tiempo no se pudo pedir: el Centro de Alumnos quería la base
   completa, y ocultar a alguien era algo que la administración marcaba a mano.
   Eso cambió al preparar la app para las tiendas. La base reúne el nombre, el
   curso, el correo y el teléfono de 694 menores de edad, y oponerse a figurar
   en una lista así tiene que poder decidirlo la propia persona, en su perfil,
   sin pedir permiso. La casilla vive en `profile/ProfilePage.tsx`.

   Ocultarse no borra nada: la cuenta sigue, la nómina sigue, y se puede
   revertir cuando se quiera.
   ========================================================================== */

const ALL = 'todos';

/* CUANTAS FICHAS SE DIBUJAN DE UNA VEZ
   La comunidad son cerca de setecientas personas. Dibujar las setecientas
   fichas juntas —cada una con su foto, su correo, su telefono y el boton de
   WhatsApp— son miles de elementos de golpe, y en un telefono normal la app
   se queda pegada varios segundos al abrir Contactos.

   Se dibujan de a poco, con un boton para pedir mas. Casi nadie va a apretarlo:
   a una persona se la encuentra escribiendo su nombre en la busqueda, que es
   justo lo que esta pantalla pone primero. */
const A_LA_VEZ = 40;

export function DirectoryPage() {
  const { data, isLoading } = useDirectory();
  const [query, setQuery] = useState('');
  const [grade, setGrade] = useState(ALL);
  /* Cuantas fichas hay dibujadas ahora mismo. Ver el comentario de A_LA_VEZ. */
  const [cuantas, setCuantas] = useState(A_LA_VEZ);

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

  /* Al cambiar la busqueda o el curso se vuelve al principio: si alguien
     apreto "Mostrar mas" tres veces y despues escribe un nombre, la lista
     nueva no tiene por que arrancar con 150 fichas dibujadas. */
  useEffect(() => setCuantas(A_LA_VEZ), [query, grade]);

  const visibles = filtered.slice(0, cuantas);
  const faltan = filtered.length - visibles.length;

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
          <ul className="lista-animada space-y-2.5">
            {visibles.map((person) => (
              <li key={person.id}>
                <ContactRow person={person} />
              </li>
            ))}
          </ul>

          {faltan > 0 ? (
            <Button
              variant="secondary"
              onClick={() => setCuantas((actual) => actual + A_LA_VEZ)}
              className="mt-3 w-full"
            >
              Mostrar {Math.min(faltan, A_LA_VEZ)} más
              <span className="ml-1 font-normal text-ink-3">
                (quedan {faltan})
              </span>
            </Button>
          ) : null}
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
          /* El teléfono y WhatsApp van juntos, como una sola pieza: tocar el
             número llama, y el botón verde de al lado abre la conversación. */
          <div className="flex items-stretch gap-2">
            <ContactLink
              icon={Phone}
              label="Teléfono"
              value={person.phone}
              href={telHref(person.phone)}
              className="min-w-0 flex-1"
            />
            <BotonWhatsApp phone={person.phone} name={person.name} />
          </div>
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

/**
 * Botón de WhatsApp. No aparece si el número no es un celular: ver
 * `whatsappHref`. Abre fuera de la app, así el teléfono lo pasa directo a
 * WhatsApp con la conversación ya abierta.
 */
function BotonWhatsApp({ phone, name }: { phone: string; name: string }) {
  const href = whatsappHref(phone);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Escribirle a ${name} por WhatsApp`}
      title="Escribir por WhatsApp"
      className={cn(
        'flex w-12 shrink-0 items-center justify-center rounded-field transition active:scale-95',
        'bg-[#25D366] text-white hover:brightness-95',
      )}
    >
      <IconoWhatsApp size={20} />
    </a>
  );
}

function ContactLink({
  icon: Icon,
  label,
  value,
  href,
  className,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        'flex items-center gap-2.5 rounded-field border border-line px-3 py-2.5 transition hover:border-line-strong hover:bg-surface-2',
        className,
      )}
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
