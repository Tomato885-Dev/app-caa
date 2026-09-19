import { useEffect, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
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

   UN SOLO CANAL PARA TODA LA APP
   El número se muestra en dos lugares —la barra de arriba y el menú de
   escritorio—, y los dos existen a la vez aunque uno esté oculto. Supabase
   DEVUELVE EL MISMO canal cuando se le pide uno que ya existe, así que el
   segundo en pedirlo lo encontraba ya en marcha y la app se caía con
   "cannot add presence callbacks after subscribe()".

   Por eso el canal se abre una vez aquí, fuera de los componentes, y ellos
   solo se apuntan a la lista de avisos. El último en irse lo cierra, con unos
   segundos de gracia: entrar a una ficha y volver no vale la pena que apague
   y encienda la conexión.
   ========================================================================== */

type Escucha = (cuantos: number | null) => void;

const CANAL = 'presencia-app';
/** Lo que se espera antes de cerrar, por si alguien vuelve enseguida. */
const GRACIA_MS = 5000;

const escuchas = new Set<Escucha>();
let canal: RealtimeChannel | null = null;
let cierrePendiente: ReturnType<typeof setTimeout> | null = null;
let latido: ReturnType<typeof setInterval> | null = null;

/* Cada cuánto se vuelve a mirar el número por si acaso. Los avisos de quién
   entra y quién sale llegan solos; esto es la red por si alguno se pierde. */
const LATIDO_MS = 12000;

/** Llave anónima de este teléfono, para esta sesión. */
function llaveAlAzar(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function avisar(cuantos: number | null): void {
  escuchas.forEach((escucha) => escucha(cuantos));
}

function cuantosHay(): number | null {
  return canal ? Object.keys(canal.presenceState()).length : null;
}

function abrir(): void {
  if (canal || !supabase) return;

  /* TODO ESTO VA PROTEGIDO A PROPÓSITO
     Es un número decorativo: si algo falla —Realtime apagado, un canal que
     quedó a medias, un cambio de la librería— la app tiene que seguir
     funcionando sin él. La primera versión de esto dejó la app en blanco con
     "cannot add presence callbacks after subscribe()", y eso no puede volver
     a pasar por un adorno. */
  try {
    const nuevo = supabase.channel(CANAL, { config: { presence: { key: llaveAlAzar() } } });
    canal = nuevo;

    const contar = () => {
      try {
        avisar(Object.keys(nuevo.presenceState()).length);
      } catch {
        avisar(null);
      }
    };

    nuevo
      .on('presence', { event: 'sync' }, contar)
      .on('presence', { event: 'join' }, contar)
      .on('presence', { event: 'leave' }, contar)
      .subscribe((estado) => {
        /* Solo al quedar suscrito se anuncia este teléfono. Si el proyecto no
           tiene Realtime encendido, esto nunca ocurre y el número no aparece:
           mejor que mostrar un "1" que no significa nada. */
        if (estado === 'SUBSCRIBED') {
          try {
            void nuevo.track({ desde: Date.now() });
          } catch {
            /* el número se queda sin mostrar, la app sigue igual */
          }
        }
      });

    encenderVigilancia();
  } catch {
    canal = null;
    avisar(null);
  }
}

/**
 * Al volver a la app. El teléfono corta la conexión cuando se bloquea la
 * pantalla o se cambia de aplicación, y al volver el número se quedaba
 * congelado en lo que era hace rato. Si la conexión murió, se rehace; y si
 * sigue viva, se vuelve a contar por si se perdió algún aviso.
 */
function alVolverALaApp(): void {
  if (typeof document === 'undefined' || document.visibilityState !== 'visible') return;
  if (!canal) return;

  if (canal.state !== 'joined') {
    cerrar();
    abrir();
    return;
  }
  avisar(cuantosHay());
}

function encenderVigilancia(): void {
  if (latido) return;
  latido = setInterval(() => {
    if (canal) avisar(cuantosHay());
  }, LATIDO_MS);
  document.addEventListener('visibilitychange', alVolverALaApp);
}

function apagarVigilancia(): void {
  if (latido) {
    clearInterval(latido);
    latido = null;
  }
  document.removeEventListener('visibilitychange', alVolverALaApp);
}

function cerrar(): void {
  apagarVigilancia();
  const viejo = canal;
  canal = null;
  avisar(null);
  try {
    if (viejo && supabase) void supabase.removeChannel(viejo);
  } catch {
    /* si no se puede cerrar, se queda abierto: no es motivo para romper nada */
  }
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

    if (cierrePendiente) {
      clearTimeout(cierrePendiente);
      cierrePendiente = null;
    }

    escuchas.add(setCuantos);
    abrir();
    // Si el canal ya venía abierto, este recién llegado necesita el número.
    setCuantos(cuantosHay());

    return () => {
      escuchas.delete(setCuantos);
      if (escuchas.size > 0) return;

      cierrePendiente = setTimeout(() => {
        cierrePendiente = null;
        if (escuchas.size === 0) cerrar();
      }, GRACIA_MS);
    };
  }, [activo]);

  return cuantos;
}
