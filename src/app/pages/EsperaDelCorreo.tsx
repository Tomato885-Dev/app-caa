import { useEffect, useState } from 'react';
import { Clock, MailQuestion } from 'lucide-react';

/* ============================================================================
   EL CORREO SE DEMORA
   ----------------------------------------------------------------------------
   El código de activación o de recuperación tarda hasta un par de minutos en
   llegar. Sin avisarlo, la gente pensaba que no había llegado, pedía otro
   código —que anula el anterior— o cerraba la app y quedaba a medio activar.

   Por eso se dice ANTES de que se impacienten, con un contador a la vista, y
   el botón de pedir otro código espera a que pase ese tiempo.
   ========================================================================== */

/** Lo que puede tardar el correo, en segundos. Se comprobó que ronda los 2 min. */
export const DEMORA_DEL_CORREO = 180;

export function segundosDesde(inicio: number): number {
  return Math.max(0, Math.floor((Date.now() - inicio) / 1000));
}

/** Reloj de un segundo, para contadores. */
export function useSegundosDesde(inicio: number): number {
  const [segundos, setSegundos] = useState(() => segundosDesde(inicio));
  useEffect(() => {
    setSegundos(segundosDesde(inicio));
    const reloj = window.setInterval(() => setSegundos(segundosDesde(inicio)), 1000);
    return () => window.clearInterval(reloj);
  }, [inicio]);
  return segundos;
}

const reloj = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function EsperaDelCorreo({ enviadoEn }: { enviadoEn: number }) {
  const segundos = useSegundosDesde(enviadoEn);
  const yaDeberia = segundos >= DEMORA_DEL_CORREO;
  const avance = Math.min(1, segundos / DEMORA_DEL_CORREO);

  if (yaDeberia) {
    return (
      <div className="flex gap-3 rounded-field border border-line bg-surface-2 p-3.5">
        <MailQuestion size={18} className="mt-0.5 shrink-0 text-ink-3" />
        <p className="text-[13px] leading-relaxed text-ink-2">
          <span className="font-bold text-ink">¿Todavía no llega?</span> Revisa la carpeta de spam
          y la de correo no deseado. Si no está, pide otro código abajo.
        </p>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="rounded-field border border-accent-500/60 bg-accent-100 p-3.5 dark:bg-accent-950"
    >
      <div className="flex gap-3">
        <Clock size={18} className="mt-0.5 shrink-0 text-accent-700 dark:text-accent-300" />
        <p className="text-[13px] leading-relaxed text-ink">
          <span className="font-bold">El correo puede tardar hasta 3 minutos en llegar.</span>{' '}
          No cierres la app ni pidas otro código mientras tanto.
        </p>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-accent-500/25" aria-hidden>
          <div
            className="h-full rounded-full bg-accent-500 transition-[width] duration-1000 ease-linear"
            style={{ width: `${avance * 100}%` }}
          />
        </div>
        <span className="text-[12px] font-semibold tabular-nums text-accent-700 dark:text-accent-300">
          Enviado hace {reloj(segundos)}
        </span>
      </div>
    </div>
  );
}
