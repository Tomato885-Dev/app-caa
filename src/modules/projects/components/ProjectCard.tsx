import { CalendarRange } from 'lucide-react';
import type { Project } from '@/core/types';
import { AppImage, Badge, CardLink } from '@/ui';
import { projectYears } from '../api';

/* ============================================================================
   TARJETA DE PROYECTO
   ----------------------------------------------------------------------------
   Imagen grande y frase corta. El apartado lo usan sobre todo los cursos más
   pequeños, así que la tarjeta se apoya en la foto y evita el texto denso: el
   detalle completo está una pulsación más adentro.
   ========================================================================== */

export function ProjectCard({ project }: { project: Project }) {
  const activo = project.status === 'activo';

  return (
    <CardLink to={`/proyectos/${project.id}`} flush>
      <AppImage imageKey={project.imageKey} ratio="16/9" rounded={false} />

      <div className="p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone={activo ? 'brand' : 'neutral'}>
            {activo ? 'En marcha' : 'Histórico'}
          </Badge>
          <Badge tone="neutral" icon={CalendarRange}>
            {projectYears(project)}
          </Badge>
        </div>

        <h3 className="text-[17px] font-bold leading-snug text-ink">{project.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink-2">
          {project.summary}
        </p>

        <p className="mt-2 text-[11.5px] font-bold uppercase tracking-wide text-brand-600 dark:text-brand-300">
          {project.area}
        </p>
      </div>
    </CardLink>
  );
}
