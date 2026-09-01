import { QrCode } from 'lucide-react';
import type { Benefit } from '@/core/types';
import { AppImage, Avatar, Badge, CardLink } from '@/ui';
import { isRedeemable } from '../api';

/** Tarjeta del listado de colaboradores: quién es y qué beneficio entrega. */
export function BenefitCard({ benefit }: { benefit: Benefit }) {
  const available = isRedeemable(benefit);

  return (
    <CardLink to={`/colaboradores/${benefit.id}`}>
      <div className="flex gap-3.5">
        {/* Sin logotipo se muestran las iniciales, no un marcador vacío: la
            mayoría de los colaboradores se cargan antes de tener su logo. */}
        {benefit.logoImageKey ? (
          <div className="w-16 shrink-0">
            <AppImage imageKey={benefit.logoImageKey} ratio="1/1" compact />
          </div>
        ) : (
          <Avatar name={benefit.partner} size="lg" className="shrink-0 rounded-xl" />
        )}

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
            {available ? (
              <Badge tone="accent" icon={QrCode}>
                Canjeable
              </Badge>
            ) : (
              <Badge tone="danger">No disponible</Badge>
            )}
          </div>
        </div>
      </div>
    </CardLink>
  );
}
