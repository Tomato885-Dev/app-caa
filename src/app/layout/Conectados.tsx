import { useConectados } from '@/core/presencia/useConectados';
import { useAjustes } from '@/modules/admin/ajustes';
import { cn } from '@/ui';

/* ============================================================================
   CUÁNTOS ESTÁN EN LA APP AHORA
   ----------------------------------------------------------------------------
   Una pastilla chica en la barra de arriba, con un punto verde que late. No
   dice quiénes son —eso no se manda nunca, ver `useConectados`—, solo cuántos.

   Aparece si se dan las tres cosas: el equipo lo encendió en Administración,
   hay servidor, y ya llegó el número. Si falta cualquiera, no se dibuja nada;
   un hueco donde debería ir un dato se ve peor que no ponerlo.
   ========================================================================== */

export function Conectados({ className }: { className?: string }) {
  const { valores } = useAjustes();
  const cuantos = useConectados(valores.mostrarConectados);

  if (!valores.mostrarConectados || cuantos === null || cuantos < 1) return null;

  return (
    <span
      title={`${cuantos} ${cuantos === 1 ? 'persona tiene' : 'personas tienen'} la app abierta ahora`}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1',
        className,
      )}
    >
      <span aria-hidden className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500 opacity-75" />
        <span className="relative inline-flex size-1.5 rounded-full bg-brand-500" />
      </span>
      <span className="text-[11.5px] font-bold tabular-nums text-ink-2">{cuantos}</span>
      <span className="sr-only">
        {cuantos === 1 ? 'persona conectada' : 'personas conectadas'}
      </span>
    </span>
  );
}
