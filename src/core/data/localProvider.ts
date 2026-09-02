import type { BaseEntity, ID } from '@/core/types';
import { seedData } from '@/content/seed';
import {
  COLLECTIONS,
  type CollectionName,
  type CreateInput,
  type DataProvider,
  type Repository,
} from './repository';

/* ============================================================================
   PROVEEDOR LOCAL (localStorage)
   ----------------------------------------------------------------------------
   Implementación de referencia del contrato `DataProvider`. Persiste en el
   navegador y se siembra con el contenido de `src/content/seed`.

   Sirve para desarrollar y demostrar la app completa sin backend. Cuando el
   proyecto cuente con servidor, se agrega un `supabaseProvider.ts` que
   implemente la misma interfaz y se cambia una línea en `index.ts`.
   ========================================================================== */

const STORAGE_PREFIX = 'appcaa:v1:';
/* Huella del contenido recién sembrado: `id → updatedAt` por colección.
   Permite saber después qué se editó desde la app, sin volver a mirar el
   contenido inicial (que usa fechas relativas y cambia en cada carga). */
const SIGNATURE_KEY = `${STORAGE_PREFIX}seedSignature`;
/** Pequeña latencia simulada: mantiene honestos los estados de carga. */
const SIMULATED_LATENCY_MS = 90;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));
}

function nowISO(): string {
  return new Date().toISOString();
}

export function createId(prefix = 'id'): ID {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}

function readCollection<T>(name: CollectionName): T[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + name);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    // Almacenamiento corrupto o no disponible: se degrada a vacío en vez de romper.
    return [];
  }
}

function writeCollection<T>(name: CollectionName, rows: T[]): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + name, JSON.stringify(rows));
  } catch {
    /* modo privado o cuota llena: la sesión sigue funcionando en memoria */
  }
}

class LocalRepository<T extends BaseEntity> implements Repository<T> {
  constructor(
    private readonly collection: CollectionName,
    private readonly idPrefix: string,
  ) {}

  async list(): Promise<T[]> {
    return delay(readCollection<T>(this.collection));
  }

  async get(id: ID): Promise<T | null> {
    const found = readCollection<T>(this.collection).find((row) => row.id === id) ?? null;
    return delay(found);
  }

  async create(input: CreateInput<T>): Promise<T> {
    const rows = readCollection<T>(this.collection);
    const timestamp = nowISO();
    const entity = {
      ...input,
      id: createId(this.idPrefix),
      createdAt: timestamp,
      updatedAt: timestamp,
    } as T;
    writeCollection(this.collection, [entity, ...rows]);
    return delay(entity);
  }

  async update(id: ID, patch: Partial<T>): Promise<T> {
    const rows = readCollection<T>(this.collection);
    const index = rows.findIndex((row) => row.id === id);
    if (index === -1) throw new Error(`No se encontró el registro ${id} en ${this.collection}.`);

    const updated = { ...rows[index], ...patch, id, updatedAt: nowISO() } as T;
    rows[index] = updated;
    writeCollection(this.collection, rows);
    return delay(updated);
  }

  async remove(id: ID): Promise<void> {
    const rows = readCollection<T>(this.collection).filter((row) => row.id !== id);
    writeCollection(this.collection, rows);
    await delay(undefined);
  }
}

export type SeedSignature = Record<string, Record<string, string>>;

/** Escribe el contenido inicial en todas las colecciones y guarda su huella. */
function seedAll(): void {
  const signature: SeedSignature = {};

  for (const name of COLLECTIONS) {
    const rows = (seedData[name] ?? []) as BaseEntity[];
    writeCollection<unknown>(name, rows);
    signature[name] = Object.fromEntries(rows.map((row) => [row.id, row.updatedAt]));
  }

  try {
    localStorage.setItem(SIGNATURE_KEY, JSON.stringify(signature));
  } catch {
    /* sin espacio: se pierde la detección de cambios, no los datos */
  }
  localStorage.setItem(`${STORAGE_PREFIX}seeded`, seedData.version);
}

/**
 * Huella del último sembrado, o `null` si no se registró.
 * Con `null` no es posible saber qué cambió, y quien pregunte debe decirlo en
 * vez de inventar un resultado.
 */
export function readSeedSignature(): SeedSignature | null {
  try {
    const raw = localStorage.getItem(SIGNATURE_KEY);
    return raw ? (JSON.parse(raw) as SeedSignature) : null;
  } catch {
    return null;
  }
}

/**
 * Rellena las colecciones que aún no existen, sin tocar las que ya tienen
 * datos. Es lo que ocurre al incorporar un módulo nuevo: su colección aparece
 * con su contenido inicial y el trabajo ya cargado se mantiene intacto.
 */
function seedMissing(): void {
  const signature = readSeedSignature() ?? {};
  let changed = false;

  for (const name of COLLECTIONS) {
    if (localStorage.getItem(STORAGE_PREFIX + name) !== null) continue;

    const rows = (seedData[name] ?? []) as BaseEntity[];
    writeCollection<unknown>(name, rows);
    signature[name] = Object.fromEntries(rows.map((row) => [row.id, row.updatedAt]));
    changed = true;
  }

  if (!changed) return;
  try {
    localStorage.setItem(SIGNATURE_KEY, JSON.stringify(signature));
  } catch {
    /* sin espacio: se pierde la detección de cambios, no los datos */
  }
}

/**
 * Prepara la base local al arrancar:
 * · La primera vez, o al cambiar la versión del contenido, siembra todo.
 * · Si no, solo completa las colecciones que falten (módulos nuevos).
 */
export function ensureSeeded(): void {
  try {
    if (localStorage.getItem(`${STORAGE_PREFIX}seeded`) !== seedData.version) seedAll();
    else seedMissing();
  } catch {
    /* sin almacenamiento disponible: la app funciona en modo lectura */
  }
}

export const localProvider: DataProvider = {
  users: new LocalRepository('users', 'usr'),
  news: new LocalRepository('news', 'new'),
  events: new LocalRepository('events', 'evt'),
  announcements: new LocalRepository('announcements', 'com'),
  benefits: new LocalRepository('benefits', 'ben'),
  sportsResults: new LocalRepository('sportsResults', 'res'),
  projects: new LocalRepository('projects', 'prj'),
  reports: new LocalRepository('reports', 'rpt'),

  async reset() {
    seedAll();
  },
};
