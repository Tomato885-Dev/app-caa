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
