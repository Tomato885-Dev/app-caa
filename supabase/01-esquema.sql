-- ============================================================================
-- APP CAA · ESTRUCTURA DE LA BASE DE DATOS
-- ----------------------------------------------------------------------------
-- CÓMO SE USA
--   1. En Supabase, abre "SQL Editor" en el menú de la izquierda.
--   2. Pulsa "New query", pega TODO este archivo y dale a "Run".
--   3. Debe terminar sin errores. Se puede volver a ejecutar sin romper nada.
--
-- QUÉ CREA
--   · contenido  la tabla donde vive todo lo que publica el Centro de Alumnos.
--   · nomina     los alumnos habilitados para entrar.
--   · perfiles   el rol de cada cuenta (estudiante, moderador, administrador).
--
-- POR QUÉ UNA SOLA TABLA PARA EL CONTENIDO
-- La aplicación pide los datos siempre igual: "dame todos los comunicados",
-- "dame el proyecto tal". Nunca cruza tablas ni hace cálculos en el servidor:
-- filtra y ordena en el teléfono, sobre listas de decenas de elementos.
--
-- Con ese uso, una tabla por tipo de contenido significaría siete tablas casi
-- idénticas, siete juegos de permisos y una migración cada vez que se agrega
-- un módulo. Guardar cada elemento como un documento JSON en una sola tabla
-- da el mismo resultado, con una fracción del código, y permite que un módulo
-- nuevo funcione sin tocar la base de datos.
--
-- Si algún día hiciera falta consultar por dentro (informes, búsquedas en el
-- servidor), Postgres sabe indexar JSON: se agrega el índice y listo.
-- ============================================================================


-- ============================================================================
-- 1. CONTENIDO
-- ============================================================================

create table if not exists public.contenido (
  -- A qué módulo pertenece: 'news', 'announcements', 'projects'…
  coleccion   text        not null,
  -- El id que ya usa la aplicación ('com_1', 'prj_03'…).
  id          text        not null,
  -- El elemento completo, tal como lo maneja la app.
  datos       jsonb       not null,
  creado_en   timestamptz not null default now(),
  editado_en  timestamptz not null default now(),

  primary key (coleccion, id)
);

-- Listar una colección completa es LA consulta de la aplicación.
create index if not exists contenido_coleccion_idx
  on public.contenido (coleccion, editado_en desc);

comment on table public.contenido is
  'Todo el contenido publicado por el Centro de Alumnos, un documento por elemento.';


-- ============================================================================
-- 2. NÓMINA
-- ----------------------------------------------------------------------------
-- Los alumnos habilitados. Vive aquí y NO dentro de la aplicación: son datos
-- de menores de edad y no corresponde que viajen en un archivo que cualquiera
-- pueda descargar junto con la página.
-- ============================================================================

create table if not exists public.nomina (
  correo     text primary key,
  nombre     text not null,
  curso      text not null,
  -- Permite dar de baja a alguien sin borrar su fila.
  habilitado boolean not null default true,
  creado_en  timestamptz not null default now()
);

comment on table public.nomina is
  'Alumnos autorizados a crear cuenta. Datos personales: nunca se expone entera.';


-- ============================================================================
-- 3. PERFILES
-- ----------------------------------------------------------------------------
-- Una fila por cuenta creada, con su rol. Se enlaza con el sistema de cuentas
-- de Supabase: si se borra la cuenta, se borra su perfil.
-- ============================================================================

create table if not exists public.perfiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  correo     text not null,
  nombre     text not null,
  curso      text not null,
  rol        text not null default 'student'
             check (rol in ('student', 'moderator', 'admin')),
  telefono   text,
  -- Deja de aparecer en la base de contactos.
  oculto     boolean not null default false,
  activo     boolean not null default true,
  creado_en  timestamptz not null default now(),
  editado_en timestamptz not null default now()
);

comment on table public.perfiles is
  'Cuenta de cada persona con su rol. El rol decide quién puede publicar.';


-- ============================================================================
-- 4. QUIÉN PUEDE HACER QUÉ
-- ----------------------------------------------------------------------------
-- Postgres bloquea todo por defecto en cuanto se activa la protección por
-- fila; a partir de ahí solo se puede lo que se permita explícitamente.
-- ============================================================================

alter table public.contenido enable row level security;
alter table public.nomina    enable row level security;
alter table public.perfiles  enable row level security;

-- ¿Quien pregunta es del equipo que publica?
create or replace function public.es_editor()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid()
      and activo
      and rol in ('moderator', 'admin')
  );
$$;

-- --- Contenido -------------------------------------------------------------
-- Leer: cualquiera que haya iniciado sesión.
-- Escribir: solo moderadores y administradores.

drop policy if exists "contenido: leer con sesion" on public.contenido;
create policy "contenido: leer con sesion"
  on public.contenido for select
  to authenticated
  using (true);

drop policy if exists "contenido: escribir el equipo" on public.contenido;
create policy "contenido: escribir el equipo"
  on public.contenido for all
  to authenticated
  using (public.es_editor())
  with check (public.es_editor());

-- --- Nómina ----------------------------------------------------------------
-- NO se puede leer entera desde la aplicación. Comprobar si un correo está
-- habilitado se hace con una función que responde sí o no, sin devolver la
-- lista: así el correo de nadie sale de aquí.

drop policy if exists "nomina: solo el equipo" on public.nomina;
create policy "nomina: solo el equipo"
  on public.nomina for all
  to authenticated
  using (public.es_editor())
  with check (public.es_editor());

-- Responde si ese correo puede crear cuenta. No devuelve datos de nadie más.
create or replace function public.puede_registrarse(p_correo text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.nomina
    where correo = lower(trim(p_correo)) and habilitado
  );
$$;

grant execute on function public.puede_registrarse(text) to anon, authenticated;

-- --- Perfiles --------------------------------------------------------------
-- Leer: con sesión iniciada (es la base de contactos).
-- Editar lo propio: cada quien su fila, y solo el teléfono y si aparece o no.
-- El rol solo lo cambia el equipo, para que nadie se ascienda a sí mismo.

drop policy if exists "perfiles: leer con sesion" on public.perfiles;
create policy "perfiles: leer con sesion"
  on public.perfiles for select
  to authenticated
  using (true);

drop policy if exists "perfiles: editar lo propio" on public.perfiles;
create policy "perfiles: editar lo propio"
  on public.perfiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and rol = (select rol from public.perfiles where id = auth.uid()));

drop policy if exists "perfiles: administrar el equipo" on public.perfiles;
create policy "perfiles: administrar el equipo"
  on public.perfiles for all
  to authenticated
  using (public.es_editor())
  with check (public.es_editor());


-- ============================================================================
-- 5. AL CREAR UNA CUENTA
-- ----------------------------------------------------------------------------
-- Supabase crea la cuenta; esto crea su perfil tomando el nombre y el curso de
-- la nómina. Si el correo no está en la nómina, no se crea perfil y la persona
-- no puede entrar aunque tenga cuenta.
-- ============================================================================

create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fila public.nomina%rowtype;
begin
  select * into fila from public.nomina
  where correo = lower(new.email) and habilitado;

  if not found then
    return new;
  end if;

  insert into public.perfiles (id, correo, nombre, curso)
  values (new.id, fila.correo, fila.nombre, fila.curso)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists al_crear_cuenta on auth.users;
create trigger al_crear_cuenta
  after insert on auth.users
  for each row execute function public.crear_perfil();
