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
