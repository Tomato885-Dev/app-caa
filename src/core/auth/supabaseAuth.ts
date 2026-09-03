import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@/core/types';

/* ============================================================================
   ACCESO CONTRA EL SERVIDOR
   ----------------------------------------------------------------------------
   Las mismas cuatro operaciones que ya existían —comprobar el correo, crear la
   cuenta, confirmar el código y entrar— pero resueltas por Supabase.

   QUÉ CAMBIA RESPECTO DEL MODO SIN SERVIDOR
     · La contraseña deja de vivir en el navegador. La guarda Supabase, cifrada,
       y la app nunca la ve ni la almacena.
     · El código de verificación llega POR CORREO de verdad, no en pantalla.
     · La sesión vale en cualquier dispositivo, no solo donde se registró.
     · La nómina se consulta con una pregunta de sí o no: la lista de los 400
       alumnos no sale nunca del servidor.

   QUIÉN DECIDE QUÉ
   Nada de esto es una promesa del código del teléfono. Quien no esté en la
   nómina no obtiene perfil, y sin perfil la base de datos le rechaza cualquier
   lectura o escritura, por mucho que manipule la aplicación.
   ========================================================================== */

/** La nómina no se lee: se le pregunta por un correo concreto. */
export async function estaEnLaNomina(
  client: SupabaseClient,
  email: string,
): Promise<boolean> {
  const { data, error } = await client.rpc('puede_registrarse', { p_correo: email });
  if (error) throw new Error(`No se pudo comprobar la nómina: ${error.message}`);
  return data === true;
}

/**
 * Crea la cuenta y pide el envío del código de verificación.
 * El perfil lo arma la propia base de datos al confirmarse, tomando el nombre
 * y el curso de la nómina: no se los pedimos al estudiante ni se los creemos.
 */
export async function registrar(
  client: SupabaseClient,
  email: string,
  password: string,
): Promise<void> {
  const { error } = await client.auth.signUp({ email, password });
  if (!error) return;

  // Supabase responde en inglés; se traduce lo que el estudiante puede causar.
  if (/already registered|already exists/i.test(error.message)) {
    throw new Error('Esta cuenta ya está activada. Inicia sesión con tu contraseña.');
  }
  if (/password/i.test(error.message)) {
    throw new Error('Esa contraseña no cumple los requisitos mínimos.');
  }
  throw new Error(`No fue posible crear la cuenta: ${error.message}`);
}

/** Comprueba el código de 6 dígitos que llegó al correo. */
export async function confirmarCodigo(
  client: SupabaseClient,
  email: string,
  code: string,
): Promise<void> {
  const { error } = await client.auth.verifyOtp({ email, token: code, type: 'signup' });
  if (!error) return;

  /* El servidor devuelve el MISMO mensaje para un código equivocado y para uno
     vencido ("Token has expired or is invalid"), así que separarlos aquí sería
     inventar una precisión que no tenemos: diría "venció" ante un código mal
     copiado y mandaría a pedir otro sin necesidad. */
  if (/expired|invalid/i.test(error.message)) {
    throw new Error(
      'Ese código no sirve: puede estar mal copiado o haber vencido. ' +
        'Revísalo, y si no resulta pide uno nuevo.',
    );
  }
  throw new Error(`No fue posible comprobar el código: ${error.message}`);
}

/** Vuelve a enviar el código al correo. */
export async function reenviarCodigo(client: SupabaseClient, email: string): Promise<void> {
  const { error } = await client.auth.resend({ type: 'signup', email });
  if (!error) return;

  if (/security purposes|rate/i.test(error.message)) {
    throw new Error('Espera unos segundos antes de pedir otro código.');
  }
  throw new Error(`No fue posible enviar el código: ${error.message}`);
}

export async function entrar(
  client: SupabaseClient,
  email: string,
  password: string,
): Promise<void> {
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (!error) return;

  if (/not confirmed/i.test(error.message)) {
    throw new Error('Tu cuenta está a medio activar: falta escribir el código del correo.');
  }
  // Mismo mensaje para correo y clave equivocados: no confirma cuáles existen.
  if (/invalid login credentials/i.test(error.message)) {
    throw new Error('Correo o contraseña incorrectos.');
  }
  throw new Error(`No fue posible iniciar sesión: ${error.message}`);
}

export async function salir(client: SupabaseClient): Promise<void> {
  await client.auth.signOut();
}

export async function cambiarContrasena(
  client: SupabaseClient,
  nueva: string,
): Promise<void> {
  const { error } = await client.auth.updateUser({ password: nueva });
  if (error) throw new Error(`No fue posible cambiar la contraseña: ${error.message}`);
}

/**
 * El perfil de quien tiene la sesión abierta.
 *
 * Devuelve `null` cuando la cuenta existe pero no tiene perfil: pasa si el
 * correo no estaba en la nómina al registrarse. Es la última barrera, y la
 * pone la base de datos, no la aplicación.
 */
export async function perfilActual(client: SupabaseClient): Promise<User | null> {
  const { data: sesion } = await client.auth.getUser();
  if (!sesion.user) return null;

  const { data, error } = await client
    .from('perfiles')
    .select('*')
    .eq('id', sesion.user.id)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer tu perfil: ${error.message}`);
  if (!data) return null;

  const fila = data as {
    id: string;
    correo: string;
    nombre: string;
    curso: string;
    rol: User['role'];
    telefono: string | null;
    oculto: boolean;
    activo: boolean;
    creado_en: string;
    editado_en: string;
  };

  return {
    id: fila.id,
    email: fila.correo,
    name: fila.nombre,
    grade: fila.curso,
    role: fila.rol,
    active: fila.activo,
    phone: fila.telefono ?? undefined,
    hideFromDirectory: fila.oculto,
    createdAt: fila.creado_en,
    updatedAt: fila.editado_en,
  };
}
