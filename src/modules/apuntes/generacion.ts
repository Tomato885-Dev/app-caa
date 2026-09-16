/* ============================================================================
   GENERACIONES
   ----------------------------------------------------------------------------
   Una generación se nombra por su año de egreso: quien está en III Medio en
   2026 es la Generación 2027. Se calcula desde el curso, que es lo que trae la
   nómina.

   EL ORDEN DE LOS NIVELES IMPORTA
   "I Medio", "II Medio", "III Medio" y "IV Medio" empiezan todos con I. Cada
   patrón exige el espacio justo después del número romano, así que "II Medio"
   nunca se confunde con "I Medio"; y aun así se prueban de mayor a menor.
   ========================================================================== */

const NIVELES: { patron: RegExp; nombre: string; faltan: number }[] = [
  { patron: /^IV\s+Medio\b/i, nombre: 'IV Medio', faltan: 0 },
  { patron: /^III\s+Medio\b/i, nombre: 'III Medio', faltan: 1 },
  { patron: /^II\s+Medio\b/i, nombre: 'II Medio', faltan: 2 },
  { patron: /^I\s+Medio\b/i, nombre: 'I Medio', faltan: 3 },
  { patron: /^8\s*°?\s*B[aá]sico\b/i, nombre: '8° Básico', faltan: 4 },
];

/** Año de egreso de quien está en ese curso hoy. `null` si el curso no se reconoce. */
export function generacionDe(curso: string | undefined, hoy = new Date()): number | null {
  const texto = (curso ?? '').trim();
  const nivel = NIVELES.find((n) => n.patron.test(texto));
  return nivel ? hoy.getFullYear() + nivel.faltan : null;
}

/** En qué curso está hoy una generación: 2027 → "III Medio". `null` si ya egresó o aún no entra. */
export function cursoDeGeneracion(generacion: number, hoy = new Date()): string | null {
  const faltan = generacion - hoy.getFullYear();
  return NIVELES.find((n) => n.faltan === faltan)?.nombre ?? null;
}

/** Las generaciones que hoy están en el colegio, de la que egresa este año a la más nueva. */
export function generacionesVigentes(hoy = new Date()): number[] {
  return NIVELES.map((n) => hoy.getFullYear() + n.faltan).sort((a, b) => a - b);
}

/**
 * Solo se abren enlaces https. Un enlace mal escrito, o uno que empiece con
 * "javascript:", no debe poder ejecutarse al tocarlo dentro de la app.
 */
export function esEnlaceSeguro(url: string): boolean {
  try {
    return new URL(url.trim()).protocol === 'https:';
  } catch {
    return false;
  }
}
