import { useMemo, useState } from 'react';
import { ClipboardList, Megaphone, Search } from 'lucide-react';
import { announcementPriorities } from '@/content/taxonomies';
import type { AnnouncementKind } from '@/core/types';
import { matchesSearch } from '@/core/utils/text';
import {
  CardListSkeleton,
  EmptyState,
  FilterChips,
  Input,
  Page,
  PageHeader,
  SegmentedTabs,
} from '@/ui';
import { sortAnnouncements, sortInscriptions, useAnnouncementList } from './api';
import { AnnouncementCard } from './components/AnnouncementCard';

/* ============================================================================
   COMUNICADOS
   ----------------------------------------------------------------------------
   Una sola pantalla con dos vistas, no dos secciones:

     · Comunicados   los avisos del día a día, con su filtro de prioridad.
     · Inscripciones las convocatorias abiertas, ordenadas por fecha de cierre.

   Se reparten con un selector arriba porque son la misma clase de contenido
   —un aviso oficial— leído con dos intenciones distintas: "qué pasó" y "a qué
   me puedo sumar".

   El filtro de prioridad solo aparece en los comunicados: en una convocatoria
   lo que ordena es cuándo cierra, no cuán urgente es.
   ========================================================================== */

const ALL = 'todos';

export function AnnouncementsPage() {
  const { data, isLoading } = useAnnouncementList();
  const [kind, setKind] = useState<AnnouncementKind>('general');
  const [priority, setPriority] = useState(ALL);
  const [query, setQuery] = useState('');

  const items = useMemo(() => data ?? [], [data]);

  const generales = useMemo(
    () => sortAnnouncements(items.filter((item) => item.kind !== 'inscripcion')),
    [items],
  );
  const inscripciones = useMemo(
    () => sortInscriptions(items.filter((item) => item.kind === 'inscripcion')),
    [items],
  );

  const enInscripciones = kind === 'inscripcion';
  const lista = enInscripciones ? inscripciones : generales;

  const filtered = useMemo(
    () =>
      lista.filter(
        (item) =>
          (enInscripciones || priority === ALL || item.priority === priority) &&
          matchesSearch(query, item.title, item.body, item.audience),
      ),
    [lista, enInscripciones, priority, query],
  );

  const priorityOptions = useMemo(
    () => [
      { value: ALL, label: 'Todos', count: generales.length },
      ...announcementPriorities
        .map((option) => ({
          value: option.value,
          label: option.label,
          count: generales.filter((item) => item.priority === option.value).length,
        }))
        .filter((option) => option.count > 0),
    ],
    [generales],
  );

  return (
    <Page>
      <PageHeader
        title="Comunicados"
        description="Avisos oficiales del Centro de Alumnos y convocatorias abiertas."
      />

      <SegmentedTabs
        className="mb-4"
        value={kind}
        onChange={(value) => setKind(value as AnnouncementKind)}
        options={[
          { value: 'general', label: `Comunicados (${generales.length})` },
          { value: 'inscripcion', label: `Inscripciones (${inscripciones.length})` },
        ]}
      />

      <div className="relative mb-3">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={enInscripciones ? 'Buscar una convocatoria' : 'Buscar en comunicados'}
          aria-label={enInscripciones ? 'Buscar convocatorias' : 'Buscar en comunicados'}
          className="pl-10"
        />
      </div>

      {enInscripciones ? null : (
        <FilterChips
          options={priorityOptions}
          value={priority}
          onChange={setPriority}
          className="mb-5"
        />
      )}

      {isLoading ? (
        <CardListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={enInscripciones ? ClipboardList : Megaphone}
          title={enInscripciones ? 'Sin convocatorias abiertas' : 'Sin comunicados'}
          description={
            enInscripciones
              ? 'Cuando el Centro de Alumnos abra una inscripción, aparecerá aquí.'
              : 'Cuando el Centro de Alumnos publique un aviso, aparecerá aquí.'
          }
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
