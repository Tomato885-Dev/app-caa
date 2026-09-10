import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { supabase, usingServer } from '@/core/data';
import type { EstadoPush } from './push';

/* ============================================================================
   AVISOS EN LA APP INSTALADA
   ----------------------------------------------------------------------------
   Dentro de la app de Google Play o de App Store, el aviso NO viaja por Web
   Push. Un navegador metido dentro de una app no tiene permiso para recibir
   notificaciones del sistema; quien las recibe es la app, y las entrega el
   propio sistema operativo. Por eso hay dos caminos y no uno: `push.ts` decide
   cuál usar, y este archivo es el de la app instalada.

   POR QUÉ FIREBASE Y NO APPLE DIRECTAMENTE
   Apple y Google tienen cada uno su servicio de notificaciones, con
   credenciales distintas y formas distintas de firmar el envío. Firebase habla
   con los dos: se le entrega el aviso una sola vez y él se encarga de pasarle
   a Apple lo que le toca. A cambio hay que subirle a Firebase una llave de
   Apple, y eso es todo.

   Resultado: un único camino de envío en el servidor, en vez de dos que hay
   que mantener en paralelo y que fallan por motivos distintos.

   EL IDENTIFICADOR CAMBIA SOLO
   El token que entrega el teléfono no es para siempre: el sistema lo renueva
   cuando quiere. Si se renueva y nadie avisa, el registro guardado queda
   apuntando a un aparato que ya no responde y la persona deja de recibir
   avisos sin enterarse. Por eso se escucha `tokenReceived` y se reemplaza el
   registro viejo por el nuevo.
   ========================================================================== */

/** Dónde se guarda el último token conocido de ESTE aparato, para poder
 *  borrar el registro viejo cuando el sistema lo renueve. */
const RECUERDO = 'avisos:token';

export function esNativo(): boolean {
  return Capacitor.isNativePlatform();
}

function canal(): 'android' | 'ios' {
  return Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
}

function describir(): string {
  return canal() === 'ios' ? 'iPhone · app' : 'Android · app';
}

function recordar(token: string | null) {
  try {
    if (token) localStorage.setItem(RECUERDO, token);
    else localStorage.removeItem(RECUERDO);
  } catch {
    // Sin almacenamiento local se pierde solo la limpieza del registro viejo,
    // que el servidor termina borrando igual al recibir "ya no existe".
  }
}

/** Deja anotado este aparato para que el servidor sepa a dónde escribirle. */
async function guardar(token: string): Promise<void> {
  if (!supabase) return;

  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) throw new Error('Hay que iniciar sesión para activar los avisos.');

  /* `destino` es único en la tabla: reinstalar la app o volver a activar el
     interruptor actualiza el registro en vez de duplicarlo, y así nadie
     recibe el mismo aviso dos veces. */
  const { error } = await supabase.from('dispositivos').upsert(
    {
      usuario: sesion.user.id,
      canal: canal(),
      destino: token,
      descripcion: describir(),
    },
    { onConflict: 'destino' },
  );

  if (error) throw new Error(`No se pudo activar: ${error.message}`);
  recordar(token);
}

export async function estadoNativo(): Promise<EstadoPush> {
  if (!usingServer || !supabase) return 'sin-servidor';

  try {
    const { receive } = await FirebaseMessaging.checkPermissions();
    if (receive === 'denied') return 'bloqueado';
    if (receive !== 'granted') return 'inactivo';

    /* Con el permiso concedido el token se puede pedir sin molestar a nadie.
       Que exista no basta: hay que comprobar que el servidor lo tenga, porque
       quien desactivó los avisos conserva el permiso del sistema. */
    const { token } = await FirebaseMessaging.getToken();
    if (!token) return 'inactivo';

    const { data } = await supabase
      .from('dispositivos')
      .select('id')
      .eq('destino', token)
      .maybeSingle();

    return data ? 'activo' : 'inactivo';
  } catch {
    /* Si Firebase no está configurado en esta compilación, el interruptor
       tiene que seguir apareciendo apagado y no romper el perfil entero. */
    return 'inactivo';
  }
}

export async function activarNativo(): Promise<EstadoPush> {
  if (!usingServer || !supabase) return 'sin-servidor';

  const { receive } = await FirebaseMessaging.requestPermissions();
  if (receive !== 'granted') return receive === 'denied' ? 'bloqueado' : 'inactivo';

  const { token } = await FirebaseMessaging.getToken();
  if (!token) throw new Error('El teléfono no entregó un identificador para los avisos.');

  await guardar(token);
  return 'activo';
}

export async function desactivarNativo(): Promise<EstadoPush> {
  try {
    const { token } = await FirebaseMessaging.getToken();
    // Primero el servidor: borrarlo solo aquí lo dejaría escribiéndole a un
    // aparato que ya no quiere saber nada.
    if (token && usingServer && supabase) {
      await supabase.from('dispositivos').delete().eq('destino', token);
    }
  } catch {
    // Sin token no hay nada que borrar en el servidor.
  }

  await FirebaseMessaging.deleteToken();
  recordar(null);
  return 'inactivo';
}

/**
 * Se engancha una vez al arrancar la app instalada.
 * `navegar` lleva a la pantalla que indique el aviso al tocarlo.
 */
export function escucharNativo(navegar: (ruta: string) => void): void {
  if (!esNativo()) return;

  /* El sistema renovó el identificador. Solo importa a quien ya tenía los
     avisos activados: si nunca los activó, no hay registro que mover y pedir
     uno nuevo sería activárselos sin permiso. */
  void FirebaseMessaging.addListener('tokenReceived', ({ token }) => {
    void (async () => {
      let anterior: string | null = null;
      try {
        anterior = localStorage.getItem(RECUERDO);
      } catch {
        anterior = null;
      }
      if (!anterior || anterior === token || !usingServer || !supabase) return;

      await supabase.from('dispositivos').delete().eq('destino', anterior);
      await guardar(token);
    })();
  });

  /* Alguien tocó la notificación. La ruta viaja en el aviso, y se comprueba
     que sea una ruta interna: un aviso no debe poder mandar a nadie fuera de
     la aplicación. */
  void FirebaseMessaging.addListener('notificationActionPerformed', (evento) => {
    const datos = evento.notification?.data as { ruta?: unknown } | undefined;
    const ruta = datos?.ruta;
    if (typeof ruta === 'string' && ruta.startsWith('/') && !ruta.startsWith('//')) {
      navegar(ruta);
    }
  });
}
