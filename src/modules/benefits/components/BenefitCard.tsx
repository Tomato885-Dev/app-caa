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
   Quién es, qué entrega y cómo se canjea, en ese orden. El logo manda: es lo
   que se reconoce de una pasada, así que va grande, parejo y sobre blanco
   (ver `LogoDelColaborador`).

   Las etiquetas de abajo se dejaron en un solo tono tranquilo. Antes el canje
   iba en amarillo fuerte y se comía la tarjeta entera; lo que importa ahí es
   el nombre del local, no cómo se canjea.
   ========================================================================== */

export function BenefitCard({ benefit }: { benefit: Benefit }) {
  const available = isRedeemable(benefit);
  const quedan = available ? diasParaVencer(benefit.validUntil) : null;
  const forma = benefit.redeem?.method;
  const IconoCanje = forma ? ICONO_DEL_CANJE[forma] : Ticket;

  return (
    <CardLink to={`/colaboradores/${benefit.id}`} className="group">
      <div className="flex items-center gap-3.5">
        <LogoDelColaborador
          benefit={benefit}
          className="w-[72px] transition group-hover:scale-[1.03]"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">
            {benefit.partner}
          </p>

          <h3 className="mt-0.5 line-clamp-2 text-[15.5px] font-bold leading-snug text-ink">
            {benefit.name}
          </h3>

          {benefit.summary ? (
            <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-2">
              {benefit.summary}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] font-medium text-ink-3">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />
              {benefit.category}
            </span>

            {/* Cómo se canjea, de un vistazo: así se sabe antes de ir al local
                si hay que llevar un código, mostrar un QR o comprar en línea. */}
            {available ? (
              <span className="inline-flex items-center gap-1.5">
                <IconoCanje size={13} />
                {forma ? ETIQUETA_DEL_CANJE[forma] : 'Canjeable'}
              </span>
            ) : (
              <span className="font-semibold text-danger-500">No disponible</span>
            )}

            {quedan !== null ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 font-semibold',
                  quedan <= 3 ? 'text-danger-500' : 'text-ink-3',
                )}
              >
                <Clock size={13} />
                {quedan === 0 ? 'Vence hoy' : quedan === 1 ? 'Vence mañana' : `Vence en ${quedan} días`}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </CardLink>
  );
}
