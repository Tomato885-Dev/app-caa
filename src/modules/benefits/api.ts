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

/**
 * Por orden alfabético del colaborador: Açaí, Burger King, y así.
 *
 * Se ordena por `partner` —quién da el beneficio— y no por `name` —en qué
 * consiste—, porque quien busca en esta lista viene con el comercio en la
 * cabeza, no con el descuento. Es una guía de colaboradores.
 *
 * Los no disponibles NO se mandan al final. Con quince tarjetas que caben casi
 * en una pantalla, moverlas rompería el abecedario justo cuando sirve para
 * encontrar algo; que un convenio esté vencido ya lo dice su distintivo.
 *
 * `localeCompare` en español con `sensitivity: 'base'` hace que los acentos y
 * las mayúsculas no alteren el orden: "Açaí" queda junto a "Acai".
 */
export function sortBenefits(items: Benefit[]): Benefit[] {
  const comparar = (a: string, b: string) =>
    a.trim().localeCompare(b.trim(), 'es', { sensitivity: 'base' });

  return [...items].sort(
    (a, b) => comparar(a.partner, b.partner) || comparar(a.name, b.name),
  );
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
