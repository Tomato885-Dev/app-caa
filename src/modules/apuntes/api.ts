import { db } from '@/core/data';
import type { CreateInput } from '@/core/data';
import { useCollection, useDataMutation } from '@/core/hooks/useData';
import type { CarpetaApuntes, ID } from '@/core/types';

export function useCarpetas() {
  return useCollection('apuntes', db.apuntes);
}

/**
 * De la generación que egresa antes a la más nueva, y al final las que son
 * para todas. Dentro de cada una, por título.
 */
export function ordenarCarpetas(carpetas: CarpetaApuntes[]): CarpetaApuntes[] {
  return [...carpetas].sort(
    (a, b) =>
      (a.generacion ?? Number.MAX_SAFE_INTEGER) - (b.generacion ?? Number.MAX_SAFE_INTEGER) ||
      a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' }),
  );
}

export function useCreateCarpeta() {
  return useDataMutation((input: CreateInput<CarpetaApuntes>) => db.apuntes.create(input), ['apuntes']);
}

export function useUpdateCarpeta() {
  return useDataMutation(
    ({ id, patch }: { id: ID; patch: Partial<CarpetaApuntes> }) => db.apuntes.update(id, patch),
    ['apuntes'],
  );
}

export function useDeleteCarpeta() {
  return useDataMutation((id: ID) => db.apuntes.remove(id), ['apuntes']);
}
