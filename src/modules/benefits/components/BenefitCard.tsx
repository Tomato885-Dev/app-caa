import { Clock, Globe, KeyRound, ListChecks, QrCode, Ticket, type LucideIcon } from 'lucide-react';
import type { RedeemMethod } from '@/core/types';
import type { Benefit } from '@/core/types';
import { CardLink, cn } from '@/ui';
import { isRedeemable } from '../api';
import { ETIQUETA_DEL_CANJE, diasParaVencer } from '../canje';
import { LogoDelColaborador } from './LogoDelColaborador';

const ICONO_DEL_CANJE: Record<RedeemMethod, LucideIcon> = {
  codigo: KeyRound,
  qr: QrCode,
  enlace: Globe,
  indicaciones: ListChecks,
};

/* ============================================================================
   TARJETA DE UN COLABORADOR
   ----------------------------------------------------------------------------
   En dos columnas y con el logo grande arriba, como una vitrina. Antes era una
   lista de filas y se leía como una planilla: todas iguales, el logo chico a
   un costado y el ojo sin dónde detenerse.

   Lo que se reconoce de un convenio es la marca, así que el logo manda: va
   centrado, sobre blanco y del mismo porte en todas (ver
   `LogoDelColaborador`). Debajo, el beneficio en grande —que es lo que se
   busca— y al pie, en una franja, cómo se canjea.
   ========================================================================== */

export function BenefitCard({ benefit }: { benefit: Benefit }) {
  const available = isRedeemable(benefit);
  const quedan = available ? diasParaVencer(benefit.validUntil) : null;
  const forma = benefit.redeem?.method;
  const IconoCanje = forma ? ICONO_DEL_CANJE[forma] : Ticket;
  const porVencer = quedan !== null && quedan <= 3;

  return (
    <CardLink to={`/colaboradores/${benefit.id}`} flush className="group flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center px-3 pb-3 pt-4 text-center">
        <LogoDelColaborador
          benefit={benefit}
          className="w-[76px] transition duration-200 group-hover:-translate-y-0.5 group-hover:rotate-[-3deg]"
        />

        <p className="mt-3 line-clamp-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-3">
          {benefit.partner}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-[14.5px] font-extrabold leading-tight tracking-tight text-ink">
          {benefit.name}
        </h3>

        {/* La vigencia solo cuando aprieta: si falta un mes, no es noticia. */}
        {porVencer ? (
          <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-danger-500">
            <Clock size={11} />
            {quedan === 0 ? 'Vence hoy' : quedan === 1 ? 'Vence mañana' : `Quedan ${quedan} días`}
          </p>
        ) : null}
      </div>

      {/* La franja del pie: de un vistazo se sabe si hay que llevar un código,
          mostrar un QR o comprar en línea. */}
      <p
        className={cn(
          'flex items-center justify-center gap-1.5 px-2 py-2 text-[11.5px] font-bold',
          available
            ? 'bg-accent-500/15 text-accent-700 dark:bg-accent-500/12 dark:text-accent-300'
            : 'bg-surface-3 text-ink-3',
        )}
      >
        {available ? (
          <>
            <IconoCanje size={13} />
            {forma ? ETIQUETA_DEL_CANJE[forma] : 'Canjeable'}
          </>
        ) : (
          'No disponible'
        )}
      </p>
    </CardLink>
  );
}
