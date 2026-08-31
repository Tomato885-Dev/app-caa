import { useQuery } from '@tanstack/react-query';
import { getModerationSources } from '@/core/modules/registry';
import type { ModerationItem } from '@/core/modules/types';

/* ============================================================================
   COLA DE MODERACIÓN AGREGADA
   ----------------------------------------------------------------------------
   Reúne el contenido pendiente de todos los módulos registrados. Un módulo
   nuevo que declare `moderationSources` aparece aquí sin cambios adicionales.
   ========================================================================== */

export interface ModerationQueue {
  items: ModerationItem[];
  pending: ModerationItem[];
}

async function loadQueue(): Promise<ModerationQueue> {
  const sources = getModerationSources();
  const batches = await Promise.all(sources.map((source) => source.fetchAll()));
  const items = batches
    .flat()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return { items, pending: items.filter((item) => item.status === 'pending') };
}

export function useModerationQueue(enabled = true) {
  return useQuery({
    queryKey: ['moderationQueue'],
    queryFn: loadQueue,
    enabled,
    staleTime: 15_000,
  });
}

/** Solo el número de pendientes: para la insignia de navegación. */
export function usePendingCount(enabled = true): number {
  const { data } = useModerationQueue(enabled);
  return data?.pending.length ?? 0;
}
