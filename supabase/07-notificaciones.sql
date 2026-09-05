-- ============================================================================
-- APP CAA · NOTIFICACIONES
-- ----------------------------------------------------------------------------
-- Pegar en el SQL Editor de Supabase y ejecutar. Se puede repetir sin romper.
--
-- QUÉ GUARDA
-- Un registro por DISPOSITIVO, no por persona. Alguien que entra desde el
-- teléfono y desde el computador tiene dos, y recibe el aviso en los dos.
--
-- POR QUÉ HAY UNA COLUMNA `canal`
-- Hoy la aplicación se abre en el navegador y las notificaciones viajan por
-- Web Push. Cuando esté envuelta para Google Play y la App Store, viajarán por
-- FCM y APNs, que son sistemas distintos con credenciales distintas.
--
-- Guardar el canal desde ahora significa que ese día se agrega una rama a la
-- función que envía, y nada más: ni migración, ni tabla nueva, ni volver a
-- pedirle permiso a los 694. Los dispositivos web ya registrados siguen
-- funcionando junto a los nativos.
-- ============================================================================


-- ============================================================================
-- 1. DISPOSITIVOS SUSCRITOS
-- ============================================================================

create table if not exists public.dispositivos (
  id          uuid primary key default gen_random_uuid(),
  usuario     uuid not null references auth.users (id) on delete cascade,

  -- 'web' hoy; 'android' y 'ios' cuando la app esté en las tiendas.
  canal       text not null default 'web'
              check (canal in ('web', 'android', 'ios')),

  -- Web Push: la dirección única que da el navegador. FCM/APNs: el token.
  -- Es lo que identifica al dispositivo, así que no puede repetirse.
  destino     text not null unique,

  -- Solo Web Push: las dos claves con que se cifra el mensaje.
  clave_p256  text,
  clave_auth  text,

  -- Para reconocer el aparato en una lista, sin identificar a la persona.
  descripcion text,

  creado_en   timestamptz not null default now(),
  usado_en    timestamptz
);

create index if not exists dispositivos_usuario_idx on public.dispositivos (usuario);

comment on table public.dispositivos is
  'Un registro por dispositivo suscrito a las notificaciones del Centro de Alumnos.';


-- ============================================================================
-- 2. QUIÉN PUEDE HACER QUÉ
-- ----------------------------------------------------------------------------
-- Cada persona administra SUS dispositivos y no ve los de nadie más. Ni
-- siquiera la administración necesita leerlos desde la aplicación: quien envía
-- es la función del servidor, que trabaja por debajo de estas reglas.
--
-- Esto importa: la dirección de un dispositivo permite mandarle notificaciones.
-- Que la lista no salga del servidor evita que alguien con sesión iniciada se
-- lleve las de sus compañeros.
-- ============================================================================

alter table public.dispositivos enable row level security;

drop policy if exists "dispositivos: los propios" on public.dispositivos;
create policy "dispositivos: los propios"
  on public.dispositivos for all
  to authenticated
  using (usuario = auth.uid())
  with check (usuario = auth.uid());


-- ============================================================================
-- 3. AVISOS ENVIADOS
-- ----------------------------------------------------------------------------
-- Deja constancia de qué se mandó, cuándo y a cuántos. Sirve para no repetir
-- un aviso por error y para saber si de verdad salió cuando alguien reclama
-- que no le llegó.
-- ============================================================================

create table if not exists public.avisos (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  cuerpo      text not null,
  -- A dónde lleva al tocarla, p. ej. '/comunicados/com_12'.
  ruta        text,
  -- Qué contenido lo origina, para no mandar dos veces el mismo comunicado.
  origen      text unique,
  enviado_por uuid references auth.users (id) on delete set null,
  enviados    integer not null default 0,
  fallidos    integer not null default 0,
  creado_en   timestamptz not null default now()
);

alter table public.avisos enable row level security;

-- Leerlos: el equipo, para ver el historial. Escribir: solo la función.
drop policy if exists "avisos: leer el equipo" on public.avisos;
create policy "avisos: leer el equipo"
  on public.avisos for select
  to authenticated
  using (public.es_editor());


-- ============================================================================
-- 4. COMPROBAR
-- ============================================================================

select
  (select count(*) from public.dispositivos) as dispositivos,
  (select count(*) from public.avisos)       as avisos_enviados;
