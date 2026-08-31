import { ensureSeeded, localProvider } from './localProvider';
import type { DataProvider } from './repository';

/* ============================================================================
   PUNTO DE INTERCAMBIO DEL BACKEND
   ----------------------------------------------------------------------------
   Toda la aplicación obtiene datos llamando a `db`. Para migrar a un servidor
   real solo hay que crear una implementación de `DataProvider` (por ejemplo
   `supabaseProvider.ts`) y cambiar la asignación de abajo.
   ========================================================================== */

ensureSeeded();

export const db: DataProvider = localProvider;

export * from './repository';
export { createId, readSeedSignature, type SeedSignature } from './localProvider';
