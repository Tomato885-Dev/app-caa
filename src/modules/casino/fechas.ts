import { dayKey } from '@/core/utils/date';

/* ============================================================================
   FECHAS DEL CASINO
   ----------------------------------------------------------------------------
   Todo aquí trabaja en hora local y con claves "2026-09-18".

   OJO CON new Date('2026-09-18')
   JavaScript lee esa forma como medianoche en UTC, que en Chile son las nueve
   de la noche del DÍA ANTERIOR. El lunes mostraría el menú del domingo. Por
   eso las claves se leen siempre con `fechaLocal`, nunca con `new Date`.
   ========================================================================== */

const LOCALE = 'es-CL';

/** "2026-09-18" leído en hora local. */
export function fechaLocal(clave: string): Date {
  const [año, mes, dia] = clave.split('-').map(Number);
  return new Date(año, mes - 1, dia);
}

/** "2026-09", el mes de una fecha. */
export function mesDe(fecha: Date): string {
  return dayKey(fecha).slice(0, 7);
}

/** El lunes de la semana de una fecha. */
export function lunesDe(fecha: Date): Date {
  const lunes = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  // getDay(): 0 es domingo. La semana escolar empieza el lunes.
  lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7));
  return lunes;
}

/** Lunes a viernes de la semana que empieza en `lunes`. */
export function diasDeLaSemana(lunes: Date): Date[] {
  return Array.from(
    { length: 5 },
    (_, i) => new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + i),
  );
}

/**
 * El día que conviene mostrar primero en la portada.
 *
 * Regla: hasta las 16:00 se muestra el menú de HOY —a la hora del almuerzo la
 * gente todavía quiere confirmar qué le toca—; a partir de las 16:00 se salta
 * al día siguiente —ya comieron y ahora quieren planear el de mañana—. Si el
 * salto cae en fin de semana, se ajusta al lunes: un sábado no importa lo que
 * hubo el viernes, sino lo que viene.
 */
export function diaHabilDeReferencia(hoy = new Date()): Date {
  const dia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const enSemana = hoy.getDay() >= 1 && hoy.getDay() <= 5;
  if (enSemana && hoy.getHours() >= 16) dia.setDate(dia.getDate() + 1);
  if (dia.getDay() === 6) dia.setDate(dia.getDate() + 2);
  if (dia.getDay() === 0) dia.setDate(dia.getDate() + 1);
  return dia;
}

/** Los días de lunes a viernes de un mes "2026-09", como claves. */
export function diasHabilesDelMes(mes: string): string[] {
  const [año, numero] = mes.split('-').map(Number);
  const cursor = new Date(año, numero - 1, 1);
  const dias: string[] = [];
  while (cursor.getMonth() === numero - 1) {
    const semana = cursor.getDay();
    if (semana >= 1 && semana <= 5) dias.push(dayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dias;
}

/** "septiembre de 2026". */
export function nombreDelMes(mes: string): string {
  const [año, numero] = mes.split('-').map(Number);
  return new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' }).format(
    new Date(año, numero - 1, 1),
  );
}

/** "14 al 18 de septiembre", o "29 de septiembre al 3 de octubre". */
export function rangoDeSemana(dias: Date[]): string {
  const primero = dias[0];
  const ultimo = dias[dias.length - 1];
  const largo = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long' });
  if (primero.getMonth() === ultimo.getMonth()) {
    return `${primero.getDate()} al ${largo.format(ultimo)}`;
  }
  return `${largo.format(primero)} al ${largo.format(ultimo)}`;
}

/** "lunes", en minúscula, para armar frases. */
export function nombreDelDia(fecha: Date): string {
  return new Intl.DateTimeFormat(LOCALE, { weekday: 'long' }).format(fecha);
}
