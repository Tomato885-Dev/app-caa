-- ============================================================================
-- APP CAA · AGREGAR PERSONAS A LA NÓMINA
-- ----------------------------------------------------------------------------
-- PARA QUÉ
-- La nómina la entregó Secretaría con los 694 alumnos, pero hacen falta más
-- correos: profesores, dirección, y cualquier autoridad del colegio que tenga
-- que entrar. Hasta ahora eso obligaba a escribir SQL a mano cada vez.
--
-- Desde la 1.11 se hace desde Administración → Cuentas y permisos, con el
-- botón "Agregar a la nómina". Este archivo es lo que ese botón necesita.
--
-- QUÉ NO CAMBIA
-- Agregar a alguien a la nómina NO le crea la cuenta: le da permiso para
-- crearla. La persona entra a la app, toca "Activar mi cuenta", recibe su
-- código por correo y elige su contraseña, igual que todos. Mientras no lo
-- haga, no existe en `perfiles` y no aparece en la app.
--
-- POR QUÉ UNA FUNCIÓN Y NO UNA REGLA
-- La tabla `nomina` no se puede leer desde la app a propósito: tiene el nombre,
-- el curso y el correo de 694 menores, y basta con poder preguntar "¿este
-- correo puede registrarse?" sin devolver la lista. Una función deja agregar
-- sin abrir la tabla entera.
--
-- Se puede volver a ejecutar sin romper nada.
-- ============================================================================


-- ============================================================================
-- 1. AGREGAR (O CORREGIR) UNA FILA DE LA NÓMINA
-- ----------------------------------------------------------------------------
-- El "curso" en una autoridad no es un curso: es lo que se va a ver debajo de
-- su nombre en Contactos. "Profesor de Historia" o "Dirección" funcionan igual
-- de bien que "III Medio B", porque el campo es texto libre.
--
-- Si el correo ya estaba, se actualiza y se vuelve a habilitar. Así el botón
-- sirve también para arreglar un correo cargado a medias, sin borrar nada.
-- ============================================================================

create or replace function public.agregar_a_la_nomina(
  p_correo text,
  p_nombre text,
  p_curso text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correo text := lower(trim(coalesce(p_correo, '')));
  v_nombre text := regexp_replace(trim(coalesce(p_nombre, '')), '\s+', ' ', 'g');
  v_curso  text := regexp_replace(trim(coalesce(p_curso, '')), '\s+', ' ', 'g');
  v_existia boolean;
begin
  if not public.es_editor() then
    raise exception 'Solo el equipo del Centro de Alumnos puede agregar personas.';
  end if;

  -- Un correo de verdad, y del colegio: la app solo deja entrar a @verbo.cl,
  -- así que cargar otro dominio dejaría una fila que nunca va a poder usarse.
  if v_correo !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Ese correo no parece un correo.';
  end if;

  if split_part(v_correo, '@', 2) <> 'verbo.cl' then
    raise exception 'Solo se pueden agregar correos @verbo.cl.';
  end if;

  if char_length(v_nombre) < 3 then
    raise exception 'Escribe el nombre completo.';
  end if;

  if v_curso = '' then
    raise exception 'Escribe el curso o el cargo.';
  end if;

  select true into v_existia from public.nomina where correo = v_correo;

  insert into public.nomina (correo, nombre, curso, habilitado)
       values (v_correo, v_nombre, v_curso, true)
  on conflict (correo) do update
          set nombre = excluded.nombre,
              curso = excluded.curso,
              habilitado = true;

  -- Si esa persona YA tenía cuenta, su perfil conserva el nombre viejo. Se
  -- alinea aquí mismo, que es lo que espera quien acaba de corregirlo.
  update public.perfiles
     set nombre = v_nombre,
         curso = v_curso
   where correo = v_correo;

  return case when v_existia then 'actualizada' else 'agregada' end;
end;
$$;

revoke all on function public.agregar_a_la_nomina(text, text, text) from public, anon;
grant execute on function public.agregar_a_la_nomina(text, text, text) to authenticated;


-- ============================================================================
-- 2. AGREGAR VARIOS DE UNA VEZ, A MANO
-- ----------------------------------------------------------------------------
-- Para cargar una tanda de profesores sin ir uno por uno desde la app. Escribe
-- las filas que necesites y ejecuta SOLO este bloque. Está comentado para que
-- no haga nada si se ejecuta el archivo entero por error.
-- ============================================================================

-- insert into public.nomina (correo, nombre, curso, habilitado) values
--   ('nombre.apellido@verbo.cl', 'Apellido Apellido Nombre', 'Profesor de Historia', true),
--   ('otro.correo@verbo.cl',     'Apellido Apellido Nombre', 'Dirección',            true)
-- on conflict (correo) do update
--   set nombre = excluded.nombre, curso = excluded.curso, habilitado = true;


-- ============================================================================
-- 3. COMPROBAR · debe devolver una fila
-- ============================================================================

select 'funcion' as que, proname as nombre
  from pg_proc where proname = 'agregar_a_la_nomina';
