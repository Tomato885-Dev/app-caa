import { Clock, PenLine, XCircle } from 'lucide-react';
import type { Moderatable } from '@/core/types';
import { cn } from '@/ui';

/* ============================================================================
   AVISO DE ESTADO DE MODERACIÓN
   ----------------------------------------------------------------------------
   Se muestra al autor sobre su propia publicación cuando esta todavía no es
   visible para la comunidad, con el comentario del moderador si lo hay (§7.1).
   ========================================================================== */

const config = {
  pending: {
    icon: Clock,
    title: 'En revisión',
    text: 'Un moderador revisará esta publicación antes de que sea visible para la comunidad.',
    className:
      'border-warning-500 bg-warning-100 text-warning-700 dark:border-warning-700 dark:bg-warning-950 dark:text-warning-300',
  },
  changes_requested: {
    icon: PenLine,
    title: 'Cambios solicitados',
    text: 'El equipo de moderación pidió ajustes antes de publicar.',
    className:
      'border-info-500 bg-info-100 text-info-700 dark:border-line-strong dark:bg-surface-3 dark:text-ink-2',
  },
  rejected: {
    icon: XCircle,
    title: 'Publicación rechazada',
    text: 'Esta publicación no cumple con las normas de uso de la plataforma.',
    className:
      'border-danger-500 bg-danger-100 text-danger-700 dark:border-line-strong dark:bg-surface-3 dark:text-ink',
  },
} as const;

export function ModerationNotice({ item }: { item: Moderatable }) {
  if (item.status === 'approved') return null;

  const { icon: Icon, title, text, className } = config[item.status];

  return (
    <div className={cn('rounded-field border p-3.5', className)}>
      <p className="flex items-center gap-2 text-[13px] font-bold">
        <Icon size={15} />
        {title}
      </p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">{text}</p>
      {item.moderationNote ? (
        <p className="mt-2 rounded-lg bg-surface p-2.5 text-[12.5px] leading-relaxed text-ink">
          <span className="font-semibold">Comentario del moderador: </span>
          {item.moderationNote}
        </p>
      ) : null}
    </div>
  );
}
