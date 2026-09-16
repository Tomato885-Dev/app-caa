import { db } from '@/core/data';
import type { CreateInput } from '@/core/data';
import { useCollection, useDataMutation } from '@/core/hooks/useData';
import type { ID, MinutaCasino } from '@/core/types';

export { menusPorFecha, ordenarMinutas } from './minutas';

export function useMinutas() {
  return useCollection('casino', db.casino);
}

export function useCreateMinuta() {
  return useDataMutation((input: CreateInput<MinutaCasino>) => db.casino.create(input), ['casino']);
}

export function useUpdateMinuta() {
  return useDataMutation(
    ({ id, patch }: { id: ID; patch: Partial<MinutaCasino> }) => db.casino.update(id, patch),
    ['casino'],
  );
}

export function useDeleteMinuta() {
  return useDataMutation((id: ID) => db.casino.remove(id), ['casino']);
}
