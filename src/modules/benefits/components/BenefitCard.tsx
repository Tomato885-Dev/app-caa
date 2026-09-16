import { Clock, Globe, KeyRound, ListChecks, QrCode, Ticket, type LucideIcon } from 'lucide-react';
import type { RedeemMethod } from '@/core/types';
import type { Benefit } from '@/core/types';
import { AppImage, Avatar, Badge, CardLink } from '@/ui';
import { isRedeemable } from '../api';
import { ETIQUETA_DEL_CANJE, diasParaVencer } from '../canje';

const ICONO_DEL_CANJE: Record<RedeemMethod, LucideIcon> = {
  codigo: KeyRound,
  qr: QrCode,
  enlace: Globe,
  indicaciones: ListChecks,
};

/** Tarjeta del listado de colaboradores: quién es y qué beneficio entrega. */
export function BenefitCard({ benefit }: { benefit: Benefit }) {
  const available = isRedeemable(benefit);
  const quedan = available ? diasParaVencer(benefit.validUntil) : null;
  const forma = benefit.redeem?.method;

  return (
    <CardLink to={`/colaboradores/${benefit.id}`}>
      <div className="flex gap-3.5">
        {/* Mientras no exista el archivo del logotipo se muestran las
            iniciales, no un hueco punteado: casi todos los colaboradores se
            cargan antes de conseguir su logo. */}
        <div className="w-16 shrink-0">
          <AppImage
            imageKey={benefit.logoImageKey}
            ratio="1/1"
            compact
            fit="contain"
            fallback={<Avatar name={benefit.partner} size="lg" className="rounded-xl" />}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[11.5px] font-bold uppercase tracking-wide text-ink-3">
            {benefit.partner}
          </p>

          <h3 className="mt-0.5 line-clamp-2 text-[15.5px] font-bold leading-snug text-ink">
            {benefit.name}
          </h3>

          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-2">
            {benefit.summary}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{benefit.category}</Badge>
            {/* Cómo se canjea, de un vistazo: así se sabe antes de ir al local
                si hay que llevar un código, mostrar un QR o comprar en línea. */}
            {available ? (
              <Badge tone="accent" icon={forma ? ICONO_DEL_CANJE[forma] : Ticket}>
                {forma ? ETIQUETA_DEL_CANJE[forma] : 'Canjeable'}
              </Badge>
            ) : (
              <Badge tone="danger">No disponible</Badge>
            )}
            {quedan !== null ? (
              <Badge tone="warning" icon={Clock}>
                {quedan === 0 ? 'Vence hoy' : quedan === 1 ? 'Vence mañana' : `Vence en ${quedan} días`}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
    </CardLink>
  );
}
