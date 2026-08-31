import { db } from '@/core/data';
import type { CreateInput } from '@/core/data';
import { useCollection, useDataMutation, useEntity } from '@/core/hooks/useData';
import type { Benefit, ID } from '@/core/types';
import { isPast } from '@/core/utils/date';

export function useBenefitList() {
  return useCollection('benefits', db.benefits);
}

export function useBenefit(id: ID | undefined) {
  return useEntity('benefits', db.benefits, id);
}

/**
 * ¿El beneficio se puede canjear hoy? Un convenio vencido sigue visible para
 * los administradores, pero deja de ofrecer el código a los estudiantes.
 */
export function isRedeemable(benefit: Benefit): boolean {
  return benefit.active && (!benefit.validUntil || !isPast(benefit.validUntil));
}

/** Canjeables primero, y dentro de cada grupo por orden alfabético. */
export function sortBenefits(items: Benefit[]): Benefit[] {
  return [...items].sort((a, b) => {
    const availableA = isRedeemable(a);
    const availableB = isRedeemable(b);
    if (availableA !== availableB) return availableA ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function useCreateBenefit() {
  return useDataMutation((input: CreateInput<Benefit>) => db.benefits.create(input), ['benefits']);
}

export function useUpdateBenefit() {
  return useDataMutation(
    ({ id, patch }: { id: ID; patch: Partial<Benefit> }) => db.benefits.update(id, patch),
    ['benefits'],
  );
}

export function useDeleteBenefit() {
  return useDataMutation((id: ID) => db.benefits.remove(id), ['benefits']);
}
