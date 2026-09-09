// @ts-nocheck — Esta carpeta la ejecuta Deno en el servidor de Supabase, no la
// aplicación. No entra en la compilación (`tsconfig.json` solo incluye `src`).

import { createClient } from 'jsr:@supabase/supabase-js@2';

/* ============================================================================
   BORRAR LA PROPIA CUENTA
   ----------------------------------------------------------------------------
   Vive en el servidor porque eliminar unas credenciales de acceso exige la
   llave de administración de Supabase, y esa llave no puede viajar dentro de
   la aplicación: quien la tuviera podría borrar la cuenta de cualquiera.

   POR QUÉ EXISTE
   Apple exige que toda aplicación donde uno pueda crearse una cuenta permita
   también borrarla desde adentro, sin escribirle a nadie. Google pide lo mismo
   en su formulario de seguridad de los datos. Sin esto, la aplicación no entra
   a ninguna de las dos tiendas.

   SOLO SE BORRA A SÍ MISMO
   La identidad se saca de la sesión de quien llama, NUNCA del cuerpo de la
   petición. No hay forma de pedir "borra a este otro": ese dato no se lee.

   QUÉ SE BORRA Y QUÉ NO
     · Se borra el perfil, el teléfono, los dispositivos de notificaciones y
       las credenciales de acceso.
     · NO se borra la fila de la nómina: esa lista es del colegio, no del
       Centro de Alumnos, y la persona sigue siendo estudiante. Por eso
       tampoco queda impedida de volver a activar su cuenta más adelante.
     · NO se borra lo que haya publicado. Un comunicado del Centro de Alumnos
       le sirve a la comunidad aunque su autor ya no tenga cuenta. Quien quiera
       que además se retire su contenido lo pide por correo, como dice la
       política de privacidad.

   EL ÚLTIMO ADMINISTRADOR NO PUEDE IRSE
   Si el único administrador que queda borra su cuenta, nadie puede volver a
   dar permisos, habilitar gente ni publicar: la aplicación queda sin gobierno
   y solo se arregla entrando a la base de datos a mano. Se rechaza y se le
   explica que primero nombre a otro.
   ========================================================================== */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const responder = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return responder({ error: 'Solo POST.' }, 405);

  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  const servicio = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // --- ¿Quién llama? --------------------------------------------------------
  const authorization = req.headers.get('Authorization') ?? '';
  if (!authorization) return responder({ error: 'Falta la sesión.' }, 401);

  const comoUsuario = createClient(url, anon, {
    global: { headers: { Authorization: authorization } },
  });

  const { data: sesion } = await comoUsuario.auth.getUser();
  if (!sesion?.user) return responder({ error: 'Sesión no válida.' }, 401);

  const id = sesion.user.id;
  const admin = createClient(url, servicio);

  // --- ¿Es el último administrador? -----------------------------------------
  const { data: perfil } = await admin
    .from('perfiles')
    .select('rol')
    .eq('id', id)
    .maybeSingle();

  if (perfil?.rol === 'admin') {
    const { count } = await admin
      .from('perfiles')
      .select('id', { count: 'exact', head: true })
      .eq('rol', 'admin')
      .eq('activo', true);

    if ((count ?? 0) <= 1) {
      return responder(
        {
          error:
            'Eres el único administrador. Nombra a otra persona administradora antes de borrar tu cuenta, ' +
            'o la aplicación quedaría sin nadie que pueda gestionarla.',
        },
        409,
      );
    }
  }

  /* --- Se borra de dentro hacia fuera --------------------------------------
     Los dispositivos y el perfil apuntan a las credenciales con `on delete
     cascade`, así que borrar las credenciales bastaría. Se hacen igual, y en
     este orden, para que un fallo a mitad de camino deje a la persona sin
     datos personales visibles antes que con la cuenta a medio existir. */
  const { error: errorDispositivos } = await admin.from('dispositivos').delete().eq('usuario', id);
  if (errorDispositivos) {
    return responder({ error: `No se pudieron borrar los dispositivos: ${errorDispositivos.message}` }, 500);
  }

  const { error: errorPerfil } = await admin.from('perfiles').delete().eq('id', id);
  if (errorPerfil) {
    return responder({ error: `No se pudo borrar el perfil: ${errorPerfil.message}` }, 500);
  }

  const { error: errorCuenta } = await admin.auth.admin.deleteUser(id);
  if (errorCuenta) {
    return responder({ error: `No se pudieron borrar las credenciales: ${errorCuenta.message}` }, 500);
  }

  return responder({ borrada: true });
});
