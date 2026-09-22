import { db } from '@/core/data';
import type { CreateInput } from '@/core/data';
import { useCollection, useDataMutation, useEntity } from '@/core/hooks/useData';
import type { Benefit, ID } from '@/core/types';
import { isPast } from '@/core/utils/date';
import { terminoDelConvenio } from './canje';

export function useBenefitList() {
  return useCollection('benefits', db.benefits);
}

export function useBenefit(id: ID | undefined) {
  return useEntity('benefits', db.benefits, id);
}

/**
 * ¿Este colaborador se le muestra a la comunidad?
 *
 * Desde que se sacó el sistema de canje, lo único que decide si un
 * colaborador aparece es el interruptor "activo" del panel. La fecha de
 * término ya no esconde a nadie: el equipo apaga a quien ya no corresponde.
 *
 * Antes esto no se comprobaba en el listado, solo en Inicio, así que un
 * colaborador apagado seguía apareciendo en la lista —y encima Inicio decía
 * un número distinto del que se veía al entrar.
 */
export function esVisible(benefit: Benefit): boolean {
  return benefit.active;
}

/**
 * ¿El beneficio se puede canjear hoy? Ya no se usa en las pantallas de la
 * comunidad —el canje se quitó de la vista— pero el panel lo sigue
 * necesitando para avisarle al equipo que un convenio venció.
 */
export function isRedeemable(benefit: Benefit): boolean {
  const termino = terminoDelConvenio(benefit.validUntil);
  return benefit.active && (!termino || !isPast(termino));
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
