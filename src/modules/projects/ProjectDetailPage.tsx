import { useParams } from 'react-router-dom';
import { CalendarRange, FileQuestion, HandHeart, Tag, Users } from 'lucide-react';
import { PROJECT_STATUS_LABEL } from '@/core/types';
import {
  AppImage,
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  MetaRow,
  Page,
  Prose,
  Skeleton,
} from '@/ui';
import { projectYears, useProject } from './api';

export function ProjectDetailPage() {
  const { id } = useParams();
  const { data: project, isLoading } = useProject(id);

  if (isLoading) {
    return (
      <Page>
        <Skeleton className="mb-4 aspect-video w-full" />
        <Skeleton className="mb-3 h-6 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </Page>
    );
  }

  if (!project) {
    return (
      <Page>
        <EmptyState
          icon={FileQuestion}
          title="Proyecto no encontrado"
          description="Es posible que haya sido retirado o que el enlace no sea válido."
          action={<ButtonLink to="/proyectos">Volver a proyectos</ButtonLink>}
        />
      </Page>
    );
  }

  const activo = project.status === 'activo';

  return (
    <Page>
      <article>
        {project.imageKey ? (
          <AppImage imageKey={project.imageKey} ratio="16/9" className="mb-4" />
        ) : null}

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone={activo ? 'brand' : 'neutral'}>{PROJECT_STATUS_LABEL[project.status]}</Badge>
          <Badge tone="neutral" icon={CalendarRange}>
            {projectYears(project)}
          </Badge>
        </div>

        <h1 className="text-[24px] font-extrabold leading-[1.2] tracking-tight text-ink">
          {project.title}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{project.summary}</p>

        <Prose text={project.description} className="my-6" />

        {/* Cómo sumarse: el dato que más busca un alumno de básica, así que va
            destacado y no escondido entre los metadatos. */}
        {activo && project.howToJoin ? (
          <div className="mb-5 rounded-card border border-brand-200 bg-brand-50 p-4 dark:border-brand-500 dark:bg-brand-950">
            <div className="mb-1.5 flex items-center gap-2">
              <HandHeart size={18} className="shrink-0 text-brand-600 dark:text-brand-300" />
              <h2 className="text-[14.5px] font-bold text-brand-700 dark:text-brand-300">
                Cómo participar
              </h2>
            </div>
            <p className="text-[13.5px] leading-relaxed text-brand-700 dark:text-brand-300">
              {project.howToJoin}
            </p>
          </div>
        ) : null}

        <Card>
          <MetaRow icon={Tag} label="Área" value={project.area} />
          <MetaRow
            icon={CalendarRange}
            label={activo ? 'Funcionando desde' : 'Duró'}
            value={activo ? String(project.startYear) : projectYears(project)}
          />
          {project.ledBy ? (
            <MetaRow icon={Users} label="A cargo de" value={project.ledBy} />
          ) : null}
        </Card>
      </article>
    </Page>
  );
}
