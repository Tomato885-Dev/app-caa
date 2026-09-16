import type { MenuDelDia, MinutaCasino } from '@/core/types';

/* Lógica pura de las minutas, sin acceso a datos: se puede probar sola. */

/**
 * Todos los días de todas las minutas, por fecha.
 *
 * Una fecha no debería quedar en dos minutas, porque cada una es de un solo
 * mes. Si pasara igual, gana la editada más recientemente: es la que alguien
 * del equipo corrigió a propósito.
 */
export function menusPorFecha(minutas: MinutaCasino[]): Map<string, MenuDelDia> {
  const porFecha = new Map<string, MenuDelDia>();
  [...minutas]
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
    .forEach((minuta) => minuta.dias.forEach((dia) => porFecha.set(dia.fecha, dia)));
  return porFecha;
}

/** La más nueva primero: en Administración lo que se toca es el mes que viene. */
export function ordenarMinutas(minutas: MinutaCasino[]): MinutaCasino[] {
  return [...minutas].sort((a, b) => b.mes.localeCompare(a.mes));
}
