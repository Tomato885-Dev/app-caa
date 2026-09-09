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

/** Qué pasó al intentar registrarse. */
export type ResultadoRegistro = 'creada' | 'reenviada';

/**
 * Crea la cuenta y pide el envío del código de verificación.
 * El perfil lo arma la propia base de datos al confirmarse, tomando el nombre
 * y el curso de la nómina: no se los pedimos al estudiante ni se los creemos.
 *
 * SI LA CUENTA YA EXISTE PERO NUNCA SE CONFIRMÓ
 * Devuelve 'reenviada' después de mandar un código nuevo, en vez de fallar.
 * Quien escribió su contraseña y no alcanzó a poner el código —se le venció,
 * cerró la pestaña, el correo cayó en spam— vuelve a "Activar mi cuenta" y se
 * encuentra con que su cuenta "ya existe" y no puede seguir. Quedaba encerrado
 * sin haber hecho nada malo, y solo salía de ahí borrándole la cuenta a mano.
 *
 * Solo se avisa de que hay que iniciar sesión cuando la cuenta está de verdad
 * confirmada, que es el único caso en que ese consejo sirve.
 */
export async function registrar(
  client: SupabaseClient,
  email: string,
  password: string,
): Promise<ResultadoRegistro> {
  const { error } = await client.auth.signUp({ email, password });
  if (!error) return 'creada';

  // Supabase responde en inglés; se traduce lo que el estudiante puede causar.
  if (/password/i.test(error.message)) {
    throw new Error('Esa contraseña no cumple los requisitos mínimos.');
  }

  if (/already registered|already exists/i.test(error.message)) {
    /* Pedir otro código es a la vez la pregunta y la solución: solo funciona
       si la cuenta existe y está sin confirmar, que es justo cuando queremos
       dejarla continuar. */
    const { error: fallo } = await client.auth.resend({ type: 'signup', email });
    if (!fallo) return 'reenviada';

    if (/already confirmed|already been confirmed/i.test(fallo.message)) {
      throw new Error('Esta cuenta ya está activada. Inicia sesión con tu contraseña.');
    }
    if (/security purposes|rate limit|too many/i.test(fallo.message)) {
      throw new Error('Espera un minuto antes de volver a intentarlo.');
    }
    throw new Error('Esta cuenta ya está activada. Inicia sesión con tu contraseña.');
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

/* ----------------------------------------------------------------------------
   RECUPERAR LA CONTRASEÑA
   ----------------------------------------------------------------------------
   Mismo camino que activar la cuenta: llega un código al correo, se escribe, y
   recién ahí se elige la contraseña nueva. Se eligió el código y no el enlace
   porque el enlace obliga a volver desde el correo al navegador correcto, y en
   el teléfono eso termina abriendo otra aplicación a medio camino.

   NO revela si el correo existe. Pedir un código para una cuenta inexistente
   responde igual que para una real: de lo contrario, cualquiera podría usar
   esta pantalla para averiguar quién tiene cuenta.
   -------------------------------------------------------------------------- */

/** Manda un código de recuperación al correo. */
export async function pedirRecuperacion(client: SupabaseClient, email: string): Promise<void> {
  const { error } = await client.auth.resetPasswordForEmail(email);
  if (!error) return;

  if (/security purposes|rate limit|too many/i.test(error.message)) {
    throw new Error('Espera un minuto antes de pedir otro código.');
  }
  throw new Error(`No fue posible enviar el código: ${error.message}`);
}

/**
 * Comprueba el código de recuperación. Al acertar deja la sesión abierta, que
 * es lo que permite cambiar la contraseña en el paso siguiente.
 */
export async function confirmarRecuperacion(
  client: SupabaseClient,
  email: string,
  code: string,
): Promise<void> {
  const { error } = await client.auth.verifyOtp({ email, token: code, type: 'recovery' });
  if (!error) return;

  if (/expired|invalid/i.test(error.message)) {
    throw new Error(
      'Ese código no sirve: puede estar mal copiado o haber vencido. ' +
        'Revísalo, y si no resulta pide uno nuevo.',
    );
  }
  throw new Error(`No fue posible comprobar el código: ${error.message}`);
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

/* ----------------------------------------------------------------------------
   BORRAR LA PROPIA CUENTA
   Lo hace una funcion del servidor, porque eliminar unas credenciales necesita
   la llave de administracion y esa llave no puede viajar dentro de la
   aplicacion. Aqui solo se pide; alla se comprueba quien pide.
   -------------------------------------------------------------------------- */
export async function eliminarCuenta(cliente: SupabaseClient): Promise<void> {
  const { data, error } = await cliente.functions.invoke('borrar-cuenta', { body: {} });

  /* Un error de funcion trae el motivo en el cuerpo de la respuesta, no en el
     mensaje. Sin leerlo, el unico administrador que quedara veria un
     "Edge Function returned a non-2xx status code" en vez de saber que tiene
     que nombrar a alguien antes. */
  if (error) {
    let motivo = error.message;
    const respuesta = (error as { context?: Response }).context;
    if (respuesta && typeof respuesta.json === 'function') {
      try {
        const cuerpo = await respuesta.json();
        if (cuerpo?.error) motivo = cuerpo.error;
      } catch {
        /* Se queda con el mensaje generico. */
      }
    }
    throw new Error(motivo);
  }

  if (data && (data as { error?: string }).error) {
    throw new Error((data as { error: string }).error);
  }
}
