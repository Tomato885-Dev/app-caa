-- ============================================================================
-- APP CAA · EL PERFIL SE CREA AL CONFIRMAR, NO AL EMPEZAR
-- ----------------------------------------------------------------------------
-- QUÉ ESTABA MAL
-- El disparador se ejecutaba "after insert on auth.users", y esa fila nace
-- cuando alguien ESCRIBE su contraseña, antes de comprobar su correo. Es decir,
-- quedaba perfil creado para gente que nunca terminó de activarse.
--
-- Dos consecuencias:
--   · el contador de "Cuentas activadas" contaba de más, y
--   · en Cuentas y permisos aparecían como activados quienes no lo estaban.
--
-- QUÉ HACE ESTE ARCHIVO
--   1. Muestra el estado real de cada cuenta (no cambia nada).
--   2. Hace que el perfil se cree cuando el correo queda confirmado.
--   3. Borra los perfiles que se crearon antes de tiempo.
--
-- Se puede volver a ejecutar sin romper nada.
-- ============================================================================


-- ============================================================================
-- 1. DIAGNÓSTICO · ejecuta esto primero y mira el resultado
-- ============================================================================

select
  u.email                                    as correo,
  case when u.email_confirmed_at is null
       then 'NO confirmo su correo'
       else 'confirmado'
  end                                        as estado,
  u.created_at                               as empezo_el,
  u.email_confirmed_at                       as confirmo_el,
  case when p.id is null then 'sin perfil' else 'con perfil' end as perfil
from auth.users u
left join public.perfiles p on p.id = u.id
order by u.created_at;

-- Lo que debería verse: los que dicen "NO confirmo su correo" y a la vez
-- "con perfil" son exactamente el problema.


-- ============================================================================
-- 2. EL ARREGLO · el perfil nace al confirmar
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
  -- Mientras el correo no este confirmado, no hay perfil y no se entra.
  if new.email_confirmed_at is null then
    return new;
  end if;

  select * into fila from public.nomina
  where correo = lower(new.email) and habilitado;

  -- Sin fila en la nomina tampoco hay perfil, aunque exista la cuenta.
  if not found then
    return new;
  end if;

  insert into public.perfiles (id, correo, nombre, curso, rol)
  values (new.id, fila.correo, fila.nombre, fila.curso, fila.rol_inicial)
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Ahora tambien escucha la confirmacion, que es un UPDATE sobre la misma fila.
drop trigger if exists al_crear_cuenta on auth.users;
create trigger al_crear_cuenta
  after insert or update of email_confirmed_at on auth.users
  for each row execute function public.crear_perfil();


-- ============================================================================
-- 3. LIMPIAR LOS PERFILES CREADOS ANTES DE TIEMPO
-- ----------------------------------------------------------------------------
-- Solo borra el PERFIL, no la cuenta. Quien estaba a medias sigue existiendo
-- y su perfil se crea solo en cuanto escriba el codigo de su correo.
-- ============================================================================

delete from public.perfiles p
 using auth.users u
 where p.id = u.id
   and u.email_confirmed_at is null;


-- ============================================================================
-- 4. COMPROBAR
-- ----------------------------------------------------------------------------
-- Ahora cada perfil corresponde a alguien que SI confirmo su correo.
-- Las dos cifras tienen que ser iguales.
-- ============================================================================

select
  (select count(*) from public.perfiles)                                as perfiles,
  (select count(*) from auth.users where email_confirmed_at is not null) as confirmados;
