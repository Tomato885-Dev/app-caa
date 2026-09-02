import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { BaseEntity, ID } from '@/core/types';
import {
  COLLECTIONS,
  type CollectionName,
  type CreateInput,
  type DataProvider,
  type Repository,
} from './repository';

/* ============================================================================
   PROVEEDOR SUPABASE
   ----------------------------------------------------------------------------
   La misma interfaz que el proveedor local, pero contra la base de datos. Al
   cumplir el contrato `DataProvider`, la aplicación entera funciona igual sin
   enterarse del cambio: no hay una sola pantalla que sepa de dónde vienen los
   datos.

   CÓMO SE GUARDA
   Todo el contenido vive en una tabla `contenido` con tres columnas útiles:
   a qué colección pertenece, su id y el elemento completo como documento JSON.
   El porqué de esa forma está explicado en `supabase/01-esquema.sql`.

   QUIÉN PUEDE ESCRIBIR
   No lo decide este archivo, lo decide la base de datos. Aunque alguien
   modificara la aplicación en su navegador, Postgres rechaza la escritura si
   quien la pide no es moderador o administrador. La seguridad no depende de
   que el código del teléfono se porte bien.
   ========================================================================== */

const TABLA = 'contenido';

export function createSupabaseClient(url: string, anonKey: string): SupabaseClient {
  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // La sesión se guarda en el navegador de cada persona.
      storageKey: 'appcaa:v1:supabase',
    },
  });
}

function idFor(prefix: string): ID {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}

class SupabaseRepository<T extends BaseEntity> implements Repository<T> {
  constructor(
    private readonly client: SupabaseClient,
    private readonly collection: CollectionName,
    private readonly idPrefix: string,
  ) {}

  /**
   * Los errores se dejan subir tal cual. La aplicación ya distingue entre
   * "cargando", "sin datos" y "falló"; tragarse el fallo y devolver una lista
   * vacía haría que un problema de conexión pareciera contenido inexistente.
   */
  async list(): Promise<T[]> {
    const { data, error } = await this.client
      .from(TABLA)
      .select('datos')
      .eq('coleccion', this.collection);

    if (error) throw new Error(`No se pudo leer ${this.collection}: ${error.message}`);
    return (data ?? []).map((fila) => (fila as { datos: unknown }).datos as T);
  }

  async get(id: ID): Promise<T | null> {
    const { data, error } = await this.client
      .from(TABLA)
      .select('datos')
      .eq('coleccion', this.collection)
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`No se pudo leer ${this.collection}/${id}: ${error.message}`);
    return data ? ((data as { datos: unknown }).datos as T) : null;
  }

  async create(input: CreateInput<T>): Promise<T> {
    const timestamp = new Date().toISOString();
    const entity = {
      ...input,
      id: idFor(this.idPrefix),
      createdAt: timestamp,
      updatedAt: timestamp,
    } as T;

    const { error } = await this.client
      .from(TABLA)
      .insert({ coleccion: this.collection, id: entity.id, datos: entity });

    if (error) throw new Error(`No se pudo crear en ${this.collection}: ${error.message}`);
    return entity;
  }

  async update(id: ID, patch: Partial<T>): Promise<T> {
    // Se relee antes de escribir para no perder los campos que no vienen en el
    // parche: el documento se guarda entero, no columna por columna.
    const actual = await this.get(id);
    if (!actual) throw new Error(`No se encontró el registro ${id} en ${this.collection}.`);

    const updated = { ...actual, ...patch, id, updatedAt: new Date().toISOString() } as T;

    const { error } = await this.client
      .from(TABLA)
      .update({ datos: updated, editado_en: new Date().toISOString() })
      .eq('coleccion', this.collection)
      .eq('id', id);

    if (error) throw new Error(`No se pudo actualizar ${this.collection}/${id}: ${error.message}`);
    return updated;
  }

  async remove(id: ID): Promise<void> {
    const { error } = await this.client
      .from(TABLA)
      .delete()
      .eq('coleccion', this.collection)
      .eq('id', id);

    if (error) throw new Error(`No se pudo eliminar ${this.collection}/${id}: ${error.message}`);
  }
}

const PREFIJOS: Record<CollectionName, string> = {
  users: 'usr',
  news: 'new',
  events: 'evt',
  announcements: 'com',
  benefits: 'ben',
  sportsResults: 'res',
  projects: 'prj',
  reports: 'rpt',
};

export function createSupabaseProvider(client: SupabaseClient): DataProvider {
  const repos = Object.fromEntries(
    COLLECTIONS.map((name) => [name, new SupabaseRepository(client, name, PREFIJOS[name])]),
  ) as unknown as Omit<DataProvider, 'reset'>;

  return {
    ...repos,
    /**
     * Con base de datos NO existe "restaurar el contenido de ejemplo": el
     * contenido es compartido y borrarlo se lo borraría a toda la comunidad.
     * Se falla en voz alta en vez de hacer algo destructivo por sorpresa.
     */
    async reset() {
      throw new Error(
        'Restaurar el contenido de ejemplo solo funciona sin base de datos. ' +
          'Con el servidor conectado, el contenido se edita desde Administración.',
      );
    },
  };
}
