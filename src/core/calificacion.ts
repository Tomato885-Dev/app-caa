import { Capacitor } from '@capacitor/core';
import { InAppReview } from '@capacitor-community/in-app-review';

/* ============================================================================
   PEDIR QUE CALIFIQUEN LA APP
   ----------------------------------------------------------------------------
   Las valoraciones son lo que más mueve a una app en los resultados de la
   tienda. Aquí se le pide al sistema que muestre SU cuadro de estrellas, el
   nativo de Apple y de Google. No hay un cuadro propio: las dos tiendas lo
   prohíben, y además la gente confía más en el que ya conoce.

   CUÁNDO
   Nunca al abrir la app, y nunca a quien recién llega. Solo a quien ya la usó
   en varios días distintos, y justo después de leer un comunicado o una
   noticia: el momento en que la app le acaba de servir para algo.

   QUIÉN DECIDE DE VERDAD
   El sistema. Pedirlo no garantiza que aparezca: Apple lo muestra como mucho
   tres veces al año por persona, y puede decidir no mostrarlo. Por eso aquí no
   hay reintentos ni mensajes de error. Si no sale, no pasa nada.

   SOLO EN LA APP INSTALADA
   En el navegador no existe ese cuadro, así que ahí todo esto no hace nada.
   ========================================================================== */

const DIAS = 'calificacion:dias';
const PEDIDA = 'calificacion:pedida';

/** Días distintos de uso antes de pedirla por primera vez. */
const DIAS_MINIMOS = 4;

/** Tiempo mínimo entre un pedido y el siguiente: unos cuatro meses. */
const ENTRE_PEDIDOS_MS = 120 * 24 * 60 * 60 * 1000;

/** Cuánto se espera dentro de la página: que alcance a leer antes de interrumpir. */
const ESPERA_MS = 4000;

function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function escribir(clave: string, valor: string): void {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    // Sin almacenamiento nunca se llega al mínimo de días, y no se pide. Está bien.
  }
}

/** La fecha de hoy en la hora del teléfono, no en la de Greenwich. */
function hoy(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function diasDeUso(): string[] {
  try {
    const lista: unknown = JSON.parse(leer(DIAS) ?? '[]');
    return Array.isArray(lista) ? lista.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function anotarHoy(): void {
  const dias = diasDeUso();
  const fecha = hoy();
  if (dias.includes(fecha)) return;
  // Solo importa saber si se llegó al mínimo, así que no se guarda la historia entera.
  escribir(DIAS, JSON.stringify([...dias, fecha].slice(-DIAS_MINIMOS)));
}

/**
 * Anota los días en que se usa la app. Se llama una vez, al arrancar.
 *
 * Un teléfono puede dejar la app en segundo plano varios días sin volver a
 * arrancarla, así que también se anota cada vez que vuelve a la pantalla.
 */
export function contarDiasDeUso(): void {
  if (!Capacitor.isNativePlatform()) return;

  anotarHoy();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') anotarHoy();
  });
}

/**
 * Pide la calificación, si corresponde, después de unos segundos en la página.
 * Devuelve la función que lo cancela: si la persona se va antes, no se pide.
 */
export function pedirCalificacionSiCorresponde(): () => void {
  const nada = () => {};

  if (!Capacitor.isNativePlatform()) return nada;
  if (diasDeUso().length < DIAS_MINIMOS) return nada;

  const ultima = Number(leer(PEDIDA));
  if (Number.isFinite(ultima) && Date.now() - ultima < ENTRE_PEDIDOS_MS) return nada;

  const espera = window.setTimeout(() => {
    // Se anota antes de pedir: aunque el sistema no lo muestre, no se insiste.
    escribir(PEDIDA, String(Date.now()));
    InAppReview.requestReview().catch(() => {
      // El sistema decide si lo muestra. Un fallo aquí no le importa a nadie.
    });
  }, ESPERA_MS);

  return () => window.clearTimeout(espera);
}
