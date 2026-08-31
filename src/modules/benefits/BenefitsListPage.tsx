import { useMemo, useState } from 'react';
import { Search, Ticket } from 'lucide-react';
import { benefitCategories } from '@/content/taxonomies';
import { matchesSearch } from '@/core/utils/text';
import { CardListSkeleton, EmptyState, FilterChips, Input, Page, PageHeader } from '@/ui';
import { sortBenefits, useBenefitList } from './api';
import { BenefitCard } from './components/BenefitCard';

/* ============================================================================
   BENEFICIOS
   ----------------------------------------------------------------------------
   Convenios conseguidos por la campaña. Al abrir uno se explica de qué se
   trata y, con un botón, se muestra el código QR a pantalla completa para
   canjearlo en el comercio.

   La plataforma no valida canjes ni procesa pagos: solo entrega el código.
   ========================================================================== */

const ALL = 'todos';

export function BenefitsListPage() {
  const { data, isLoading } = useBenefitList();
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState('');

  const benefits = useMemo(() => sortBenefits(data ?? []), [data]);

  const filtered = useMemo(
    () =>
      benefits.filter(
        (benefit) =>
          (category === ALL || benefit.category === category) &&
          matchesSearch(query, benefit.name, benefit.partner, benefit.summary, benefit.description),
      ),
    [benefits, category, query],
  );

  const options = useMemo(
    () => [
      { value: ALL, label: 'Todos', count: benefits.length },
      ...benefitCategories
        .map((name) => ({
          value: name,
          label: name,
          count: benefits.filter((benefit) => benefit.category === name).length,
        }))
        .filter((option) => option.count > 0),
    ],
    [benefits],
  );

  return (
    <Page>
      <PageHeader
        title="Beneficios"
        description="Convenios de la campaña. Abre uno y muestra su código QR para canjearlo."
      />

      <div className="relative mb-3">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar un beneficio o comercio"
          aria-label="Buscar beneficios"
          className="pl-10"
        />
      </div>

      <FilterChips options={options} value={category} onChange={setCategory} className="mb-5" />

      {isLoading ? (
        <CardListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Sin beneficios disponibles"
          description="Cuando el Centro de Alumnos cierre un convenio, aparecerá aquí."
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((benefit) => (
            <BenefitCard key={benefit.id} benefit={benefit} />
          ))}
        </div>
      )}
    </Page>
  );
}
