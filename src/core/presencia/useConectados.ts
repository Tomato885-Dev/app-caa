import { useEffect, useState } from 'react';
import { supabase } from '@/core/data';

/* ============================================================================
   CUÁNTOS ESTÁN EN LA APP AHORA
   ----------------------------------------------------------------------------
   Un número en vivo: cuánta gente tiene la app abierta en este momento. Sirve
   para lo de siempre en una comunidad —ver que hay alguien más al otro lado—,
   y se puede apagar desde Administración.

   NO SE MANDA QUIÉN ES NADIE
   Cada teléfono entra con una llave inventada al momento, distinta cada vez.
   El servidor solo sabe cuántas llaves hay conectadas, nunca de quién es cada
   una. Es a propósito: son 694 menores y para mostrar un número no hace falta
   saber sus nombres.

   Se apoya en la presencia de Supabase Realtime, que no guarda nada: cuando
   alguien cierra la app, su llave desaparece sola.
   ========================================================================== */

/** Llave anónima de este teléfono, para esta sesión. */
function llaveAlAzar(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

/**
 * Devuelve cuántos están conectados, o `null` mientras no se sepa —porque
 * todavía no responde, porque no hay servidor, o porque está apagado—. Quien
 * lo usa muestra el número solo cuando existe.
 */
export function useConectados(activo: boolean): number | null {
  const [cuantos, setCuantos] = useState<number | null>(null);

  useEffect(() => {
    if (!activo || !supabase) {
      setCuantos(null);
      return;
    }

    const canal = supabase.channel('presencia-app', {
      config: { presence: { key: llaveAlAzar() } },
    });

    const contar = () => {
      const estado = canal.presenceState();
      setCuantos(Object.keys(estado).length);
    };

    canal
      .on('presence', { event: 'sync' }, contar)
      .on('presence', { event: 'join' }, contar)
      .on('presence', { event: 'leave' }, contar)
      .subscribe((estado) => {
        /* Solo al quedar suscrito se anuncia este teléfono. Si el proyecto no
           tiene Realtime encendido, esto nunca ocurre y el número no aparece:
           mejor que mostrar un "1" que no significa nada. */
        if (estado === 'SUBSCRIBED') void canal.track({ desde: Date.now() });
      });

    return () => {
      void supabase?.removeChannel(canal);
    };
  }, [activo]);

  return cuantos;
}
