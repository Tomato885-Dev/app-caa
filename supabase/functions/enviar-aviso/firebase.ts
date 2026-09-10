// @ts-nocheck — Lo ejecuta Deno en el servidor de Supabase, no la aplicación.

/* ============================================================================
   HABLAR CON FIREBASE
   ----------------------------------------------------------------------------
   Los teléfonos con la app instalada no reciben el aviso por Web Push, sino a
   través de Firebase, que a su vez se lo entrega a Google en Android y a Apple
   en iPhone. Este archivo es lo único que sabe cómo pedírselo.

   POR QUÉ NO ES UNA SIMPLE CLAVE
   Firebase tuvo durante años una "server key" que bastaba pegar en una
   cabecera. Google la retiró. Hoy hay que demostrar quién eres firmando un
   documento con una llave privada y cambiarlo por un permiso que dura una
   hora. Son treinta líneas más, pero es lo que hay.

   DE DÓNDE SALE LA LLAVE
   Del archivo JSON que entrega Firebase en Configuración → Cuentas de servicio
   → Generar nueva clave privada. Ese archivo entero se pega como el secreto
   FIREBASE_CUENTA_SERVICIO en Supabase.

   NO VA EN EL REPOSITORIO, NI EN LA APLICACIÓN, NI EN UN CORREO. Quien lo
   tenga puede mandarle una notificación a los 694 alumnos haciéndose pasar por
   el Centro de Alumnos, que es exactamente el motivo por el que la llave VAPID
   tampoco vive aquí.

   EL PERMISO SE REAPROVECHA
   Dura una hora y pedirlo cuesta una ida y vuelta a Google. Se guarda en
   memoria mientras el servidor siga en pie, así que un envío a 694 teléfonos
   lo pide una vez y no 694.
   ========================================================================== */

interface CuentaDeServicio {
  project_id: string;
  client_email: string;
  private_key: string;
}

let cuenta: CuentaDeServicio | null | undefined;
let permiso: { valor: string; expira: number } | null = null;

/** Devuelve la cuenta de servicio, o null si no está configurada. */
export function cuentaDeServicio(): CuentaDeServicio | null {
  if (cuenta !== undefined) return cuenta;

  const crudo = Deno.env.get('FIREBASE_CUENTA_SERVICIO');
  if (!crudo) {
    cuenta = null;
    return null;
  }

  try {
    const leido = JSON.parse(crudo);
    if (!leido.project_id || !leido.client_email || !leido.private_key) {
      console.error('FIREBASE_CUENTA_SERVICIO no tiene los campos esperados.');
      cuenta = null;
      return null;
    }
    cuenta = leido;
    return cuenta;
  } catch {
    console.error('FIREBASE_CUENTA_SERVICIO no es un JSON válido.');
    cuenta = null;
    return null;
  }
}

function aBase64Url(bytes: Uint8Array): string {
  let binario = '';
  for (const byte of bytes) binario += String.fromCharCode(byte);
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Saca los bytes de una llave privada en formato PEM. */
function bytesDelPem(pem: string): Uint8Array {
  const cuerpo = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');
  const binario = atob(cuerpo);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

/** Cambia la llave privada por un permiso de una hora para enviar avisos. */
async function permisoDeEnvio(datos: CuentaDeServicio): Promise<string> {
  const ahora = Math.floor(Date.now() / 1000);

  // Se renueva un minuto antes de tiempo: un permiso que caduca en medio de un
  // envío deja a la mitad de los teléfonos sin recibir nada.
  if (permiso && permiso.expira > ahora + 60) return permiso.valor;

  const cabecera = aBase64Url(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const carga = aBase64Url(
    new TextEncoder().encode(
      JSON.stringify({
        iss: datos.client_email,
        scope: 'https://www.googleapis.com/auth/firebase.messaging',
        aud: 'https://oauth2.googleapis.com/token',
        iat: ahora,
        exp: ahora + 3600,
      }),
    ),
  );

  const llave = await crypto.subtle.importKey(
    'pkcs8',
    bytesDelPem(datos.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const firma = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    llave,
    new TextEncoder().encode(`${cabecera}.${carga}`),
  );

  const respuesta = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${cabecera}.${carga}.${aBase64Url(new Uint8Array(firma))}`,
    }),
  });

  const cuerpo = await respuesta.json();
  if (!respuesta.ok || !cuerpo.access_token) {
    throw new Error(`Firebase rechazó la llave: ${cuerpo.error_description ?? respuesta.status}`);
  }

  permiso = { valor: cuerpo.access_token, expira: ahora + (cuerpo.expires_in ?? 3600) };
  return permiso.valor;
}

export type ResultadoEnvio = 'enviado' | 'muerto' | 'fallo';

/**
 * Manda un aviso a un teléfono.
 *
 * Devuelve 'muerto' solo cuando Firebase responde 404, que significa que ese
 * teléfono desinstaló la app o borró su registro. Cualquier otro error se
 * cuenta como 'fallo' y el registro se conserva: un error de formato en el
 * mensaje respondería 400 para TODOS, y tratarlo como muerte vaciaría la tabla
 * de dispositivos de una sola vez.
 */
export async function enviarPorFirebase(
  datos: CuentaDeServicio,
  token: string,
  aviso: { titulo: string; cuerpo: string; ruta: string; origen: string | null },
): Promise<ResultadoEnvio> {
  try {
    const acceso = await permisoDeEnvio(datos);

    const respuesta = await fetch(
      `https://fcm.googleapis.com/v1/projects/${datos.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${acceso}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token,
            /* `notification` es lo que el sistema dibuja solo, aunque la app
               esté cerrada. Sin esto el aviso solo llegaría con la app
               abierta, que es justo cuando no hace falta. */
            notification: { title: aviso.titulo, body: aviso.cuerpo },
            /* `data` viaja aparte y lo lee la app al tocarla, para abrir el
               comunicado en vez de la portada. Solo admite texto. */
            data: {
              ruta: aviso.ruta,
              origen: aviso.origen ?? '',
            },
            android: {
              priority: 'high',
              notification: {
                sound: 'default',
                /* Avisos del mismo contenido se reemplazan en vez de
                   apilarse, igual que en el navegador. */
                tag: aviso.origen ?? 'appcaa',
              },
            },
            apns: {
              payload: { aps: { sound: 'default' } },
            },
          },
        }),
      },
    );

    if (respuesta.ok) return 'enviado';
    if (respuesta.status === 404) return 'muerto';

    console.error(`Firebase respondió ${respuesta.status}: ${await respuesta.text()}`);
    return 'fallo';
  } catch (caught) {
    console.error(`No se pudo enviar por Firebase: ${caught}`);
    return 'fallo';
  }
}
