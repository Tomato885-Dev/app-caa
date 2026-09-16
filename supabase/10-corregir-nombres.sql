-- ============================================================================
-- APP CAA · CORREGIR NOMBRES MAL ESCRITOS
-- ----------------------------------------------------------------------------
-- QUÉ PASABA
-- Los nombres vienen de la nómina que entregó Secretaría, y algunos vienen mal
-- escritos: un apellido equivocado, una tilde de menos. Como la base de
-- contactos busca por nombre, a esos alumnos no se les encuentra.
--
-- El nombre está guardado en DOS lugares:
--   · nomina    de donde se copia al crear la cuenta, y
--   · perfiles  lo que se ve en la app.
-- Corregir solo uno no sirve: si se arregla el perfil y no la nómina, el error
-- vuelve el día que esa persona borre su cuenta y se registre de nuevo.
--
-- QUÉ HACE ESTE ARCHIVO
--   1. Una función que corrige los dos a la vez. La usa el botón "Corregir
--      nombre" de Administración → Cuentas y permisos, y solo le responde al
--      equipo (moderadores y administradores).
--   2. Un candado: cada alumno puede cambiar su teléfono y si aparece en los
--      contactos, pero NO su nombre, su curso, su correo ni si está activo.
--      Hasta ahora la base de datos solo protegía el rol.
--
-- OJO CON 03-nomina.sql
-- Ese archivo vuelve a escribir los nombres de la nómina tal como venían. Si
-- algún día se vuelve a ejecutar, corrige antes el nombre también en
-- src/content/roster.ts y regenera el archivo, o se perderán las correcciones.
--
-- Se puede volver a ejecutar sin romper nada.
-- ============================================================================


-- ============================================================================
-- 1. CORREGIR EL NOMBRE DE UNA CUENTA
-- ============================================================================

create or replace function public.corregir_nombre(p_perfil uuid, p_nombre text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  limpio text := regexp_replace(trim(coalesce(p_nombre, '')), '\s+', ' ', 'g');
  v_correo text;
begin
  if not public.es_editor() then
    raise exception 'Solo el equipo del Centro de Alumnos puede corregir nombres.';
  end if;

  if char_length(limpio) < 3 or char_length(limpio) > 80 then
    raise exception 'El nombre debe tener entre 3 y 80 caracteres.';
  end if;

  update public.perfiles
     set nombre = limpio,
         editado_en = now()
   where id = p_perfil
  returning correo into v_correo;

  if v_correo is null then
    raise exception 'No se encontró esa cuenta.';
  end if;

  update public.nomina
     set nombre = limpio
   where correo = v_correo;
end;
$$;

revoke all on function public.corregir_nombre(uuid, text) from public, anon;
grant execute on function public.corregir_nombre(uuid, text) to authenticated;


-- ============================================================================
-- 2. EL CANDADO · nadie cambia su propio nombre
-- ----------------------------------------------------------------------------
-- La regla "perfiles: editar lo propio" deja a cada uno editar su fila, pero
-- no dice qué columnas. Este disparador lo completa: si quien edita no es del
-- equipo, los datos que vienen de la nómina tienen que quedar como estaban.
--
-- Solo se aplica a sesiones de la app. El SQL Editor y las funciones del
-- servidor no pasan por aquí.
-- ============================================================================

create or replace function public.proteger_datos_de_la_nomina()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') <> 'authenticated' or public.es_editor() then
    return new;
  end if;

  if new.nombre is distinct from old.nombre
     or new.curso is distinct from old.curso
     or new.correo is distinct from old.correo
     or new.activo is distinct from old.activo
     or new.rol is distinct from old.rol then
    raise exception 'Tu nombre, curso y correo los define la nómina del colegio.';
  end if;

  return new;
end;
$$;

drop trigger if exists proteger_datos_de_la_nomina on public.perfiles;
create trigger proteger_datos_de_la_nomina
  before update on public.perfiles
  for each row execute function public.proteger_datos_de_la_nomina();


-- ============================================================================
-- 3. COMPROBAR · debe devolver dos filas
-- ============================================================================

select 'funcion' as que, proname as nombre
  from pg_proc where proname = 'corregir_nombre'
union all
select 'candado', tgname
  from pg_trigger where tgname = 'proteger_datos_de_la_nomina';
