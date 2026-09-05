import { supabase, usingServer } from '@/core/data';

/* ============================================================================
   NOTIFICACIONES
   ----------------------------------------------------------------------------
   Registrar el teléfono de alguien para que reciba avisos aunque tenga la app
   cerrada. Son tres pasos encadenados, y cualquiera puede fallar:

     1. el navegador registra el trabajador de segundo plano (`public/sw.js`),
     2. la persona concede el permiso, y
     3. el navegador entrega una dirección única que se guarda en el servidor.

   UN REGISTRO POR DISPOSITIVO, NO POR PERSONA
   Quien entra desde el teléfono y desde el computador aparece dos veces, y
   recibe el aviso en los dos. Es lo correcto: el permiso lo concede cada
   aparato por separado y no se puede trasladar.

   EL PERMISO NO SE PIDE SOLO
   Nunca al abrir la aplicación. Un navegador que pregunta apenas entras recibe
   un "no" casi automático, y ese "no" es difícil de revertir: hay que ir a la
   configuración del navegador. Se pide cuando la persona toca el interruptor,
   que es el único momento en que ya sabe qué está aceptando.
   ========================================================================== */

/** Llave pública VAPID. Viaja dentro de la app a propósito: identifica al
 *  servidor ante el navegador, y sin la privada no sirve para enviar nada. */
const VAPID_PUBLICA = 'BGb4RGT4-Ue3MxKUrqp2n_Zt0E-kIs7pzRqoiFcHe2WwQ39p70Dm3WCemju6xeYYit96-0VJ0w9ex1ooYngNT5g';

export type EstadoPush =
  /** El navegador no sabe hacer esto. */
  | 'no-soportado'
  /** Sabe, pero falta servidor donde guardar el registro. */
  | 'sin-servidor'
  /** Se puede activar: nunca se ha preguntado, o se preguntó y se aceptó. */
  | 'inactivo'
  /** Activado en este dispositivo. */
  | 'activo'
  /** La persona lo rechazó. Solo se revierte desde el navegador. */
  | 'bloqueado';

function base64UrlABytes(base64: string): Uint8Array {
  const relleno = '='.repeat((4 - (base64.length % 4)) % 4);
  const normal = (base64 + relleno).replace(/-/g, '+').replace(/_/g, '/');
  const binario = atob(normal);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

function bytesABase64Url(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binario = '';
  for (const byte of bytes) binario += String.fromCharCode(byte);
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** ¿Este navegador puede recibir notificaciones? */
export function soportaPush(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Nombre reconocible del aparato, para distinguirlo en una lista.
 * Se arma de lo que ya anuncia el navegador; no se lee nada del dispositivo.
 */
function describirDispositivo(): string {
  const ua = navigator.userAgent;
  const sistema = /iPhone|iPad|iPod/i.test(ua)
    ? 'iPhone'
    : /Android/i.test(ua)
      ? 'Android'
      : /Mac/i.test(ua)
        ? 'Mac'
        : /Windows/i.test(ua)
          ? 'Windows'
          : 'Dispositivo';
  const navegador = /Edg\//i.test(ua)
    ? 'Edge'
    : /Chrome\//i.test(ua)
      ? 'Chrome'
      : /Firefox\//i.test(ua)
        ? 'Firefox'
        : /Safari\//i.test(ua)
          ? 'Safari'
          : 'navegador';
  return `${sistema} · ${navegador}`;
}

/** Registra el trabajador de segundo plano. Es idempotente. */
async function registrarTrabajador(): Promise<ServiceWorkerRegistration> {
  /* La ruta depende de dónde esté servida la app: en GitHub Pages vive bajo
     /app-caa/, y un trabajador registrado en la raíz no tendría alcance sobre
     las páginas de la aplicación. */
  const base = import.meta.env.BASE_URL;
  return navigator.serviceWorker.register(`${base}sw.js`, { scope: base });
}

export async function estadoActual(): Promise<EstadoPush> {
  if (!soportaPush()) return 'no-soportado';
  if (!usingServer || !supabase) return 'sin-servidor';
  if (Notification.permission === 'denied') return 'bloqueado';

  const registro = await navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL);
  const suscripcion = await registro?.pushManager.getSubscription();
  return suscripcion ? 'activo' : 'inactivo';
}

/**
 * Activa las notificaciones en este dispositivo.
 * Devuelve el estado resultante; no lanza excepción si la persona dice que no,
 * porque negarse no es un error.
 */
export async function activar(): Promise<EstadoPush> {
  if (!soportaPush()) return 'no-soportado';
  if (!usingServer || !supabase) return 'sin-servidor';

  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') return permiso === 'denied' ? 'bloqueado' : 'inactivo';

  const registro = await registrarTrabajador();
  await navigator.serviceWorker.ready;

  const suscripcion = await registro.pushManager.subscribe({
    // Sin esto el navegador permitiría avisos silenciosos, y Chrome lo rechaza.
    userVisibleOnly: true,
    applicationServerKey: base64UrlABytes(VAPID_PUBLICA) as BufferSource,
  });

  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) throw new Error('Hay que iniciar sesión para activar los avisos.');

  /* `destino` es único en la tabla: si este mismo navegador ya estaba
     registrado —por ejemplo tras reinstalar la app— se actualiza en vez de
     duplicarse, y así nadie recibe el mismo aviso dos veces. */
  const { error } = await supabase.from('dispositivos').upsert(
    {
      usuario: sesion.user.id,
      canal: 'web',
      destino: suscripcion.endpoint,
      clave_p256: bytesABase64Url(suscripcion.getKey('p256dh')),
      clave_auth: bytesABase64Url(suscripcion.getKey('auth')),
      descripcion: describirDispositivo(),
    },
    { onConflict: 'destino' },
  );

  if (error) {
    // Si no se pudo guardar, se deshace: una suscripción que el servidor no
    // conoce solo sirve para que la persona crea que activó algo.
    await suscripcion.unsubscribe();
    throw new Error(`No se pudo activar: ${error.message}`);
  }

  return 'activo';
}

/** Desactiva las notificaciones en este dispositivo. */
export async function desactivar(): Promise<EstadoPush> {
  if (!soportaPush()) return 'no-soportado';

  const registro = await navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL);
  const suscripcion = await registro?.pushManager.getSubscription();

  if (suscripcion && usingServer && supabase) {
    // Primero el servidor: si se borra solo aquí, el servidor seguiría
    // enviando a una dirección muerta cada vez que se publique algo.
    await supabase.from('dispositivos').delete().eq('destino', suscripcion.endpoint);
  }
  await suscripcion?.unsubscribe();

  return 'inactivo';
}
