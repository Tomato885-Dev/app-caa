import { useParams } from 'react-router-dom';
import { CalendarClock, Clock, FileQuestion, ScrollText, Store } from 'lucide-react';
import { formatDate } from '@/core/utils/date';
import {
  ButtonLink,
  Card,
  EmptyState,
  MetaRow,
  Page,
  Prose,
  SectionHeader,
  Skeleton,
  cn,
} from '@/ui';
import { isRedeemable, useBenefit } from './api';
import { diasParaVencer, terminoDelConvenio } from './canje';
import { ComoCanjear } from './components/ComoCanjear';
import { LogoDelColaborador } from './components/LogoDelColaborador';

/* ============================================================================
   FICHA DEL COLABORADOR
   ----------------------------------------------------------------------------
   Se abre parado en la caja, así que lo primero es reconocer el local —el
   logo, grande— y lo segundo es la acción: el código, el QR o el botón a la
   tienda. Todo lo demás viene después.

   AQUÍ HUBO UN CÓDIGO INVENTADO
   Primero cada convenio tenía un QR que ningún local escaneaba, y después un
   "código de canje" que inventaba el Centro de Alumnos y el local no conocía.
   Ahora cada convenio dice su propia forma, la que definió el local (ver
   `canje.ts`), y esa forma va integrada en la ficha, sin un recuadro aparte.
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
      {/* Portada: el logo y el nombre del beneficio, sin nada entremedio. */}
      <header className="mb-5 overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <div className="relative flex gap-4 p-4">
          {/* El verde de fondo da el aire de la app sin tapar el logo. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-500/12 to-transparent"
          />

          <LogoDelColaborador benefit={benefit} className="relative w-[84px]" />

          <div className="relative min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">
              {benefit.partner}
            </p>
            <h1 className="mt-1 text-[22px] font-extrabold leading-[1.15] tracking-tight text-ink">
              {benefit.name}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] font-medium text-ink-3">
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />
                {benefit.category}
              </span>
              {quedan !== null ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 font-semibold',
                    quedan <= 3 ? 'text-danger-500' : 'text-ink-3',
                  )}
                >
                  <Clock size={13} />
                  {quedan === 0
                    ? 'Vence hoy'
                    : quedan === 1
                      ? 'Vence mañana'
                      : `Vence en ${quedan} días`}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {benefit.summary.trim() ? (
          <p className="border-t border-line bg-surface-2 px-4 py-3 text-[13.5px] font-medium leading-relaxed text-ink">
            {benefit.summary}
          </p>
        ) : null}
      </header>

      {/* La acción, apenas debajo de la portada: es a lo que se viene. */}
      {available && benefit.redeem ? (
        <ComoCanjear benefit={benefit} redeem={benefit.redeem} />
      ) : null}

      {!available ? (
        <Card className="mb-5 border-danger-500/30">
          <p className="text-center text-[13px] font-semibold text-danger-500">
            Este beneficio ya no está vigente.
          </p>
        </Card>
      ) : null}

      {benefit.description.trim() ? (
        <section className="mb-6">
          <SectionHeader title="De qué se trata" />
          <Prose text={benefit.description} />
        </section>
      ) : null}

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
          value={termino ? `Hasta el ${formatDate(termino)}` : 'Sin fecha de término definida'}
        />
      </Card>
    </Page>
  );
}
