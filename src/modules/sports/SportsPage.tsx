import { useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { sportDisciplines, sportLevels } from '@/content/taxonomies';
import type { SportDiscipline, SportLevel } from '@/core/types';
import {
  Card,
  CardListSkeleton,
  EmptyState,
  FilterChips,
  Page,
  PageHeader,
  SegmentedTabs,
} from '@/ui';
import { recordOf, sortResults, useSportsResults } from './api';
import { ResultCard } from './components/ResultCard';

/* ============================================================================
   365 · SELECCIONES DEL COLEGIO
   ----------------------------------------------------------------------------
   Cinco disciplinas por tres categorías. El filtro es de dos niveles: primero
   la disciplina, después la categoría, porque así es como los estudiantes
   buscan "cómo le fue a mi selección".

   Las listas de disciplinas y categorías viven en `src/content/taxonomies.ts`:
   sumar una selección nueva no requiere tocar esta pantalla.
   ========================================================================== */

const ALL = 'todas';

export function SportsPage() {
  const { data, isLoading } = useSportsResults();
  const [discipline, setDiscipline] = useState<string>(ALL);
  const [level, setLevel] = useState<string>(ALL);

  const results = useMemo(() => sortResults(data ?? []), [data]);

  const byDiscipline = useMemo(
    () =>
      discipline === ALL
        ? results
        : results.filter((item) => item.discipline === (discipline as SportDiscipline)),
    [results, discipline],
  );

  const filtered = useMemo(
    () => (level === ALL ? byDiscipline : byDiscipline.filter((item) => item.level === (level as SportLevel))),
    [byDiscipline, level],
  );

  const record = useMemo(() => recordOf(filtered), [filtered]);

  const disciplineOptions = useMemo(
    () => [
      { value: ALL, label: 'Todas', count: results.length },
      ...sportDisciplines
        .map((option) => ({
          value: option.value,
          label: option.label,
          count: results.filter((item) => item.discipline === option.value).length,
        }))
        .filter((option) => option.count > 0),
    ],
    [results],
  );

  const levelOptions = useMemo(
    () => [
      { value: ALL, label: 'Todas', count: byDiscipline.length },
      ...sportLevels.map((option) => ({
        value: option.value,
        label: option.label,
        count: byDiscipline.filter((item) => item.level === option.value).length,
      })),
    ],
    [byDiscipline],
  );

  return (
    <Page>
      <PageHeader
        title="365"
        description="Resultados de las selecciones del colegio, por disciplina y categoría."
      />

      <FilterChips
        options={disciplineOptions}
        value={discipline}
        onChange={setDiscipline}
        className="mb-3"
      />

      <SegmentedTabs options={levelOptions} value={level} onChange={setLevel} className="mb-5" />

      {/* Balance de lo que se está mirando ahora mismo. */}
      {record.total > 0 ? (
        <Card className="mb-5">
          <div className="grid grid-cols-4 divide-x divide-line text-center">
            <Stat value={record.victorias} label="Ganados" />
            <Stat value={record.empates} label="Empatados" />
            <Stat value={record.derrotas} label="Perdidos" />
            <Stat value={record.participaciones} label="Participaciones" />
          </div>
        </Card>
      ) : null}

      {isLoading ? (
        <CardListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Sin resultados registrados"
          description="Todavía no hay resultados publicados para esta selección."
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      )}
    </Page>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="px-1">
      <p className="text-[22px] font-extrabold leading-none text-ink">{value}</p>
      <p className="mt-1 text-[11px] font-medium leading-tight text-ink-2">{label}</p>
    </div>
  );
}
