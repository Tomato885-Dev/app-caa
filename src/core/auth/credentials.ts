import type { ID } from '@/core/types';

/* ============================================================================
   CONTRASEÑAS
   ----------------------------------------------------------------------------
   Cada cuenta de la nómina se "activa" cuando su dueño crea una contraseña
   (pantalla de registro). Desde ese momento el acceso exige correo + clave.

   CÓMO SE GUARDA
   Nunca se guarda la contraseña. Se guarda el resultado de PBKDF2-SHA256 con
   una sal aleatoria distinta por cuenta, usando la Web Crypto del navegador.
   Aunque alguien abra el almacenamiento local, no puede leer las claves.

   POR QUÉ VIVE FUERA DE `core/data`
   Las credenciales no son contenido: no se siembran, no se exportan y NO se
   borran al pulsar "Restaurar contenido de ejemplo" ni al subir la versión de
   la nómina. Por eso tienen su propio almacenamiento y no una colección más
   del `DataProvider`.

   ⚠️ ALCANCE ACTUAL
   Todo esto ocurre en el navegador, así que la contraseña vale solo en el
   dispositivo donde se creó: quien entre desde otro teléfono deberá
   registrarse otra vez. Al montar el servidor, esta misma interfaz
   (`hasPassword` / `setPassword` / `verifyPassword`) pasa a llamar a la API y
   el resto de la aplicación no cambia.
   ========================================================================== */

const STORAGE_KEY = 'appcaa:v1:credentials';

/**
 * Vueltas del derivado. Cuanto más alto, más caro es probar claves a la
 * fuerza bruta. Se guarda dentro de cada registro para poder subirlo en el
 * futuro sin invalidar las contraseñas ya creadas.
 */
const ITERATIONS = 310_000;
const HASH = 'SHA-256';
const KEY_BITS = 256;
const SALT_BYTES = 16;

interface CredentialRecord {
  userId: ID;
  /** Sal aleatoria en base64. Única por cuenta. */
  salt: string;
  /** Resultado del derivado en base64. */
  hash: string;
  iterations: number;
  algorithm: string;
  createdAt: string;
  updatedAt: string;
}

/** El navegador solo expone Web Crypto en contextos seguros (https/localhost). */
function subtle(): SubtleCrypto {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error(
      'Este navegador no permite cifrar contraseñas de forma segura. Abre la aplicación con https o desde localhost.',
    );
  }
  return crypto.subtle;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function readAll(): CredentialRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CredentialRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: CredentialRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* modo privado o cuota llena */
  }
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const material = await subtle().importKey(
    'raw',
    new TextEncoder().encode(password.normalize('NFKC')),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await subtle().deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: HASH },
    material,
    KEY_BITS,
  );
  return toBase64(new Uint8Array(bits));
}

/** Comparación de tiempo constante: no delata cuánto coincide el derivado. */
function equals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** ¿Esta cuenta ya fue activada con una contraseña? */
export function hasPassword(userId: ID): boolean {
  return readAll().some((row) => row.userId === userId);
}

/** Crea o reemplaza la contraseña de una cuenta. */
export async function setPassword(userId: ID, password: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt, ITERATIONS);
  const now = new Date().toISOString();
  const rows = readAll();
  const existing = rows.find((row) => row.userId === userId);

  const record: CredentialRecord = {
    userId,
    salt: toBase64(salt),
    hash,
    iterations: ITERATIONS,
    algorithm: `PBKDF2-${HASH}`,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  writeAll([record, ...rows.filter((row) => row.userId !== userId)]);
}

/** Comprueba una contraseña contra la guardada. */
export async function verifyPassword(userId: ID, password: string): Promise<boolean> {
  const record = readAll().find((row) => row.userId === userId);
  if (!record) return false;
  const candidate = await derive(password, fromBase64(record.salt), record.iterations);
  return equals(candidate, record.hash);
}

/**
 * Borra la contraseña de una cuenta: la deja lista para volver a registrarse.
 * Es el "restablecer contraseña" que usa la administración cuando alguien la
 * olvida, ya que sin servidor no hay envío de correos de recuperación.
 */
export function clearPassword(userId: ID): void {
  writeAll(readAll().filter((row) => row.userId !== userId));
}

/** Cuántas cuentas se han activado en este dispositivo. */
export function activatedCount(): number {
  return readAll().length;
}
