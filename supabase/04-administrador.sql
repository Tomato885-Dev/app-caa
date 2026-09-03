-- ============================================================================
-- APP CAA · DESIGNAR QUIÉN ENTRA COMO ADMINISTRADOR
-- ----------------------------------------------------------------------------
-- Pegar en el SQL Editor de Supabase y ejecutar. Se puede repetir sin romper.
--
-- QUÉ HACE
--   1. Agrega a la nómina el correo de quien va a administrar la aplicación.
--   2. Permite marcar en la nómina con qué rol nace cada cuenta.
--   3. Hace que el perfil se cree ya con ese rol al registrarse.
--
-- POR QUÉ ASÍ Y NO CAMBIANDO EL ROL A MANO DESPUÉS
-- Designar al administrador ANTES de que se registre evita el momento —por
-- corto que sea— en que la única cuenta capaz de publicar todavía no existe.
-- Y deja el procedimiento escrito: sumar un administrador nuevo es una línea
-- en la nómina, no acordarse de correr una consulta suelta.
-- ============================================================================


-- 1. Con qué rol nace cada cuenta -------------------------------------------

alter table public.nomina
  add column if not exists rol_inicial text not null default 'student'
  check (rol_inicial in ('student', 'moderator', 'admin'));

comment on column public.nomina.rol_inicial is
  'Rol que recibe la cuenta al registrarse. Los alumnos quedan como student.';


-- 2. El disparador respeta ese rol -------------------------------------------

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

  -- Sin fila en la nómina no hay perfil, y sin perfil no se entra.
  if not found then
    return new;
  end if;

  insert into public.perfiles (id, correo, nombre, curso, rol)
  values (new.id, fila.correo, fila.nombre, fila.curso, fila.rol_inicial)
  on conflict (id) do nothing;

  return new;
end;
$$;


-- 3. Quién administra ---------------------------------------------------------

-- El nombre y el curso los pone la nomina oficial (03-nomina.sql); aqui solo
-- se decide el rol, para que volver a ejecutar este archivo no pise los datos
-- que entrego el colegio.
insert into public.nomina (correo, nombre, curso, rol_inicial) values
  ('mateoburgosa@verbo.cl', 'Burgos Alfaro Mateo Pablo', 'III Medio B', 'admin')
  on conflict (correo) do update set rol_inicial = 'admin';

-- La cuenta oficial del Centro de Alumnos, para cuando exista el correo.
update public.nomina set rol_inicial = 'admin'
  where correo = 'centrodealumnos@verbo.cl';

update public.nomina set rol_inicial = 'moderator'
  where correo = 'moderacion@verbo.cl';


-- 4. Por si la cuenta ya estaba creada ---------------------------------------
-- Si alguien se registró antes de correr esto, se le pone el rol igual.

update public.perfiles p
   set rol = n.rol_inicial
  from public.nomina n
 where n.correo = p.correo
   and n.rol_inicial <> 'student'
   and p.rol = 'student';
