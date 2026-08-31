import type { AuthorRef, User } from '@/core/types';
import { demoRoster } from '@/content/roster.demo';
import type { RosterEntry } from '@/content/roster.types';

/* ============================================================================
   CUENTAS DE LA PLATAFORMA
   ----------------------------------------------------------------------------
   Las cuentas de estudiantes NO se escriben a mano aquí: se generan desde la
   nómina oficial (`src/content/roster.ts`). Para habilitar una generación
   nueva se agregan sus filas a esa nómina y las cuentas aparecen solas.

   QUIÉN PUEDE ENTRAR
   El acceso exige correo del dominio institucional Y una cuenta existente. Un
   correo @verbo.cl que no esté en la nómina no puede entrar.

   Las cuentas de ejemplo (`usr_est1`…`usr_est5`) quedan DESACTIVADAS: siguen
   figurando como autoras del contenido de demostración, pero no pueden
   iniciar sesión ni aparecen en la base de contactos. Cuando se reemplace el
   contenido de ejemplo por el real, se pueden borrar junto con él.
   ========================================================================== */

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000).toISOString();

/** Id estable a partir del correo: re-sembrar no duplica cuentas. */
function idFor(email: string): string {
  return `usr_${email.split('@')[0].replace(/[^a-z0-9]/g, '')}`;
}

/* --- Cuentas de gestión ---------------------------------------------------- */

const staffUsers: User[] = [
  {
    id: 'usr_admin',
    name: 'Directiva Centro de Alumnos',
    email: 'centrodealumnos@verbo.cl',
    grade: 'IV Medio A',
    role: 'admin',
    bio: 'Cuenta oficial de la directiva. Publica comunicados y gestiona eventos, inscripciones y beneficios.',
    active: true,
    phone: '+56 9 8123 4567',
    createdAt: iso(400),
    updatedAt: iso(400),
  },
  {
    id: 'usr_mod',
    name: 'Equipo de Moderación',
    email: 'moderacion@verbo.cl',
    grade: 'III Medio B',
    role: 'moderator',
    bio: 'Revisa publicaciones y reportes para mantener un ambiente seguro y respetuoso.',
    active: true,
    phone: '+56 9 8234 5678',
    createdAt: iso(380),
    updatedAt: iso(380),
  },
];

/* --- Autores del contenido de ejemplo (sin acceso) -------------------------
   `active: false` los deja fuera del acceso y de la base de contactos, pero
   permite que el contenido de demostración conserve su autoría.            */

const exampleAuthors: User[] = [
  {
    id: 'usr_est1',
    name: 'Camila Rojas',
    email: 'camila.rojas@verbo.cl',
    grade: 'III Medio A',
    role: 'student',
    bio: 'Cuenta de ejemplo. Encargada de la brigada ambiental.',
    active: false,
    createdAt: iso(300),
    updatedAt: iso(12),
  },
  {
    id: 'usr_est2',
    name: 'Matías Fuentes',
    email: 'matias.fuentes@verbo.cl',
    grade: 'II Medio B',
    role: 'student',
    bio: 'Cuenta de ejemplo. Selección de fútbol y fotografía de eventos.',
    active: false,
    createdAt: iso(290),
    updatedAt: iso(20),
  },
  {
    id: 'usr_est3',
    name: 'Antonia Salas',
    email: 'antonia.salas@verbo.cl',
    grade: 'IV Medio B',
    role: 'student',
    bio: 'Cuenta de ejemplo. Editora de la revista estudiantil.',
    active: false,
    createdAt: iso(280),
    updatedAt: iso(30),
  },
  {
    id: 'usr_est4',
    name: 'Benjamín Cortés',
    email: 'benjamin.cortes@verbo.cl',
    grade: 'I Medio A',
    role: 'student',
    bio: 'Cuenta de ejemplo. Grupo scout y club de ajedrez.',
    active: false,
    createdAt: iso(120),
    updatedAt: iso(5),
  },
  {
    id: 'usr_est5',
    name: 'Josefa Miranda',
    email: 'josefa.miranda@verbo.cl',
    grade: '8° Básico A',
    role: 'student',
    bio: 'Cuenta de ejemplo.',
    active: false,
    createdAt: iso(90),
    updatedAt: iso(3),
  },
];

/* --- Estudiantes de la nómina --------------------------------------------
   LA NÓMINA OFICIAL NO ESTÁ EN EL REPOSITORIO. Son nombres y correos de
   menores de edad: no corresponde que viajen en el control de versiones ni
   que queden en un repositorio público. Vive solo en los computadores del
   Centro de Alumnos, y está en `.gitignore`.

   Por eso se carga de forma OPCIONAL:
     · Si `content/roster.ts` existe  → se usan los alumnos reales.
     · Si no existe                   → se usa la nómina de demostración.

   Así el proyecto compila igual en un computador que no la tenga (por
   ejemplo, el que publica la demostración), sin romperse y sin exponerla.

   `VITE_DEMO_ROSTER=true` fuerza la nómina inventada aunque la real esté
   presente, para poder probar en local lo mismo que verá el público.        */

const encontrada = import.meta.glob('../roster.ts', {
  eager: true,
  import: 'roster',
}) as Record<string, RosterEntry[]>;

const oficial: RosterEntry[] | undefined = Object.values(encontrada)[0];

const activeRoster: RosterEntry[] =
  import.meta.env.VITE_DEMO_ROSTER === 'true' || !oficial ? demoRoster : oficial;

/** ¿La app está corriendo con la nómina real o con la de demostración? */
export const usingDemoRoster = activeRoster === demoRoster;

const rosterUsers: User[] = activeRoster.map((entry) => ({
  id: idFor(entry.email),
  name: entry.name,
  email: entry.email,
  grade: entry.grade,
  role: 'student' as const,
  active: true,
  createdAt: iso(30),
  updatedAt: iso(30),
}));

export const seedUsers: User[] = [...staffUsers, ...rosterUsers, ...exampleAuthors];

/** Convierte una cuenta en la referencia ligera que guarda cada publicación. */
export function toAuthorRef(user: User): AuthorRef {
  return { id: user.id, name: user.name, grade: user.grade, avatarKey: user.avatarKey };
}

const byId = Object.fromEntries(seedUsers.map((user) => [user.id, user]));

/** Atajo para construir referencias de autor en el contenido de ejemplo. */
export function author(id: string): AuthorRef {
  const user = byId[id];
  if (!user) throw new Error(`Usuario de ejemplo desconocido: ${id}`);
  return toAuthorRef(user);
}

/**
 * Cuentas ofrecidas en el acceso rápido de demostración.
 * Se ocultan por completo con `auth.enableDemoAccounts: false`, que es lo que
 * corresponde dejar antes de abrir la app a la comunidad.
 */
export const demoAccounts = [
  { id: 'usr_admin', label: 'Administrador', description: 'Publica y gestiona todo el contenido.' },
  { id: 'usr_mod', label: 'Moderador', description: 'Revisa publicaciones y reportes.' },
  {
    id: rosterUsers[0]?.id ?? 'usr_admin',
    label: 'Estudiante',
    description: 'Experiencia de un alumno de la nómina.',
  },
] as const;
