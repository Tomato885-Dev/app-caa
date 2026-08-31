import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { CollectionName, Repository } from '@/core/data';
import type { BaseEntity, ID } from '@/core/types';

/* ============================================================================
   ACCESO A DATOS DESDE LA INTERFAZ
   ----------------------------------------------------------------------------
   Envoltorios finos sobre React Query. Concentran aquí las claves de caché y
   la invalidación, de modo que los módulos no repitan esa lógica.
   ========================================================================== */

/**
 * Claves de caché válidas: las colecciones más las vistas derivadas
 * (por ejemplo, la cola de moderación agregada).
 */
export type QueryKeyName = CollectionName | 'moderationQueue' | 'calendarEntries';

/** Lista completa de una colección. */
export function useCollection<T extends BaseEntity>(
  name: CollectionName,
  repository: Repository<T>,
) {
  return useQuery({
    queryKey: [name],
    queryFn: () => repository.list(),
    staleTime: 30_000,
  });
}

/** Una entidad por id. */
export function useEntity<T extends BaseEntity>(
  name: CollectionName,
  repository: Repository<T>,
  id: ID | undefined,
) {
  return useQuery({
    queryKey: [name, id],
    queryFn: () => repository.get(id as ID),
    enabled: Boolean(id),
  });
}

/**
 * Mutación que refresca las colecciones indicadas al terminar.
 * Ejemplo: crear una publicación invalida su colección y la cola de moderación.
 */
export function useDataMutation<TResult, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
  invalidate: QueryKeyName[],
  options?: Omit<UseMutationOptions<TResult, Error, TVariables>, 'mutationFn' | 'onSuccess'> & {
    onSuccess?: (result: TResult, variables: TVariables) => void;
  },
) {
  const queryClient = useQueryClient();

  return useMutation<TResult, Error, TVariables>({
    ...options,
    mutationFn,
    onSuccess: (result, variables) => {
      for (const name of invalidate) {
        void queryClient.invalidateQueries({ queryKey: [name] });
      }
      options?.onSuccess?.(result, variables);
    },
  });
}
