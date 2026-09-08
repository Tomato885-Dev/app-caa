-- ============================================================================
-- APP CAA · CUENTA PARA LOS REVISORES DE LAS TIENDAS
-- ----------------------------------------------------------------------------
-- Google Play y App Store no aprueban una app con pantalla de acceso si no les
-- entregas una cuenta con la que entrar. La revisan a cualquier hora, sin
-- avisar, y si no pueden entrar la rechazan sin mirar nada más.
--
-- POR QUÉ ESTO FUNCIONA SIN ROMPER NADA
-- Nuestro acceso pide el código del correo solo al REGISTRARSE. Para iniciar
-- sesión basta el correo y la contraseña. Un revisor nunca se registra: usa la
-- cuenta que ya existe, y por eso no necesita recibir ningún correo, cosa que
-- de otro modo sería imposible.
--
-- SE HACE EN DOS PARTES Y EL ORDEN IMPORTA
--   1. Este archivo, que la agrega a la nómina.
--   2. Crear la cuenta en el panel de Supabase (instrucciones al final).
--
-- Si se hace al revés, la cuenta nace sin perfil y no podrá entrar: el perfil
-- se crea mirando la nómina, y si el correo no está todavía, no hay nada que
-- copiar.
-- ============================================================================


-- ============================================================================
-- 1. LA CUENTA ENTRA A LA NÓMINA
-- ----------------------------------------------------------------------------
-- Rol de estudiante a propósito: el revisor tiene que ver la aplicación como
-- la ve un alumno, no el panel de administración. Enseñarle una versión
-- distinta de la que reciben los usuarios es motivo de rechazo.
-- ============================================================================

insert into public.nomina (correo, nombre, curso, rol_inicial, habilitado)
values ('revision.play@verbo.cl', 'Cuenta de revision', 'IV Medio A', 'student', true)
on conflict (correo) do update
  set nombre = excluded.nombre,
      curso = excluded.curso,
      rol_inicial = 'student',
      habilitado = true;


-- ============================================================================
-- 2. QUE NO APAREZCA EN LA BASE DE CONTACTOS
-- ----------------------------------------------------------------------------
-- Se ejecuta DESPUÉS de crear la cuenta en el panel. Antes no hay perfil que
-- marcar, y la consulta no hace nada (sin error).
--
-- No es cosmético: la cuenta no es una persona del colegio y no corresponde
-- que aparezca entre los compañeros.
-- ============================================================================

update public.perfiles
   set oculto = true
 where correo = 'revision.play@verbo.cl';


-- ============================================================================
-- 3. COMPROBAR
-- ----------------------------------------------------------------------------
-- Después de crear la cuenta, esto tiene que devolver UNA fila con perfil.
-- Si la columna `perfil` dice "sin perfil", la cuenta no podrá entrar: revisa
-- que se haya creado con "Auto Confirm User" marcado.
-- ============================================================================

select
  n.correo,
  n.nombre,
  n.habilitado,
  case when p.id is null then 'SIN PERFIL - no podra entrar' else 'con perfil' end as perfil,
  p.oculto
from public.nomina n
left join public.perfiles p on p.correo = n.correo
where n.correo = 'revision.play@verbo.cl';


-- ============================================================================
-- CÓMO CREAR LA CUENTA (en el panel, no aquí)
-- ----------------------------------------------------------------------------
--   1. Supabase -> Authentication -> Users -> boton "Add user"
--   2. Email:    revision.play@verbo.cl
--   3. Password: inventa una larga y guardala; es la que le das a Google
--   4. MARCAR "Auto Confirm User"  <-- lo mas importante de todo
--
-- El paso 4 es el que hace que la cuenta nazca ya confirmada. Sin marcarlo,
-- Supabase mandaria un correo de verificacion a una direccion que no existe,
-- la cuenta quedaria a medias y el revisor no podria entrar.
--
-- Despues de crearla, vuelve a ejecutar los puntos 2 y 3 de este archivo.
--
--
-- QUE SE LE ENTREGA A GOOGLE PLAY
-- En la consola: Politica -> Contenido de la app -> Acceso a la app
--   · "Todas las funciones estan restringidas"
--   · Usuario:    revision.play@verbo.cl
--   · Contrasena: la que inventaste
--   · En las instrucciones, algo asi:
--
--       Aplicacion privada del Centro de Alumnos de un colegio. El registro
--       esta limitado a la nomina oficial de estudiantes, por eso se entrega
--       esta cuenta ya creada. Iniciar sesion con el correo y la contrasena
--       indicados; no se requiere codigo de verificacion para iniciar sesion.
--
--
-- CUIDADOS
--   · Esa contrasena da acceso a la aplicacion. Guardala donde guardas la
--     nomina, y NO la subas al repositorio.
--   · La cuenta NO recibe correo. Si el revisor usa "Olvide mi contrasena",
--     no le llegara nada. Por eso la contrasena tiene que estar bien anotada.
--   · Cerrar el registro con 05-lanzamiento.sql no la afecta: `habilitado`
--     controla quien puede REGISTRARSE, y esta cuenta ya existe.
-- ============================================================================
