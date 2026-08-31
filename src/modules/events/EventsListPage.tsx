import { useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { eventCategories } from '@/content/taxonomies';
import { approvedOnly } from '@/core/moderation/visibility';
import { monthLabel } from '@/core/utils/date';
import type { EventItem } from '@/core/types';
import { CardListSkeleton, EmptyState, FilterChips, Page, PageHeader, SegmentedTabs } from '@/ui';
import { past, upcoming, useEventList } from './api';
import { EventCard } from './components/EventCard';

const ALL = 'todas';

/** Agrupa por mes para dar estructura de calendario al listado (§6.3). */
function groupByMonth(items: EventItem[]): { label: string; events: EventItem[] }[] {
  const groups = new Map<string, EventItem[]>();
  for (const event of items) {
    const key = monthLabel(event.startsAt);
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }
  return [...groups.entries()].map(([label, events]) => ({ label, events }));
}

export function EventsListPage() {
  const { data, isLoading } = useEventList();
  const [view, setView] = useState<'proximos' | 'pasados'>('proximos');
  const [category, setCategory] = useState(ALL);

  const events = useMemo(() => approvedOnly(data ?? []), [data]);
  const upcomingEvents = useMemo(() => upcoming(events), [events]);
  const pastEvents = useMemo(() => past(events), [events]);

  const source = view === 'proximos' ? upcomingEvents : pastEvents;
  const filtered = useMemo(
    () => source.filter((event) => category === ALL || event.category === category),
    [source, category],
  );

  const options = useMemo(
    () => [
      { value: ALL, label: 'Todas', count: source.length },
      ...eventCategories
        .map((name) => ({
          value: name,
          label: name,
          count: source.filter((event) => event.category === name).length,
        }))
        .filter((option) => option.count > 0),
    ],
    [source],
  );

  const groups = useMemo(() => groupByMonth(filtered), [filtered]);

  return (
    <Page>
      <PageHeader
        title="Eventos"
        description="Calendario centralizado de las actividades de la comunidad escolar."
      />

      <SegmentedTabs
        className="mb-3"
        value={view}
        onChange={(value) => setView(value as 'proximos' | 'pasados')}
        options={[
          { value: 'proximos', label: 'Próximos', count: upcomingEvents.length },
          { value: 'pasados', label: 'Realizados', count: pastEvents.length },
        ]}
      />

      <FilterChips options={options} value={category} onChange={setCategory} className="mb-5" />

      {isLoading ? (
        <CardListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={view === 'proximos' ? 'No hay eventos próximos' : 'No hay eventos realizados'}
          description="Cuando se publiquen nuevas actividades aparecerán en este calendario."
        />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="mb-2.5 text-[12px] font-bold uppercase tracking-wider text-ink-3">
                {group.label}
              </h2>
              <div className="space-y-3">
                {group.events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Page>
  );
}
