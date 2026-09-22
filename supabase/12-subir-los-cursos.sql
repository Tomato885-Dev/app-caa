-- ============================================================================
-- APP CAA · SUBIR LOS CURSOS UN AÑO
-- ----------------------------------------------------------------------------
-- PARA QUÉ
-- En marzo empieza el año nuevo y todo el colegio cambia de curso: quien
-- estaba en 8° Básico A pasa a I Medio A, quien estaba en I Medio A pasa a
-- II Medio A, y así. La letra no cambia: el curso se mantiene completo.
--
-- Hacer eso a mano son casi setecientas filas en dos tablas. Este archivo lo
-- deja en un botón, escondido al final de Administración → Cuentas y permisos.
--
-- QUÉ PASA CON IV MEDIO
-- Egresan. No tienen curso al que pasar, así que quedan como "Egresado 2027"
-- y su cuenta se desactiva: dejan de poder entrar. No se borra a nadie, queda
-- el registro completo; si alguno tiene que seguir entrando (un ayudante, un
-- ex-presidente del Centro) se le vuelve a activar a mano desde la misma
-- pantalla.
--
-- QUIÉN QUEDA IGUAL
-- Los profesores y las autoridades. Su "curso" no es un curso sino un cargo
-- ("Profesor de Historia", "Dirección"), y como no calza con ningún nivel, no
-- se toca. Lo mismo el 8° Básico que entra: esos son alumnos nuevos que aún no
-- están en la nómina y se agregan con el botón "Agregar a la nómina".
--
-- TRES CANDADOS
--   1. Solo un administrador puede ejecutarlo. Ni siquiera los moderadores.
--   2. Hay que escribir el año al que se sube. Si no calza, no hace nada.
--   3. No se puede correr dos veces el mismo año: queda anotado.
-- Y además tiene ensayo: se puede pedir el resumen SIN cambiar nada.
--
-- Se puede volver a ejecutar este archivo sin romper nada.
-- ============================================================================


-- ============================================================================
-- 1. EL NIVEL SIGUIENTE DE UN CURSO
-- ----------------------------------------------------------------------------
-- Devuelve el curso del año que viene, o NULL si ese texto no es un curso que
-- deba subir (un cargo, un "Egresado 2026" de la vez pasada, cualquier cosa).
--
-- OJO CON EL LIMITE DE PALABRA
-- Aqui va `\y` y no ``. En JavaScript `` es "limite de palabra", pero en
-- PostgreSQL `` es el caracter de BORRADO, asi que `'^IV\s+Medio'` busca
-- "IV Medio" seguido de un borrado: no calza nunca y la funcion devolvia NULL
-- para todos los cursos. El limite de palabra en Postgres se escribe `\y`.
--
-- OJO CON EL LIMITE DE PALABRA
-- Aqui va \y y no \b. En JavaScript \b es "limite de palabra",
-- pero en PostgreSQL \b es el caracter de BORRADO: el patron buscaba
-- "IV Medio" seguido de un borrado, no calzaba nunca, y la funcion devolvia
-- NULL para todos los cursos. El limite de palabra en Postgres es \y.
--
-- EL ORDEN DE LOS NIVELES IMPORTA
-- "I Medio", "II Medio", "III Medio" y "IV Medio" empiezan todos con I. Cada
-- patrón exige el espacio justo después del número romano, así que "II Medio"
-- nunca se confunde con "I Medio"; aun así se prueban de mayor a menor, que es
-- el mismo criterio que usa la app en `src/modules/apuntes/generacion.ts`.
--
-- El reemplazo toca SOLO el nivel y deja el resto del texto intacto, que es
-- donde viene la letra: "8° Básico A" -> "I Medio A".
-- ============================================================================

create or replace function public.curso_del_ano_siguiente(p_curso text, p_anio int)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when p_curso ~ '^IV\s+Medio\y'        then 'Egresado ' || p_anio
    when p_curso ~ '^III\s+Medio\y'       then regexp_replace(p_curso, '^III\s+Medio',  'IV Medio')
    when p_curso ~ '^II\s+Medio\y'        then regexp_replace(p_curso, '^II\s+Medio',   'III Medio')
    when p_curso ~ '^I\s+Medio\y'         then regexp_replace(p_curso, '^I\s+Medio',    'II Medio')
    when p_curso ~ '^8\s*°?\s*B[aá]sico\y' then regexp_replace(p_curso, '^8\s*°?\s*B[aá]sico', 'I Medio')
    else null
  end;
$$;


-- ============================================================================
-- 2. SUBIR TODO EL COLEGIO UN AÑO
-- ----------------------------------------------------------------------------
--   p_anio        El año al que se sube. 2027 significa "empieza 2027".
--   p_ensayo      true = solo cuenta y muestra, sin cambiar nada.
--
-- Devuelve un resumen en JSON con cuántos se mueven de cada nivel.
--
-- POR QUÉ UN SOLO UPDATE Y NO UNO POR NIVEL
-- Si se subiera nivel por nivel de abajo hacia arriba, el segundo update
-- volvería a agarrar a los que acaba de mover el primero y los subiría dos
-- veces. Con un único UPDATE que decide con CASE, cada fila se evalúa una sola
-- vez contra su valor original. Además así es atómico: o se mueven todos o no
-- se mueve ninguno.
-- ============================================================================

