import { MapPin, Trophy } from 'lucide-react';
import { outcomeTone, sportDisciplineLabel, sportLevelLabel } from '@/content/taxonomies';
import { OUTCOME_LABEL, type SportsResult } from '@/core/types';
import { formatDate } from '@/core/utils/date';
import { Badge, Card, cn, toneSolid } from '@/ui';

/* Tarjeta de resultado. Cuando hay marcador se muestra como un marcador
   deportivo; en atletismo, que no tiene marcador, se reemplaza por el ícono de
   la competencia y el detalle de posiciones. */

export function ResultCard({ result }: { result: SportsResult }) {
  const tone = outcomeTone[result.outcome];
  const hasScore = result.scoreFor !== null && result.scoreAgainst !== null;

  return (
    <Card flush>
      <div className="flex">
        <span aria-hidden className={cn('w-1.5 shrink-0', toneSolid[tone])} />

        <div className="min-w-0 flex-1 p-4">
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <Badge tone={tone}>{OUTCOME_LABEL[result.outcome]}</Badge>
            <span className="text-[11.5px] font-bold uppercase tracking-wide text-ink-3">
              {sportDisciplineLabel[result.discipline]} · {sportLevelLabel[result.level]}
            </span>
            <span className="text-[12px] text-ink-3">{formatDate(result.playedAt)}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14.5px] font-bold leading-snug text-ink">
                {hasScore ? `Selección vs. ${result.opponent}` : result.opponent}
              </p>
              {result.competition ? (
                <p className="mt-0.5 truncate text-[12.5px] text-ink-2">{result.competition}</p>
              ) : null}
            </div>

            {hasScore ? (
              <div
                className="shrink-0 rounded-xl bg-surface-2 px-3 py-1.5 text-center"
                aria-label={`Marcador: ${result.scoreFor} a ${result.scoreAgainst}`}
              >
                <p className="font-mono text-[19px] font-extrabold leading-none text-ink">
                  {result.scoreFor}
                  <span className="mx-1 text-ink-3">:</span>
                  {result.scoreAgainst}
                </p>
              </div>
            ) : (
              <Trophy size={22} className="shrink-0 text-ink-3" />
            )}
          </div>

          {result.highlights ? (
            <p className="mt-2.5 text-[13px] leading-relaxed text-ink-2">{result.highlights}</p>
          ) : null}

          {result.location ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-3">
              <MapPin size={12.5} />
              {result.location}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
