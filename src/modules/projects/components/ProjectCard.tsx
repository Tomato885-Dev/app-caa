import {
  CalendarDays,
  Cpu,
  Handshake,
  HeartHandshake,
  Leaf,
  Lightbulb,
  Megaphone,
  Palette,
  PartyPopper,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Project } from '@/core/types';
import { AppImage, CardLink, cn } from '@/ui';
import { projectYears } from '../api';

/* ============================================================================
   TARJETA DE PROYECTO
   ----------------------------------------------------------------------------
   Es el apartado que menos fotos tiene y el que más leen los cursos chicos,
   así que la tarjeta no puede depender de una imagen para verse bien. El área
   pone el color y el ícono, y eso basta para distinguir un proyecto de otro de
   una pasada: el de deporte no se parece al de medioambiente.

   El que está en marcha lleva un punto verde que late; el histórico se queda
   quieto y apagado, sin necesidad de leer la etiqueta.

   Sin fotografía NO se reserva el espacio de la imagen: una lista de recuadros
   vacíos se lee peor que una lista de tarjetas compactas.
   ========================================================================== */

/** Cada área con su ícono. Un área nueva cae en la bombilla, sin romper nada. */
const ICONO_DEL_AREA: Record<string, LucideIcon> = {
  Comunidad: Users,
  Deporte: Trophy,
  Convivencia: Handshake,
  Barra: Megaphone,
  Cultura: Palette,
  Recreativos: PartyPopper,
  Eventos: CalendarDays,
  Tecnología: Cpu,
  'Acción Social': HeartHandshake,
  Medioambiente: Leaf,
};

export function ProjectCard({ project }: { project: Project }) {
  const activo = project.status === 'activo';
  const Icono = ICONO_DEL_AREA[project.area] ?? Lightbulb;

  return (
    <CardLink to={`/proyectos/${project.id}`} flush>
      {project.imageKey ? (
        <AppImage imageKey={project.imageKey} ratio="16/9" rounded={false} fit="full" />
      ) : null}

      <div className="flex gap-3.5 p-4">
        {/* El ícono del área: lo que da color a una lista sin fotos. */}
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-2xl',
            activo
              ? 'bg-brand-500 text-white shadow-card'
              : 'bg-surface-3 text-ink-3',
          )}
        >
          <Icono size={20} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">
            <span className="truncate">{project.area}</span>
            <span aria-hidden>·</span>
            <span className="shrink-0">{projectYears(project)}</span>
          </div>

          <h3 className="mt-1 text-[17px] font-bold leading-snug text-ink">{project.title}</h3>

          {project.summary ? (
            <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-ink-2">
              {project.summary}
            </p>
          ) : null}

          <p
            className={cn(
              'mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-bold',
              activo ? 'text-brand-600 dark:text-brand-300' : 'text-ink-3',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'size-1.5 rounded-full',
                activo ? 'bg-brand-500' : 'bg-ink-3',
              )}
            />
            {activo ? 'En marcha' : 'Histórico'}
          </p>
        </div>
      </div>
    </CardLink>
  );
}
