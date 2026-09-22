import { useParams } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { ButtonLink, EmptyState, Page, Prose, SectionHeader, Skeleton } from '@/ui';
import { useBenefit } from './api';
import { LogoDelColaborador } from './components/LogoDelColaborador';

/* ============================================================================
   FICHA DEL COLABORADOR
   ----------------------------------------------------------------------------
   El colaborador se presenta y ya está: quién es, y de qué se trata.
   Antes esta ficha era el mostrador de un canjeo —código, QR, vigencia, dónde
   canjear, condiciones—; el sistema no cuajó con los locales y se le sacaron
   todas esas piezas. Se dejan por dentro (ver `Benefit` en el modelo) por si
   algún convenio vuelve a traer descuento, pero acá no se muestran.

   LA PORTADA MANDA
   Se abre parado en el logo, con el nombre del local y del beneficio grande.
   Debajo, lo único que importa: la descripción.
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
          title="Colaborador no encontrado"
          description="Es posible que ya no aparezca en el listado o que el enlace no sea válido."
          action={<ButtonLink to="/colaboradores">Volver a colaboradores</ButtonLink>}
        />
      </Page>
    );
  }

  return (
    <Page>
      {/* Portada: el logo y el nombre del colaborador, sin nada entremedio. */}
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

            <p className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.08em] text-brand-600 dark:text-brand-300">
              <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />
              Colaborador
            </p>
          </div>
        </div>

        {benefit.summary.trim() ? (
          <p className="border-t border-line bg-surface-2 px-4 py-3 text-[13.5px] font-medium leading-relaxed text-ink">
            {benefit.summary}
          </p>
        ) : null}
      </header>

      {benefit.description.trim() ? (
        <section className="mb-6">
          <SectionHeader title="De qué se trata" />
          <Prose text={benefit.description} />
        </section>
      ) : null}
    </Page>
  );
}
