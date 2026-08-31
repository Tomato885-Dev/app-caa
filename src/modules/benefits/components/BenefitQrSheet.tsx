import { Sun } from 'lucide-react';
import type { Benefit } from '@/core/types';
import { formatDate } from '@/core/utils/date';
import { QrCode, Sheet } from '@/ui';

/* ============================================================================
   CÓDIGO DE CANJE
   ----------------------------------------------------------------------------
   Se muestra a pantalla completa para que el comercio pueda leerlo sin
   dificultad. El código va sobre blanco fijo (ver `src/ui/QrCode.tsx`) porque
   los lectores necesitan contraste oscuro sobre claro, también de noche.
   ========================================================================== */

export function BenefitQrSheet({
  open,
  onClose,
  benefit,
}: {
  open: boolean;
  onClose: () => void;
  benefit: Benefit;
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Código de canje"
      description={`${benefit.name} · ${benefit.partner}`}
    >
      <div className="mx-auto max-w-xs">
        {/* Marco blanco alrededor del código: aísla el QR del fondo de la hoja
            y garantiza la zona de silencio incluso en modo oscuro. */}
        <div className="rounded-3xl bg-white p-4 shadow-card">
          <QrCode
            value={benefit.qrValue}
            label={`Código QR del beneficio ${benefit.name} en ${benefit.partner}`}
          />
        </div>

        {benefit.code ? (
          <div className="mt-4 text-center">
            <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">
              Código
            </p>
            <p className="mt-1 select-all break-all font-mono text-[15px] font-bold text-ink">
              {benefit.code}
            </p>
          </div>
        ) : null}

        <p className="mt-4 flex items-start gap-2 rounded-field bg-surface-2 p-3 text-[12.5px] leading-relaxed text-ink-2">
          <Sun size={15} className="mt-0.5 shrink-0 text-ink-3" />
          <span>
            Sube el brillo de la pantalla y muestra este código en caja. Si el lector no lo toma,
            dicta el código escrito.
          </span>
        </p>

        {benefit.validUntil ? (
          <p className="mt-2.5 text-center text-[12px] text-ink-3">
            Válido hasta el {formatDate(benefit.validUntil)}
          </p>
        ) : null}
      </div>
    </Sheet>
  );
}
