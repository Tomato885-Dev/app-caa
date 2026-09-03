import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { BaseEntity, ID, Role, User } from '@/core/types';
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

/* ----------------------------------------------------------------------------
   CUENTAS
   Las cuentas NO son contenido: viven en su propia tabla `perfiles`, ligada al
   sistema de cuentas de Supabase. Por eso `users` no pasa por la tabla común.

   La traducción de nombres ocurre aquí y en ningún otro sitio: la base de
   datos habla en español y en columnas; el resto de la aplicación sigue
   hablando de `User` como siempre.
   -------------------------------------------------------------------------- */

interface FilaPerfil {
  id: string;
  correo: string;
  nombre: string;
  curso: string;
  rol: Role;
  telefono: string | null;
  oculto: boolean;
  activo: boolean;
  creado_en: string;
  editado_en: string;
}

function aUsuario(fila: FilaPerfil): User {
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

function aColumnas(patch: Partial<User>): Record<string, unknown> {
  const fila: Record<string, unknown> = { editado_en: new Date().toISOString() };
  if (patch.name !== undefined) fila.nombre = patch.name;
  if (patch.grade !== undefined) fila.curso = patch.grade;
  if (patch.role !== undefined) fila.rol = patch.role;
  if (patch.active !== undefined) fila.activo = patch.active;
  if (patch.phone !== undefined) fila.telefono = patch.phone ?? null;
  if (patch.hideFromDirectory !== undefined) fila.oculto = patch.hideFromDirectory;
  return fila;
}

class PerfilesRepository implements Repository<User> {
  constructor(private readonly client: SupabaseClient) {}

  async list(): Promise<User[]> {
    const { data, error } = await this.client.from('perfiles').select('*');
    if (error) throw new Error(`No se pudieron leer las cuentas: ${error.message}`);
    return (data ?? []).map((fila) => aUsuario(fila as FilaPerfil));
  }

  async get(id: ID): Promise<User | null> {
    const { data, error } = await this.client
      .from('perfiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`No se pudo leer la cuenta ${id}: ${error.message}`);
    return data ? aUsuario(data as FilaPerfil) : null;
  }

  /**
   * Las cuentas no se crean desde aquí: nacen cuando alguien se registra y la
   * base de datos les arma el perfil desde la nómina.
   */
  async create(): Promise<User> {
    throw new Error(
      'Las cuentas se crean cuando la persona se registra, no desde la administración.',
    );
  }

  async update(id: ID, patch: Partial<User>): Promise<User> {
    const { data, error } = await this.client
      .from('perfiles')
      .update(aColumnas(patch))
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw new Error(`No se pudo actualizar la cuenta: ${error.message}`);
    if (!data) throw new Error(`No se encontró la cuenta ${id}.`);
    return aUsuario(data as FilaPerfil);
  }

  /** Desactivar, no borrar: se conserva la autoría de lo ya publicado. */
  async remove(id: ID): Promise<void> {
    await this.update(id, { active: false });
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
    // Las cuentas tienen su propia tabla; el resto sí es contenido.
    users: new PerfilesRepository(client),
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