create or replace function public.subir_los_cursos_un_ano(
  p_anio int,
  p_ensayo boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_resumen jsonb;
  v_nomina int;
  v_perfiles int;
  v_egresan int;
  v_hecho jsonb;
begin
  -- --- Candado 1: solo un administrador ------------------------------------
  -- `es_editor()` incluiría a los moderadores, y esto mueve el curso de todo
  -- el colegio de una vez. Se exige el rol más alto a propósito.
  if not exists (
    select 1 from public.perfiles
     where id = auth.uid() and activo and rol = 'admin'
  ) then
    raise exception 'Solo un administrador puede subir los cursos.';
  end if;

  -- --- Candado 2: un año que tenga sentido ---------------------------------
  if p_anio is null or p_anio < 2026 or p_anio > 2100 then
    raise exception 'El año % no parece correcto.', p_anio;
  end if;

  -- --- Candado 3: no dos veces el mismo año --------------------------------
  select datos into v_hecho
    from public.contenido
   where coleccion = 'sistema' and id = 'ascenso-de-cursos';

  if not p_ensayo and v_hecho is not null and (v_hecho->>'anio')::int >= p_anio then
    raise exception 'Los cursos ya se subieron a % el %. No se puede repetir.',
      v_hecho->>'anio', v_hecho->>'cuando';
  end if;

  -- --- El resumen, que sirve igual para el ensayo y para el resultado ------
  select jsonb_build_object(
      'octavo_a_primero',   count(*) filter (where curso ~ '^8\s*°?\s*B[aá]sico\y'),
      'primero_a_segundo',  count(*) filter (where curso ~ '^I\s+Medio\y'),
      'segundo_a_tercero',  count(*) filter (where curso ~ '^II\s+Medio\y'),
      'tercero_a_cuarto',   count(*) filter (where curso ~ '^III\s+Medio\y'),
      'cuarto_egresa',      count(*) filter (where curso ~ '^IV\s+Medio\y'),
      'sin_tocar',          count(*) filter (where public.curso_del_ano_siguiente(curso, p_anio) is null)
    ) into v_resumen
    from public.nomina;

  -- --- El ensayo se detiene aquí -------------------------------------------
  if p_ensayo then
    return v_resumen || jsonb_build_object('ensayo', true, 'anio', p_anio);
  end if;

  -- --- Nómina ---------------------------------------------------------------
  update public.nomina
     set curso = public.curso_del_ano_siguiente(curso, p_anio),
         -- Quien egresa deja de poder crear cuenta.
         habilitado = case when curso ~ '^IV\s+Medio\y' then false else habilitado end
   where public.curso_del_ano_siguiente(curso, p_anio) is not null;
  get diagnostics v_nomina = row_count;

  -- --- Perfiles (las cuentas ya creadas) -----------------------------------
  -- Se cuenta primero a los que egresan, porque después de subirlos su curso
  -- ya no dice "IV Medio" y no habría forma de contarlos.
  select count(*) into v_egresan
    from public.perfiles where curso ~ '^IV\s+Medio\y';

  update public.perfiles
     set curso = public.curso_del_ano_siguiente(curso, p_anio),
         -- Egresar cierra el acceso, pero NO borra nada: la cuenta se puede
         -- volver a activar a mano desde Cuentas y permisos.
         activo = case when curso ~ '^IV\s+Medio\y' then false else activo end,
         editado_en = now()
   where public.curso_del_ano_siguiente(curso, p_anio) is not null;
  get diagnostics v_perfiles = row_count;

  -- --- Queda anotado, para que no se repita --------------------------------
  insert into public.contenido (coleccion, id, datos)
       values ('sistema', 'ascenso-de-cursos', jsonb_build_object(
         'anio', p_anio,
         'cuando', now(),
         'quien', (select correo from public.perfiles where id = auth.uid()),
         'nomina', v_nomina,
         'perfiles', v_perfiles
       ))
  on conflict (coleccion, id) do update set datos = excluded.datos, editado_en = now();

  return v_resumen || jsonb_build_object(
    'ensayo', false,
    'anio', p_anio,
    'nomina_actualizada', v_nomina,
    'perfiles_actualizados', v_perfiles,
    'cuentas_cerradas', v_egresan
  );
end;
$$;

revoke all on function public.subir_los_cursos_un_ano(int, boolean) from public, anon;
grant execute on function public.subir_los_cursos_un_ano(int, boolean) to authenticated;


-- ============================================================================
-- 3. COMPROBAR · las dos funciones y una prueba del mapeo
-- ============================================================================

select 'funcion' as que, proname as nombre
  from pg_proc
 where proname in ('curso_del_ano_siguiente', 'subir_los_cursos_un_ano')
 order by proname;

-- El mapeo, sin tocar ninguna tabla. Debe salir cada curso con el siguiente,
-- la letra intacta, y NULL en el cargo de un profesor.
select curso, public.curso_del_ano_siguiente(curso, 2027) as el_ano_que_viene
  from (values
    ('8° Básico A'), ('I Medio B'), ('II Medio C'),
    ('III Medio A'), ('IV Medio B'), ('Profesor de Historia')
  ) as prueba(curso);
