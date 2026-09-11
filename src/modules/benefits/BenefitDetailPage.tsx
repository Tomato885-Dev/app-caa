import { useParams } from 'react-router-dom';
import { CalendarClock, FileQuestion, ScrollText, Store, Ticket } from 'lucide-react';
import { formatDate } from '@/core/utils/date';
import {
  AppImage,
  Avatar,
  Badge,
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

/* ============================================================================
   FICHA DEL BENEFICIO
   ----------------------------------------------------------------------------
   Primero se explica de qué se trata y recién después se entrega el código.

   AQUÍ HUBO UN CÓDIGO QR
   Durante un tiempo cada beneficio mostraba un QR a pantalla completa, pensado
   para que el comercio lo escaneara. Ningún comercio escaneaba nada: no hay
   lector al otro lado ni sistema que valide un canje, así que el estudiante
   enseñaba un cuadro negro que no significaba nada y el cajero lo miraba sin
   saber qué hacer.

   Lo que sí funciona es lo que ya existía como respaldo: un código corto que
   se muestra o se dicta en voz alta, y que el local reconoce porque se lo pasó
   el Centro de Alumnos al cerrar el convenio. Eso es ahora lo único que hay.
   ========================================================================== */

export function BenefitDetailPage() {
  const { id } = useParams();
  const { data: benefit, isLoading } = useBenefit(id);

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
            fit="contain"
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
              <Badge tone="accent" icon={Ticket}>
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

      {/* El codigo de canje, cuando el convenio tiene uno. Va antes de los
          datos del local porque es lo que la persona viene a buscar cuando
          abre esta pantalla estando en la caja.

          `select-all` hace que un toque lo seleccione entero: es mas facil
          copiarlo que leerlo en voz alta sin equivocarse. */}
      {available && benefit.code ? (
        <section className="mb-6">
          <SectionHeader title="Código de canje" />
          <Card>
            <p className="select-all break-all text-center font-mono text-[22px] font-bold tracking-wide text-ink">
              {benefit.code}
            </p>
            <p className="mt-3 text-center text-[12.5px] leading-relaxed text-ink-2">
              Muéstralo o dítalo en caja al pedir el beneficio.
            </p>
          </Card>
        </section>
      ) : null}

      {!available ? (
        <Card className="mb-6 border-danger-500/30">
          <p className="text-center text-[13px] font-semibold text-danger-500">
            Este beneficio ya no está vigente.
          </p>
        </Card>
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

    </Page>
  );
}
