import { useMemo, useState } from 'react';
import { Lightbulb, Search } from 'lucide-react';
import { projectAreas } from '@/content/taxonomies';
import { matchesSearch } from '@/core/utils/text';
import {
  CardListSkeleton,
  EmptyState,
  FilterChips,
  Input,
  Page,
  PageHeader,
  SectionHeader,
} from '@/ui';
import { sortProjects, useProjectList } from './api';
import { ProjectCard } from './components/ProjectCard';

/* ============================================================================
   PROYECTOS DEL COLEGIO
   ----------------------------------------------------------------------------
   Qué iniciativas existen y cuáles existieron, contadas para que un alumno de
   básica entienda de qué se trata cada una y cómo sumarse.

   El listado se parte en dos bloques —lo que sigue en marcha y lo que ya
   terminó— en vez de usar un filtro de estado. Esa separación se entiende sin
   tener que tocar nada, que es lo que necesita el público de este apartado.
   ========================================================================== */

const ALL = 'todas';

export function ProjectsPage() {
  const { data, isLoading } = useProjectList();
  const [area, setArea] = useState(ALL);
  const [query, setQuery] = useState('');

  const items = useMemo(() => sortProjects(data ?? []), [data]);

  const filtered = useMemo(
    () =>
      items.filter(
        (project) =>
          (area === ALL || project.area === area) &&
          matchesSearch(query, project.title, project.summary, project.description, project.area),
      ),
    [items, area, query],
  );

  const activos = filtered.filter((project) => project.status === 'activo');
  const historicos = filtered.filter((project) => project.status === 'historico');

  const options = useMemo(
    () => [
      { value: ALL, label: 'Todas', count: items.length },
      ...projectAreas
        .map((value) => ({
          value,
          label: value,
          count: items.filter((project) => project.area === value).length,
        }))
        .filter((option) => option.count > 0),
    ],
    [items],
  );

  return (
    <Page>
      <PageHeader
        title="Proyectos"
        description="Lo que el colegio ha construido con los años: lo que sigue funcionando y lo que ya es historia."
      />

      <div className="relative mb-3">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar un proyecto"
          aria-label="Buscar un proyecto"
          className="pl-10"
        />
      </div>

      <FilterChips options={options} value={area} onChange={setArea} className="mb-5" />

      {isLoading ? (
        <CardListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="Sin proyectos"
          description="Cuando el Centro de Alumnos cargue los proyectos del colegio, aparecerán aquí."
        />
      ) : (
        <>
          {activos.length > 0 ? (
            <section className="mb-7">
              <SectionHeader
                title="En marcha"
                description="Puedes participar en cualquiera de estos ahora mismo."
              />
              <div className="space-y-3">
                {activos.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          ) : null}

          {historicos.length > 0 ? (
            <section>
              <SectionHeader
                title="Ya terminados"
                description="Proyectos que marcaron una época del colegio."
              />
              <div className="space-y-3">
                {historicos.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </Page>
  );
}
