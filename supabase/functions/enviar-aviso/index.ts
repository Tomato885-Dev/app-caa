// @ts-nocheck — Esta carpeta la ejecuta Deno en el servidor de Supabase, no la
// aplicación. No entra en la compilación (`tsconfig.json` solo incluye `src`).

import { createClient } from 'jsr:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';
import { cuentaDeServicio, enviarPorFirebase } from './firebase.ts';

/* ============================================================================
   ENVIAR UN AVISO A TODOS LOS DISPOSITIVOS
   ----------------------------------------------------------------------------
   Vive en el servidor porque necesita la llave privada VAPID, que es lo único
   que demuestra que el aviso viene del Centro de Alumnos. Si esa llave viajara
   dentro de la aplicación, cualquiera podría mandarle notificaciones a los 694
   alumnos haciéndose pasar por el Centro de Alumnos.

   CÓMO SE USA
   POST con { titulo, cuerpo, ruta?, origen? } y la sesión de quien publica.

   QUIÉN PUEDE
   Solo moderadores y administradores. Se comprueba con el perfil de quien
   llama, no con lo que diga el mensaje.

   DOS CANALES, UN SOLO AVISO
   Quien usa la aplicacion en el navegador recibe por Web Push. Quien la
   instalo desde Google Play o App Store recibe por Firebase, porque un
   navegador metido dentro de una app no puede mostrar notificaciones del
   sistema. La columna `canal` de cada dispositivo dice por donde va, y el
   aviso se registra una sola vez para los dos.

   LIMPIA LO QUE SE MUERE
   Un teléfono que desinstala la app deja una dirección que ya no existe. El
   servicio de notificaciones responde 404 o 410, y ahí se borra el registro:
   si no, la tabla se llena de direcciones muertas y cada envío tarda más.
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
  const vapidPublica = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivada = Deno.env.get('VAPID_PRIVATE_KEY');
  const contacto = Deno.env.get('VAPID_CONTACTO') ?? 'mailto:centrodealumnos@verbo.cl';

  // --- ¿Quién llama, y puede publicar? --------------------------------------
  const authorization = req.headers.get('Authorization') ?? '';
  if (!authorization) return responder({ error: 'Falta la sesión.' }, 401);

  const comoUsuario = createClient(url, anon, {
    global: { headers: { Authorization: authorization } },
  });

  const { data: sesion } = await comoUsuario.auth.getUser();
  if (!sesion?.user) return responder({ error: 'Sesión no válida.' }, 401);

  const { data: perfil } = await comoUsuario
    .from('perfiles')
    .select('rol, activo')
    .eq('id', sesion.user.id)
    .maybeSingle();

  if (!perfil?.activo || !['moderator', 'admin'].includes(perfil.rol)) {
    return responder({ error: 'No tienes permiso para enviar avisos.' }, 403);
  }

  // --- Qué se manda ---------------------------------------------------------
  let cuerpoPeticion: { titulo?: string; cuerpo?: string; ruta?: string; origen?: string };
  try {
    cuerpoPeticion = await req.json();
  } catch {
    return responder({ error: 'El cuerpo no es JSON válido.' }, 400);
  }

  const titulo = (cuerpoPeticion.titulo ?? '').trim();
  const texto = (cuerpoPeticion.cuerpo ?? '').trim();
  if (!titulo) return responder({ error: 'Falta el título del aviso.' }, 400);

  const admin = createClient(url, servicio);

  /* Se anota ANTES de enviar. `origen` es único, así que si alguien pulsa dos
     veces —o se publica el mismo comunicado otra vez— el segundo intento
     choca aquí y nadie recibe la notificación repetida. */
  const { data: aviso, error: errorAviso } = await admin
    .from('avisos')
    .insert({
      titulo,
      cuerpo: texto,
      ruta: cuerpoPeticion.ruta ?? null,
      origen: cuerpoPeticion.origen ?? null,
      enviado_por: sesion.user.id,
    })
    .select('id')
    .single();

  if (errorAviso) {
    if (errorAviso.code === '23505') {
      return responder({ error: 'Ese aviso ya se envió antes.', duplicado: true }, 409);
    }
    return responder({ error: `No se pudo registrar el aviso: ${errorAviso.message}` }, 500);
  }

  // --- A quiénes ------------------------------------------------------------
  const { data: dispositivos, error: errorDispositivos } = await admin
    .from('dispositivos')
    .select('id, canal, destino, clave_p256, clave_auth');

  if (errorDispositivos) {
    return responder({ error: `No se pudieron leer los dispositivos: ${errorDispositivos.message}` }, 500);
  }

  const todos = dispositivos ?? [];
  const porNavegador = todos.filter((d) => d.canal === 'web');
  const porApp = todos.filter((d) => d.canal === 'android' || d.canal === 'ios');

  /* Sin ruta se manda './': el navegador la resuelve como "la portada" y la
     app instalada la descarta, porque solo navega a rutas que empiezan con
     una barra. En los dos casos el aviso simplemente abre la aplicación. */
  const ruta = cuerpoPeticion.ruta ?? './';
  const origen = cuerpoPeticion.origen ?? null;

  let enviados = 0;
  const muertos: string[] = [];

  // --- Navegadores ----------------------------------------------------------
  if (porNavegador.length > 0) {
    if (!vapidPublica || !vapidPrivada) {
      return responder({ error: 'Faltan las llaves VAPID en los secretos.' }, 500);
    }

    webpush.setVapidDetails(contacto, vapidPublica, vapidPrivada);
    const carga = JSON.stringify({ titulo, cuerpo: texto, ruta, origen });

    /* Todos a la vez: son peticiones independientes y en serie tardarían
       minutos, tiempo que la función no tiene. */
    await Promise.all(
      porNavegador.map(async (dispositivo) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: dispositivo.destino,
              keys: { p256dh: dispositivo.clave_p256, auth: dispositivo.clave_auth },
            },
            carga,
          );
          enviados += 1;
        } catch (fallo) {
          // 404/410 = ese navegador ya no existe. Cualquier otro error es
          // pasajero y el registro se conserva para el próximo aviso.
          const codigo = (fallo as { statusCode?: number }).statusCode;
          if (codigo === 404 || codigo === 410) muertos.push(dispositivo.id);
        }
      }),
    );
  }

  // --- Apps instaladas ------------------------------------------------------
  const cuenta = cuentaDeServicio();

  if (porApp.length > 0 && !cuenta) {
    /* No se corta el envío: los navegadores ya recibieron y cortar ahora los
       dejaría sin aviso además de los teléfonos. Quedan como fallidos, que es
       lo que se ve en Administración. */
    console.error(
      `Hay ${porApp.length} teléfonos esperando el aviso y falta el secreto ` +
        'FIREBASE_CUENTA_SERVICIO. No se envió a ninguno.',
    );
  }

  if (porApp.length > 0 && cuenta) {
    /* De a cincuenta. Firebase quiere una petición por teléfono, y lanzar
       setecientas a la vez agota las conexiones del servidor antes de que
       ninguna termine. */
    const LOTE = 50;
    for (let desde = 0; desde < porApp.length; desde += LOTE) {
      const lote = porApp.slice(desde, desde + LOTE);
      const resultados = await Promise.all(
        lote.map((dispositivo) =>
          enviarPorFirebase(cuenta, dispositivo.destino, {
            titulo,
            cuerpo: texto,
            ruta,
            origen,
          }),
        ),
      );

      resultados.forEach((resultado, indice) => {
        if (resultado === 'enviado') enviados += 1;
        else if (resultado === 'muerto') muertos.push(lote[indice].id);
      });
    }
  }

  if (muertos.length > 0) {
    await admin.from('dispositivos').delete().in('id', muertos);
  }

  const fallidos = todos.length - enviados;
  await admin.from('avisos').update({ enviados, fallidos }).eq('id', aviso.id);

  return responder({
    enviados,
    fallidos,
    dispositivosBorrados: muertos.length,
    total: todos.length,
  });
});
