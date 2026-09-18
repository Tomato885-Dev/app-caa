import { db } from '@/core/data';
import { useCollection, useDataMutation } from '@/core/hooks/useData';
import type { Ajustes } from '@/core/types';

/* ============================================================================
   LOS INTERRUPTORES DE LA APP
   ----------------------------------------------------------------------------
   Cosas que el equipo enciende y apaga desde Administración, sin esperar una
   versión nueva en la tienda. Viven como UN solo documento en la colección
   `ajustes`; mientras nadie lo toque, rigen los valores de aquí abajo.
   ========================================================================== */

export type Interruptores = Pick<Ajustes, 'mostrarConectados'>;

export const AJUSTES_POR_DEFECTO: Interruptores = {
  /* Apagado de entrada: que la app empiece a mostrar un número sin que nadie
     lo haya decidido es justo lo contrario de lo que se quiere. */
  mostrarConectados: false,
};

export function useAjustes() {
  const consulta = useCollection('ajustes', db.ajustes);
  const documento = consulta.data?.[0];
  const valores: Interruptores = {
    mostrarConectados: documento?.mostrarConectados ?? AJUSTES_POR_DEFECTO.mostrarConectados,
  };
  return { valores, documento, cargando: consulta.isLoading };
}

/** Guarda los interruptores: edita el documento si existe, o lo crea. */
export function useGuardarAjustes() {
  return useDataMutation(
    async ({ id, valores }: { id?: string; valores: Interruptores }) =>
      id ? db.ajustes.update(id, valores) : db.ajustes.create(valores),
    ['ajustes'],
  );
}
