import { useParams } from 'react-router-dom';
import { CalendarClock, Clock, FileQuestion, ScrollText, Store, Ticket } from 'lucide-react';
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
import { diasParaVencer, terminoDelConvenio } from './canje';
import { ComoCanjear } from './components/ComoCanjear';

/* ============================================================================
   FICHA DEL COLABORADOR
   ----------------------------------------------------------------------------
   Quién es, qué entrega, CÓMO SE CANJEA y hasta cuándo. Lo del canje va
   antes que las condiciones porque es lo que se busca parado en la caja.

   AQUÍ HUBO UN CÓDIGO INVENTADO
   Primero cada convenio tenía un QR que ningún local escaneaba, y después un
   "código de canje" que inventaba el Centro de Alumnos y el local no conocía.
   Ahora cada convenio dice su propia forma, la que definió el local: un
   código, un QR, una tienda en línea o unos pasos (ver `canje.ts`).
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
  const termino = terminoDelConvenio(benefit.validUntil);
  const quedan = available ? diasParaVencer(benefit.validUntil) : null;

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
            {quedan !== null ? (
              <Badge tone="warning" icon={Clock}>
                {quedan === 0 ? 'Vence hoy' : quedan === 1 ? 'Vence mañana' : `Vence en ${quedan} días`}
              </Badge>
            ) : null}
          </div>
        </div>
      </header>

      <section className="mb-6">
        <SectionHeader title="De qué se trata" />
        <Prose text={benefit.description} />
      </section>

      {available && benefit.redeem ? <ComoCanjear benefit={benefit} redeem={benefit.redeem} /> : null}

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
            termino
              ? `Hasta el ${formatDate(termino)}`
              : 'Sin fecha de término definida'
          }
        />
      </Card>

    </Page>
  );
}
