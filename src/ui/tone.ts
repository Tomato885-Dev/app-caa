/* ============================================================================
   TONOS
   ----------------------------------------------------------------------------
   Escala de color semántica compartida por insignias, iconos y realces.
   Las clases se escriben completas (no se construyen por concatenación) para
   que Tailwind las detecte al compilar.

   CUIDADO CON EL ACENTO AMARILLO
   El amarillo #FFD101 no admite texto blanco (1.46:1). Por eso `accent` y
   `warning` usan `accent-700` / `warning-700` como color de texto sobre fondo
   claro, y `ink` cuando el fondo es el amarillo pleno.

   TODOS los fondos son colores planos: no se usan superposiciones con alfa.

   QUE COLOR LLEVA CADA SECCION
   Los iconos de seccion iban en verde y amarillo sin una regla, y la app se
   veia desordenada. Desde la 1.11 la regla es una sola:

     · amarillo (`accent`)  lo que te sirve HOY: Casino y Colaboradores.
     · verde    (`brand`)   todo lo demas, que es informacion del Centro.
     · rojo     (`danger`)  Administracion, que publica para todo el colegio.
     · gris     (`neutral`) Mi perfil, que es tuyo y no del Centro.

   Se define en el `tone` de cada modulo, en su archivo index.tsx.
   ========================================================================== */

export type Tone = 'brand' | 'accent' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';

/** Fondo suave + texto de contraste. Uso principal: insignias y chips. */
export const toneSoft: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  accent: 'bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300',
  info: 'bg-info-100 text-info-700 dark:bg-surface-3 dark:text-ink-2',
  success: 'bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-300',
  warning: 'bg-warning-100 text-warning-700 dark:bg-warning-950 dark:text-warning-300',
  danger: 'bg-danger-100 text-danger-700 dark:bg-surface-3 dark:text-ink',
  neutral: 'bg-surface-3 text-ink-2',
};

/** Color sólido. Uso: puntos indicadores y barras de acento. */
export const toneSolid: Record<Tone, string> = {
  brand: 'bg-brand-500',
  accent: 'bg-accent-500',
  info: 'bg-info-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  neutral: 'bg-ink-3',
};

/**
 * Color pleno con el ícono en su contraste. Para los íconos que tienen que
 * alegrar la pantalla: accesos de Inicio y títulos de sección. El amarillo
 * lleva siempre el ícono oscuro.
 */
export const toneVivid: Record<Tone, string> = {
  brand: 'bg-brand-500 text-white',
  accent: 'bg-accent-500 text-on-accent',
  info: 'bg-info-500 text-white',
  success: 'bg-success-500 text-white',
  warning: 'bg-warning-500 text-on-accent',
  danger: 'bg-danger-500 text-white dark:bg-surface-3 dark:text-ink',
  neutral: 'bg-ink-2 text-surface',
};

/**
 * Un bano de color muy suave, para el fondo de una portada de seccion. No es
 * un relleno: es un degradado que arranca en la esquina y se va. Da el color
 * de la seccion sin pelear con el texto que va encima, y de noche se nota
 * igual que de dia, que era el reclamo.
 */
export const toneWash: Record<Tone, string> = {
  brand: 'from-brand-500/22 via-brand-500/5 dark:from-brand-500/28 dark:via-brand-500/8',
  accent: 'from-accent-500/28 via-accent-500/6 dark:from-accent-500/22 dark:via-accent-500/6',
  info: 'from-info-500/20 via-info-500/5 dark:from-info-500/25 dark:via-info-500/6',
  success: 'from-success-500/20 via-success-500/5 dark:from-success-500/25 dark:via-success-500/6',
  warning: 'from-warning-500/24 via-warning-500/6 dark:from-warning-500/22 dark:via-warning-500/6',
  danger: 'from-danger-500/18 via-danger-500/4 dark:from-danger-500/22 dark:via-danger-500/6',
  neutral: 'from-ink-3/18 via-ink-3/4 dark:from-ink-3/22 dark:via-ink-3/6',
};

/** Solo color de texto. */
export const toneText: Record<Tone, string> = {
  brand: 'text-brand-600 dark:text-brand-300',
  accent: 'text-accent-700 dark:text-accent-300',
  info: 'text-info-700 dark:text-ink-2',
  success: 'text-success-700 dark:text-success-500',
  warning: 'text-warning-700 dark:text-warning-500',
  danger: 'text-danger-700 dark:text-ink',
  neutral: 'text-ink-2',
};

/**
 * Realce pleno sobre el acento amarillo, con el texto oscuro obligatorio.
 * Reservado a momentos que deben saltar a la vista: destacados y pendientes.
 * `text-on-accent` es fijo en ambos temas: el amarillo no cambia con el modo.
 */
export const accentSolid = 'bg-accent-500 text-on-accent';
