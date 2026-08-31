import { appConfig } from '@/config/app.config';

/* ============================================================================
   ENVÍO DEL CORREO DE VERIFICACIÓN
   ----------------------------------------------------------------------------
   Un navegador NO puede enviar correos por sí solo: hace falta un servicio que
   lo haga. Por eso el envío está aislado detrás de esta interfaz, y el resto de
   la aplicación no sabe ni le importa quién manda el mail.

   HAY DOS MODOS, y los decide `appConfig.auth.verification.endpoint`:

   • VACÍO  → modo desarrollo. No se envía nada: el código aparece en pantalla
              y en la consola del navegador. Sirve para probar el flujo entero
              sin montar nada.

   • CON URL → modo real. Se hace un POST con el correo, el nombre y el código,
              y el servicio del otro lado envía el mail.

   EL CONTRATO DEL ENDPOINT
   Recibe un JSON así:

     { "to": "alumno@verbo.cl", "name": "Nombre Apellido",
       "code": "418302", "expiresInMinutes": 10 }

   y responde 200 si logró enviarlo. Cualquier otra respuesta se trata como
   error y la app se lo dice al estudiante.

   En `docs/servidor-de-correo/` hay un servidor de ejemplo listo para usar.
   ========================================================================== */

export interface VerificationMessage {
  to: string;
  name: string;
  code: string;
  expiresInMinutes: number;
}

export class MailError extends Error {}

/** ¿Hay un servicio de correo configurado? */
export function mailerIsConfigured(): boolean {
  return appConfig.auth.verification.endpoint.trim().length > 0;
}

/**
 * Envía el código. En modo desarrollo no envía nada y devuelve `false`, para
 * que la pantalla sepa que debe mostrar el código en vez de decir "revisa tu
 * correo".
 *
 * @returns `true` si el correo salió de verdad.
 */
export async function sendVerificationCode(message: VerificationMessage): Promise<boolean> {
  const endpoint = appConfig.auth.verification.endpoint.trim();

  if (!endpoint) {
    // Modo desarrollo: el código queda a la vista de quien está probando.
    console.info(
      `[App CAA] Modo desarrollo: no se envió correo. Código para ${message.to}: ${message.code}`,
    );
    return false;
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  } catch {
    // Sin red, servidor caído o CORS mal configurado.
    throw new MailError(
      'No pudimos contactar al servicio de correo. Revisa tu conexión e inténtalo de nuevo.',
    );
  }

  if (!response.ok) {
    throw new MailError(
      'No pudimos enviar el correo de verificación. Avísale al Centro de Alumnos.',
    );
  }
  return true;
}
