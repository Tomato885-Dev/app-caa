import type { BenefitRedeem, RedeemMethod } from '@/core/types';
import { esEnlaceSeguro } from '@/modules/apuntes/generacion';

export { esEnlaceSeguro };

/* ============================================================================
   CÓMO SE CANJEA CADA CONVENIO
   ----------------------------------------------------------------------------
   Antes todos los convenios tenían un "código de canje" que inventaba el
   Centro de Alumnos. No servía: cada local tiene su propia forma, y un código
   que el local no conoce es peor que no tener ninguno.

   Ahora la forma la pone el local y el panel solo la copia:
     · un código que se dicta en caja,
     · un QR que escanean,
     · una tienda en línea, con o sin cupón,
     · o unas indicaciones, cuando basta con mostrar la credencial.

   Todo lo de aquí es lógica pura, sin React ni base de datos, para poder
   probarlo por separado.
   ========================================================================== */

export const FORMAS_DE_CANJE: { value: RedeemMethod; label: string; description: string }[] = [
  { value: 'codigo', label: 'Código', description: 'Se dicta o se muestra en caja.' },
  { value: 'qr', label: 'Código QR', description: 'Lo escanean en el local.' },
  { value: 'enlace', label: 'En línea', description: 'Tienda web, con o sin cupón.' },
  { value: 'indicaciones', label: 'Indicaciones', description: 'Pasos a seguir, sin código.' },
];

export const ETIQUETA_DEL_CANJE: Record<RedeemMethod, string> = {
  codigo: 'Código',
  qr: 'QR',
  enlace: 'En línea',
  indicaciones: 'Presencial',
};


/**
 * Los pasos, uno por línea. Se quitan las viñetas y números que la persona
 * haya escrito a mano ("1.", "-", "•"): la ficha ya los numera sola.
 */
export function pasosDe(texto: string | undefined): string[] {
  return (texto ?? '')
    .split(/\r?\n/)
    .map((linea) => linea.replace(/^\s*(?:\d+\s*[.)-]|[-•*·])\s*/, '').trim())
    .filter(Boolean);
}

/** Deja solo los campos que usa la forma elegida, sin espacios de sobra. */
export function limpiarCanje(canje: BenefitRedeem): BenefitRedeem {
  const texto = (valor: string | undefined) => valor?.trim() || undefined;
  const pasos = pasosDe(canje.steps).join('\n') || undefined;

  switch (canje.method) {
    case 'codigo':
      return { method: 'codigo', code: texto(canje.code), steps: pasos };
    case 'qr':
      // Si hay imagen, manda la imagen: es exactamente lo que dio el local.
      return canje.qrImage
        ? { method: 'qr', qrImage: canje.qrImage, steps: pasos }
        : { method: 'qr', qrValue: texto(canje.qrValue), steps: pasos };
    case 'enlace':
      return { method: 'enlace', url: texto(canje.url), code: texto(canje.code), steps: pasos };
    case 'indicaciones':
      return { method: 'indicaciones', steps: pasos };
  }
}

/** Qué le falta a la forma de canje para poder publicarse. Vacío si nada. */
export function erroresDelCanje(canje: BenefitRedeem): Record<string, string> {
  const c = limpiarCanje(canje);
  const errores: Record<string, string> = {};

  if (c.method === 'codigo' && !c.code) {
    errores.code = 'Escribe el código que te dio el local.';
  }
  if (c.method === 'qr' && !c.qrImage && !c.qrValue) {
    errores.qr = 'Sube la imagen del QR o pega su contenido.';
  }
  if (c.method === 'qr' && c.qrValue && c.qrValue.length > 800) {
    errores.qr = 'Es demasiado largo para un QR. Sube la imagen en su lugar.';
  }
  if (c.method === 'enlace' && (!c.url || !esEnlaceSeguro(c.url))) {
    errores.url = 'Pega el enlace completo de la tienda, empezando por https://';
  }
  if (c.method === 'indicaciones' && !c.steps) {
    errores.steps = 'Explica qué tiene que hacer el alumno para canjearlo.';
  }
  return errores;
}

/**
 * Cuántos días le quedan al convenio, para avisar cuando está por vencer.
 * `null` si no vence, si ya venció o si falta más de `aviso` días.
 */
export function diasParaVencer(
  validUntil: string | undefined,
  aviso = 14,
  ahora = new Date(),
): number | null {
  const termino = terminoDelConvenio(validUntil);
  if (!termino) return null;
  const fin = new Date(termino);
  if (Number.isNaN(fin.getTime()) || fin.getTime() < ahora.getTime()) return null;

  const dia = (fecha: Date) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const dias = Math.round((dia(fin).getTime() - dia(ahora).getTime()) / 86_400_000);
  return dias <= aviso ? dias : null;
}

/* ----------------------------------------------------------------------------
   LA FECHA DE TÉRMINO
   El formulario entrega "2026-12-31". Guardarlo con new Date("2026-12-31") lo
   deja a medianoche de Londres, que en Chile es el 30 a las 21:00: el convenio
   vencía la noche anterior y la ficha mostraba el día equivocado.

   Se guarda el final del día en hora de Chile, y se vuelve a leer igual.
   -------------------------------------------------------------------------- */

export function finDelDia(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(anio, mes - 1, dia, 23, 59, 59).toISOString();
}

/**
 * Los convenios guardados antes de este arreglo quedaron a medianoche de
 * Londres ("…T00:00:00.000Z"). Se leen como el final de ESE día en Chile, que
 * es lo que quiso decir quien los cargó.
 */
export function terminoDelConvenio(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  return /^\d{4}-\d{2}-\d{2}T00:00:00(?:\.000)?Z$/.test(iso) ? finDelDia(iso.slice(0, 10)) : iso;
}

export function aCampoDeFecha(iso: string | undefined): string {
  const termino = terminoDelConvenio(iso);
  if (!termino) return '';
  const fecha = new Date(termino);
  if (Number.isNaN(fecha.getTime())) return '';
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}
