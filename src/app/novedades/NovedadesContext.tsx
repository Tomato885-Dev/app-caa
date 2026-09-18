import { createContext, useContext, type ReactNode } from 'react';
import { useContarNovedades } from '@/core/novedades/useNovedades';

/* ============================================================================
   LAS NOVEDADES, REPARTIDAS
   ----------------------------------------------------------------------------
   Se cuentan UNA vez, arriba del todo, y desde aquí las lee la barra de abajo,
   el menú de escritorio y la portada. Si cada uno las contara por su cuenta,
   tres partes de la pantalla pedirían las mismas colecciones.
   ========================================================================== */

const Contexto = createContext<Record<string, number>>({});

export function NovedadesProvider({ children }: { children: ReactNode }) {
  return <Contexto.Provider value={useContarNovedades()}>{children}</Contexto.Provider>;
}

/** Cuántas cosas sin ver tiene esa sección. 0 si no lleva cuenta. */
export function useNovedadesDe(moduloId: string): number {
  return useContext(Contexto)[moduloId] ?? 0;
}

/** El total de un grupo de secciones, para el botón "Más". */
export function useNovedadesDeVarias(moduloIds: string[]): number {
  const cuenta = useContext(Contexto);
  return moduloIds.reduce((total, id) => total + (cuenta[id] ?? 0), 0);
}
