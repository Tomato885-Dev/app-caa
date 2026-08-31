import { db } from '@/core/data';
import type { CreateInput } from '@/core/data';
import { useCollection, useDataMutation, useEntity } from '@/core/hooks/useData';
import type { ID, SportsResult } from '@/core/types';

export function useSportsResults() {
  return useCollection('sportsResults', db.sportsResults);
}

export function useSportsResult(id: ID | undefined) {
  return useEntity('sportsResults', db.sportsResults, id);
}

/** Del encuentro más reciente al más antiguo. */
export function sortResults(items: SportsResult[]): SportsResult[] {
  return [...items].sort(
    (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime(),
  );
}

export interface SeasonRecord {
  victorias: number;
  empates: number;
  derrotas: number;
  participaciones: number;
  total: number;
}

/** Balance de la selección seleccionada, para el resumen de la cabecera. */
export function recordOf(items: SportsResult[]): SeasonRecord {
  return {
    victorias: items.filter((item) => item.outcome === 'victoria').length,
    empates: items.filter((item) => item.outcome === 'empate').length,
    derrotas: items.filter((item) => item.outcome === 'derrota').length,
    participaciones: items.filter((item) => item.outcome === 'participacion').length,
    total: items.length,
  };
}

export function useCreateSportsResult() {
  return useDataMutation(
    (input: CreateInput<SportsResult>) => db.sportsResults.create(input),
    ['sportsResults'],
  );
}

export function useUpdateSportsResult() {
  return useDataMutation(
    ({ id, patch }: { id: ID; patch: Partial<SportsResult> }) => db.sportsResults.update(id, patch),
    ['sportsResults'],
  );
}

export function useDeleteSportsResult() {
  return useDataMutation((id: ID) => db.sportsResults.remove(id), ['sportsResults']);
}
