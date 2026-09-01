import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarClock, FileQuestion, QrCode as QrIcon, ScrollText, Store } from 'lucide-react';
import { formatDate } from '@/core/utils/date';
import {
  AppImage,
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  MetaRow,
  Page,
  Prose,
  SectionHeader,
  Skeleton,
} from '@/ui';
import { isRedeemable, useBenefit } from './api';
import { BenefitQrSheet } from './components/BenefitQrSheet';

/* Ficha del beneficio: primero se explica de qué se trata y recién después se
   entrega el código. El botón de canje queda fijo al pie en móvil, para poder
   abrirlo con el pulgar mientras se está en la caja del comercio. */

export function BenefitDetailPage() {
  const { id } = useParams();
  const { data: benefit, isLoading } = useBenefit(id);
  const [qrOpen, setQrOpen] = useState(false);

  if (isLoading) {
    return (
      <Page>
        <Skeleton className="mb-4 h-20 w-20 rounded-2xl" />
        <Skeleton className="mb-2 h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </Page>
    );
  }

  if (!benefit) {
    return (
      <Page>
        <EmptyState
          icon={FileQuestion}
          title="Beneficio no encontrado"
          description="Es posible que el convenio haya terminado o que el enlace no sea válido."
          action={<ButtonLink to="/colaboradores">Volver a colaboradores</ButtonLink>}
        />
      </Page>
    );
  }

  const available = isRedeemable(benefit);

  return (
    <Page>
      <header className="mb-5 flex gap-4">
        <div className="w-20 shrink-0">
          <AppImage
            imageKey={benefit.logoImageKey}
            ratio="1/1"
            compact
            fallback={<Avatar name={benefit.partner} size="xl" className="rounded-2xl" />}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold uppercase tracking-wide text-ink-3">
            {benefit.partner}
          </p>
          <h1 className="mt-1 text-[23px] font-extrabold leading-[1.15] tracking-tight text-ink">
            {benefit.name}
          </h1>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Badge tone="neutral">{benefit.category}</Badge>
            {available ? (
              <Badge tone="accent" icon={QrIcon}>
                Canjeable
              </Badge>
            ) : (
              <Badge tone="danger">No disponible</Badge>
            )}
          </div>
        </div>
      </header>

      <section className="mb-6">
        <SectionHeader title="De qué se trata" />
        <Prose text={benefit.description} />
      </section>

      {benefit.terms ? (
        <section className="mb-6">
          <SectionHeader title="Condiciones de uso" />
          <Card>
            <div className="flex gap-3">
              <ScrollText size={17} className="mt-0.5 shrink-0 text-ink-3" />
              <p className="text-[13.5px] leading-relaxed text-ink-2">{benefit.terms}</p>
            </div>
          </Card>
        </section>
      ) : null}

      <Card className="mb-6">
        <MetaRow icon={Store} label="Dónde se canjea" value={benefit.partner} />
        <MetaRow
          icon={CalendarClock}
          label="Vigencia"
          value={
            benefit.validUntil
              ? `Hasta el ${formatDate(benefit.validUntil)}`
              : 'Sin fecha de término definida'
          }
        />
      </Card>

      {/* Espacio reservado para la barra fija de abajo: `cn` no resuelve clases
          en conflicto, así que se reserva con un separador en vez de cambiar
          el relleno inferior de `Page`. */}
      <div aria-hidden className="h-9 lg:hidden" />

      {/* Acción principal. Fija al pie en móvil, sobre la barra de navegación. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface px-4 pb-[calc(env(safe-area-inset-bottom)+4.75rem)] pt-3 lg:static lg:border-0 lg:bg-transparent lg:p-0">
        <div className="mx-auto w-full max-w-3xl">
          <Button
            size="lg"
            icon={QrIcon}
            disabled={!available}
            onClick={() => setQrOpen(true)}
            className="w-full"
          >
            ¡Mostrar QR!
          </Button>
          {!available ? (
            <p className="mt-2 text-center text-[12px] text-ink-3">
              Este beneficio ya no está vigente.
            </p>
          ) : null}
        </div>
      </div>

      <BenefitQrSheet open={qrOpen} onClose={() => setQrOpen(false)} benefit={benefit} />
    </Page>
  );
}
