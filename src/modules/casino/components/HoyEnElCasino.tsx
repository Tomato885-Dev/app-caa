import { useMemo } from 'react';
import { ChevronRight, UtensilsCrossed } from 'lucide-react';
import { dayKey, isToday } from '@/core/utils/date';
import { CardLink } from '@/ui';
import { menusPorFecha, useMinutas } from '../api';
import { diaHabilDeReferencia, nombreDelDia } from '../fechas';

/* ============================================================================
   HOY EN EL CASINO
   ----------------------------------------------------------------------------
   La tarjeta de Inicio. Es lo que más gente va a mirar cada día, así que va
   arriba y dice el plato sin tener que entrar.

   Si ese día no hay minuta cargada, o no hay servicio, no se muestra nada: una
   tarjeta que dice "todavía no hay minuta" todos los días es ruido.
   ========================================================================== */

export function HoyEnElCasino() {
  const { data } = useMinutas();
  const dia = useMemo(() => diaHabilDeReferencia(), []);
  const menu = useMemo(() => menusPorFecha(data ?? []).get(dayKey(dia)), [data, dia]);

  // Si ese día no cargaron plato de fondo, se muestra lo primero que haya.
  const destacado = menu && !menu.sinServicio
    ? menu.principal || menu.entrada || menu.alternativa || menu.postre
    : undefined;
  if (!menu || !destacado) return null;

  const mañana = new Date();
  mañana.setDate(mañana.getDate() + 1);
  const cuando = isToday(dia)
    ? 'Hoy'
    : dayKey(dia) === dayKey(mañana)
      ? 'Mañana'
      : `El ${nombreDelDia(dia)}`;

  return (
    <CardLink to="/casino" className="mb-7">
      <div className="flex items-center gap-3.5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300">
          <UtensilsCrossed size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-3">
            {cuando} en el casino
          </p>
          <p className="truncate text-[16px] font-bold text-ink">{destacado}</p>
          {menu.alternativa && menu.alternativa !== destacado ? (
            <p className="truncate text-[12.5px] text-ink-2">Vegetariano: {menu.alternativa}</p>
          ) : null}
        </div>
        <ChevronRight size={18} className="shrink-0 text-ink-3" />
      </div>
    </CardLink>
  );
}
