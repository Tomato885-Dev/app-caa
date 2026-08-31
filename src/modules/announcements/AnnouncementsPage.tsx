import { useMemo, useState } from 'react';
import { Megaphone, Search } from 'lucide-react';
import { announcementPriorities } from '@/content/taxonomies';
import { matchesSearch } from '@/core/utils/text';
import { CardListSkeleton, EmptyState, FilterChips, Input, Page, PageHeader } from '@/ui';
import { sortAnnouncements, useAnnouncementList } from './api';
import { AnnouncementCard } from './components/AnnouncementCard';

/* ============================================================================
   COMUNICADOS DEL CENTRO DE ALUMNOS
   ----------------------------------------------------------------------------
   Avisos oficiales del día a día, en orden cronológico. Publican solo los
   administradores desde Administración → Contenidos, igual que las noticias.
   ========================================================================== */

const ALL = 'todos';

export function AnnouncementsPage() {
  const { data, isLoading } = useAnnouncementList();
  const [priority, setPriority] = useState(ALL);
  const [query, setQuery] = useState('');

  const items = useMemo(() => sortAnnouncements(data ?? []), [data]);

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (priority === ALL || item.priority === priority) &&
          matchesSearch(query, item.title, item.body, item.audience),
      ),
    [items, priority, query],
  );

  const options = useMemo(
    () => [
      { value: ALL, label: 'Todos', count: items.length },
      ...announcementPriorities
        .map((option) => ({
          value: option.value,
          label: option.label,
          count: items.filter((item) => item.priority === option.value).length,
        }))
        .filter((option) => option.count > 0),
    ],
    [items],
  );

  return (
    <Page>
      <PageHeader
        title="Comunicados"
        description="Avisos oficiales del Centro de Alumnos, día a día."
      />

      <div className="relative mb-3">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar en comunicados"
          aria-label="Buscar en comunicados"
          className="pl-10"
        />
      </div>

      <FilterChips options={options} value={priority} onChange={setPriority} className="mb-5" />

      {isLoading ? (
        <CardListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Sin comunicados"
          description="Cuando el Centro de Alumnos publique un aviso, aparecerá aquí."
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <AnnouncementCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </Page>
  );
}
