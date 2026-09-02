import type {
  Announcement,
  BaseEntity,
  Benefit,
  EventItem,
  ID,
  NewsPost,
  Project,
  Registration,
  Report,
  SignupActivity,
  SportsResult,
  User,
} from '@/core/types';

/**
 * Datos necesarios para crear una entidad: todo menos los campos que
 * genera la capa de persistencia.
 */
export type CreateInput<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Contrato de acceso a datos. Toda la UI consume repositorios a través de
 * esta interfaz, nunca directamente el almacenamiento.
 *
 * Cambiar de backend (Supabase, Firebase, API propia) consiste en escribir
 * una nueva implementación de `DataProvider` y registrarla en
 * `core/data/index.ts`. Ningún componente necesita modificarse.
 */
export interface Repository<T extends BaseEntity> {
  list(): Promise<T[]>;
  get(id: ID): Promise<T | null>;
  create(input: CreateInput<T>): Promise<T>;
  update(id: ID, patch: Partial<T>): Promise<T>;
  remove(id: ID): Promise<void>;
}

export interface DataProvider {
  users: Repository<User>;
  news: Repository<NewsPost>;
  events: Repository<EventItem>;
  signupActivities: Repository<SignupActivity>;
  registrations: Repository<Registration>;
  announcements: Repository<Announcement>;
  benefits: Repository<Benefit>;
  sportsResults: Repository<SportsResult>;
  projects: Repository<Project>;
  reports: Repository<Report>;

  /** Restaura el contenido de ejemplo. Útil en demos y pruebas. */
  reset(): Promise<void>;
}

/** Nombres de colección: también son las claves de caché de React Query. */
export const COLLECTIONS = [
  'users',
  'news',
  'events',
  'signupActivities',
  'registrations',
  'announcements',
  'benefits',
  'sportsResults',
  'projects',
  'reports',
] as const;

export type CollectionName = (typeof COLLECTIONS)[number];
