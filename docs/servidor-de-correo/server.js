/* ============================================================================
   SERVIDOR DE CORREO · App CAA
   ----------------------------------------------------------------------------
   Recibe el código que genera la aplicación y lo envía por Gmail.
   Es lo único que la app no puede hacer sola: un navegador no envía correos.

   CÓMO SE USA
   Está explicado paso a paso en el README de esta misma carpeta.

   ⚠️ LÍMITE DE ESTA VERSIÓN
   Este servidor envía el código que le manda la aplicación. Como el código se
   genera en el navegador, alguien que sepa programar podría leerlo antes de
   que llegue el correo. Frena el caso real —un alumno activando la cuenta de
   otro— pero no es una barrera criptográfica.

   La versión definitiva genera el código AQUÍ, lo guarda aquí y aquí lo
   comprueba; el navegador solo envía "este es el correo" y "este es el código
   que escribí". Está anotado más abajo dónde iría ese cambio.
   ========================================================================== */

import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const PORT = process.env.PORT || 3001;

/* Origen permitido: SOLO la dirección donde vive la app. Sin esto, cualquier
   página de internet podría usar este servidor para mandar correos. */
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

/* Dominio institucional. El servidor se niega a escribirle a cualquier otro,
   así que no se puede usar para mandar correos a desconocidos. */
const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN || 'verbo.cl';

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error(
    'Faltan GMAIL_USER y GMAIL_APP_PASSWORD. Revisa el README de esta carpeta.',
  );
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
});

const app = express();
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: '8kb' }));

/* Freno simple por dirección de correo: como mucho 5 envíos por hora. Evita
   que alguien use el servidor para inundar una bandeja de entrada. */
const sends = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function tooManyRequests(email) {
  const now = Date.now();
  const recent = (sends.get(email) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  sends.set(email, [...recent, now]);
  return false;
}

app.post('/enviar-codigo', async (request, response) => {
  const { to, name, code, expiresInMinutes } = request.body || {};

  if (typeof to !== 'string' || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return response.status(400).json({ error: 'Petición mal formada.' });
  }
  if (!to.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
    return response.status(403).json({ error: 'Dominio no permitido.' });
  }
  if (tooManyRequests(to.toLowerCase())) {
    return response.status(429).json({ error: 'Demasiados envíos. Intenta más tarde.' });
  }

  /* AQUÍ iría la versión definitiva: en vez de usar el `code` que llega,
     generarlo en este servidor, guardarlo con su vencimiento y exponer un
     segundo endpoint `/verificar-codigo` que lo compruebe. */

  const minutes = Number(expiresInMinutes) || 10;
  const saludo = name ? `Hola ${name}:` : 'Hola:';

  try {
    await transporter.sendMail({
      from: `"Centro de Alumnos" <${GMAIL_USER}>`,
      to,
      subject: `Tu código de verificación: ${code}`,
      text: `${saludo}

Tu código para activar tu cuenta en la app del Centro de Alumnos es:

${code}

Vence en ${minutes} minutos. Si no fuiste tú quien lo pidió, ignora este correo
y avísale al Centro de Alumnos.`,
      html: `
        <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a211d">
          <p style="font-size:15px;margin:0 0 16px">${saludo}</p>
          <p style="font-size:15px;line-height:1.6;margin:0 0 20px">
            Tu código para activar tu cuenta en la app del Centro de Alumnos es:
          </p>
          <p style="font-size:34px;font-weight:800;letter-spacing:8px;text-align:center;
                    background:#ebf5f0;color:#11673c;border-radius:12px;padding:18px;margin:0 0 20px">
            ${code}
          </p>
          <p style="font-size:13px;line-height:1.6;color:#5b665f;margin:0">
            Vence en ${minutes} minutos. Si no fuiste tú quien lo pidió, ignora este
            correo y avísale al Centro de Alumnos.
          </p>
        </div>`,
    });

    return response.json({ ok: true });
  } catch (error) {
    console.error('Fallo al enviar:', error.message);
    return response.status(502).json({ error: 'No se pudo enviar el correo.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de correo escuchando en http://localhost:${PORT}`);
  console.log(`Acepta peticiones desde: ${ALLOWED_ORIGIN}`);
  console.log(`Solo envía a direcciones @${ALLOWED_DOMAIN}`);
});
