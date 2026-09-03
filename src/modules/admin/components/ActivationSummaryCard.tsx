import { Download, UserCheck } from 'lucide-react';
import { formatRelative } from '@/core/utils/date';
import { Button, Card } from '@/ui';
import type { ActivationSummary } from '../activaciones';

/* ============================================================================
   CÓMO VA LA LLEGADA DE LA APLICACIÓN
   ----------------------------------------------------------------------------
   Cuántos compañeros ya activaron su cuenta, y en qué cursos falta.

   POR QUÉ POR CURSO Y NO SOLO EL TOTAL
   Un número solo dice si vamos bien o mal; el desglose dice qué hacer. Ver que
   un curso entero está en cero es lo que hace ir a hablar con ese curso, que
   es el único uso real que tiene este panel.
   ========================================================================== */

export function ActivationSummaryCard({
  summary,
  onDownload,
}: {
  summary: ActivationSummary;
  onDownload: () => void;
}) {
  const { activated, enrolled, lastActivation, byCourse } = summary;
  const porcentaje = enrolled && enrolled > 0 ? Math.round((activated / enrolled) * 100) : null;

  /* Solo los cursos donde falta gente, y como mucho seis. Los completos no
     piden ninguna acción, y listar los veinticuatro empujaría las cuentas
     fuera de la pantalla justo cuando se entra a buscar una. La lista entera,
     para llevar a una reunión, está en el archivo que se descarga. */
  const pendientes = byCourse.filter((row) => row.total !== null && row.activated < row.total);
  const MAXIMO = 6;
  const visibles = pendientes.slice(0, MAXIMO);
  const restantes = pendientes.length - visibles.length;

  return (
    <Card className="mb-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          <UserCheck size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-ink">Cuentas activadas</p>

          <p className="mt-1 text-[26px] font-bold leading-none text-ink">
            {activated}
            {enrolled !== null ? (
              <span className="text-[15px] font-semibold text-ink-3"> de {enrolled}</span>
            ) : null}
          </p>

          <p className="mt-1.5 text-[12px] text-ink-2">
            {enrolled === null
              ? 'No se pudo leer la nómina para saber cuántos faltan.'
              : activated === 0
                ? 'Todavía no ha entrado nadie.'
                : porcentaje + '% de los habilitados ya entró a la aplicación.'}
          </p>

          {lastActivation ? (
            <p className="mt-1 text-[11.5px] text-ink-3">
              La última, {formatRelative(lastActivation)}.
            </p>
          ) : null}
        </div>
      </div>

      {porcentaje !== null ? (
        <div
          className="mt-3.5 h-2 overflow-hidden rounded-full bg-surface-3"
          role="img"
          aria-label={activated + ' de ' + enrolled + ' cuentas activadas'}
        >
          <div className="h-full rounded-full bg-brand-500" style={{ width: porcentaje + '%' }} />
        </div>
      ) : null}

      {pendientes.length > 0 ? (
        <div className="mt-4">
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-3">
            Dónde falta gente
          </p>
          <ul className="mt-2 space-y-1.5">
            {visibles.map((row) => (
              <li key={row.grade} className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[13px] text-ink-2">{row.grade}</span>
                <span className="shrink-0 text-[12.5px] tabular-nums text-ink-3">
                  {row.activated} de {row.total}
                </span>
              </li>
            ))}
          </ul>

          {restantes > 0 ? (
            <p className="mt-2 text-[11.5px] text-ink-3">
              Y {restantes} {restantes === 1 ? 'curso más' : 'cursos más'}. Están todos en el
              archivo.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[11px] leading-relaxed text-ink-3">
          El archivo lleva nombres y correos: guárdalo con cuidado.
        </p>
        <Button size="sm" variant="secondary" icon={Download} onClick={onDownload}>
          Descargar
        </Button>
      </div>
    </Card>
  );
}
