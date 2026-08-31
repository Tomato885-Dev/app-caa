import { QrCode } from 'lucide-react';
import type { Benefit } from '@/core/types';
import { AppImage, Badge, CardLink } from '@/ui';
import { isRedeemable } from '../api';

/** Tarjeta del listado de beneficios: logo del comercio + qué ofrece. */
export function BenefitCard({ benefit }: { benefit: Benefit }) {
  const available = isRedeemable(benefit);

  return (
    <CardLink to={`/beneficios/${benefit.id}`}>
      <div className="flex gap-3.5">
        <div className="w-16 shrink-0">
          <AppImage imageKey={benefit.logoImageKey} ratio="1/1" compact />
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
