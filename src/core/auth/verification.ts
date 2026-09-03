import type { ID } from '@/core/types';

/* ============================================================================
   VERIFICACIÓN DEL CORREO
   ----------------------------------------------------------------------------
   Después de crear su contraseña, el estudiante recibe un código de 6 dígitos
   en su correo institucional y debe escribirlo para terminar de entrar. Sirve
   para comprobar que quien activó la cuenta es de verdad el dueño del correo,
   y no un compañero que se equivocó —o quiso equivocarse— de dirección.

   REGLAS
   • El código dura 10 minutos.
   • Se permiten 5 intentos; al sexto hay que pedir uno nuevo.
   • Entre un envío y el siguiente hay que esperar 60 segundos.
   • El código NO se guarda: se guarda su huella (SHA-256 con sal), igual que
     con las contraseñas. Ni abriendo el almacenamiento se puede leer.

   DÓNDE VIVE
   Junto a las contraseñas, fuera de `core/data`: no es contenido, así que no
   se borra al restaurar el contenido de ejemplo ni al actualizar la nómina.

   ⚠️ HASTA QUE HAYA SERVIDOR
   El código se genera y se comprueba en el navegador. Eso frena el caso real
   —un alumno activando la cuenta de otro— pero no a alguien que sepa abrir las
   herramientas de desarrollo. Cuando el envío pase por un servidor, la
   generación y la comprobación deben mudarse ahí también: esta misma interfaz
   (`createChallenge` / `checkCode`) pasa a llamar a la API y las pantallas no
   cambian.
   ========================================================================== */

const CHALLENGE_KEY = 'appcaa:v1:verification';
const VERIFIED_KEY = 'appcaa:v1:verified';

const CODE_LENGTH = 6;
export const CODE_TTL_MINUTES = 10;
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_SECONDS = 60;

interface Challenge {
  userId: ID;
  email: string;
  /** Huella del código en base64. El código en claro no se guarda nunca. */
  codeHash: string;
  salt: string;
  expiresAt: string;
  /** Intentos fallidos gastados. */
  attempts: number;
  /** Momento del último envío, para el tiempo de espera entre reenvíos. */
  sentAt: string;
}

interface VerifiedRecord {
  userId: ID;
  email: string;
  verifiedAt: string;
}

/* --- Almacenamiento --------------------------------------------------------- */

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, rows: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(rows));
  } catch {
    /* modo privado o cuota llena */
  }
}

/* --- Utilidades ------------------------------------------------------------- */

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** Código numérico sin sesgo: se descartan los valores que no reparten parejo. */
function generateCode(): string {
  const limit = 10 ** CODE_LENGTH;
  const ceiling = Math.floor(0xffffffff / limit) * limit;
  const buffer = new Uint32Array(1);

  let value = 0;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= ceiling);

  return String(value % limit).padStart(CODE_LENGTH, '0');
}

async function hashCode(code: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${code}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toBase64(new Uint8Array(digest));
}

function equals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Deja solo los dígitos: la gente pega el código con espacios o guiones.
 *
 * NO se recorta a seis. El código de este archivo tiene seis, pero cuando lo
 * genera el servidor su largo es configurable, y recortarlo lo invalidaría sin
 * que nada lo delatara: el error diría "código incorrecto" para un código que
 * la persona copió bien.
 */
export const CODE_MIN_LENGTH = CODE_LENGTH;

export function normalizeCode(input: string): string {
  return input.replace(/\D/g, '').slice(0, 12);
}

/* --- Estado verificado ------------------------------------------------------ */

/** ¿Esta cuenta ya comprobó su correo? */
export function isVerified(userId: ID): boolean {
  return read<VerifiedRecord>(VERIFIED_KEY).some((row) => row.userId === userId);
}

export function verifiedAt(userId: ID): string | null {
  return read<VerifiedRecord>(VERIFIED_KEY).find((row) => row.userId === userId)?.verifiedAt ?? null;
}

function markVerified(userId: ID, email: string): void {
  const rows = read<VerifiedRecord>(VERIFIED_KEY).filter((row) => row.userId !== userId);
  write(VERIFIED_KEY, [{ userId, email, verifiedAt: new Date().toISOString() }, ...rows]);
}

/** Quita la verificación y cualquier código pendiente. Lo usa el restablecer. */
export function clearVerification(userId: ID): void {
  write(
    VERIFIED_KEY,
    read<VerifiedRecord>(VERIFIED_KEY).filter((row) => row.userId !== userId),
  );
  discardChallenge(userId);
}

/* --- Código pendiente ------------------------------------------------------- */

export function getChallenge(userId: ID): Challenge | null {
  return read<Challenge>(CHALLENGE_KEY).find((row) => row.userId === userId) ?? null;
}

export function discardChallenge(userId: ID): void {
  write(
    CHALLENGE_KEY,
    read<Challenge>(CHALLENGE_KEY).filter((row) => row.userId !== userId),
  );
}

/** Segundos que faltan para poder pedir otro código. 0 si ya se puede. */
export function secondsUntilResend(userId: ID): number {
  const challenge = getChallenge(userId);
  if (!challenge) return 0;

  const elapsed = (Date.now() - new Date(challenge.sentAt).getTime()) / 1000;
  return Math.max(0, Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed));
}

/**
 * Crea un código nuevo y reemplaza el anterior.
 * Devuelve el código en claro: es la única vez que existe fuera de su huella,
 * y se usa para entregárselo al servicio de correo.
 */
export async function createChallenge(userId: ID, email: string): Promise<string> {
  const code = generateCode();
  const salt = toBase64(crypto.getRandomValues(new Uint8Array(12)));
  const now = Date.now();

  const challenge: Challenge = {
    userId,
    email,
    codeHash: await hashCode(code, salt),
    salt,
    expiresAt: new Date(now + CODE_TTL_MINUTES * 60_000).toISOString(),
    attempts: 0,
    sentAt: new Date(now).toISOString(),
  };

  const rows = read<Challenge>(CHALLENGE_KEY).filter((row) => row.userId !== userId);
  write(CHALLENGE_KEY, [challenge, ...rows]);
  return code;
}

export type CheckResult =
  | { status: 'ok' }
  | { status: 'missing' }
  | { status: 'expired' }
  | { status: 'exhausted' }
  | { status: 'wrong'; attemptsLeft: number };

/** Comprueba el código escrito y, si acierta, deja la cuenta verificada. */
export async function checkCode(userId: ID, input: string): Promise<CheckResult> {
  const challenge = getChallenge(userId);
  if (!challenge) return { status: 'missing' };

  if (Date.now() > new Date(challenge.expiresAt).getTime()) {
    discardChallenge(userId);
    return { status: 'expired' };
  }
  if (challenge.attempts >= MAX_ATTEMPTS) {
    return { status: 'exhausted' };
  }

  const candidate = await hashCode(normalizeCode(input), challenge.salt);

  if (equals(candidate, challenge.codeHash)) {
    markVerified(userId, challenge.email);
    discardChallenge(userId);
    return { status: 'ok' };
  }

  // Intento fallido: se descuenta y se guarda.
  const attempts = challenge.attempts + 1;
  const rows = read<Challenge>(CHALLENGE_KEY).map((row) =>
    row.userId === userId ? { ...row, attempts } : row,
  );
  write(CHALLENGE_KEY, rows);

  if (attempts >= MAX_ATTEMPTS) return { status: 'exhausted' };
  return { status: 'wrong', attemptsLeft: MAX_ATTEMPTS - attempts };
}
