import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Clock, PenLine, XCircle } from 'lucide-react';
import { MODERATION_LABEL, type ModerationStatus } from '@/core/types';
import { cn } from './cn';
import { toneSoft, type Tone } from './tone';

export function Badge({
  children,
  tone = 'neutral',
  icon: Icon,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold leading-none',
        toneSoft[tone],
        className,
      )}
    >
      {Icon ? <Icon size={12.5} /> : null}
      {children}
    </span>
  );
}

const statusTone: Record<ModerationStatus, Tone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  changes_requested: 'info',
};

const statusIcon: Record<ModerationStatus, LucideIcon> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  changes_requested: PenLine,
};

/** Insignia del estado de moderación de un contenido (§7.1). */
export function StatusBadge({
  status,
  className,
}: {
  status: ModerationStatus;
  className?: string;
}) {
  return (
    <Badge tone={statusTone[status]} icon={statusIcon[status]} className={className}>
      {MODERATION_LABEL[status]}
    </Badge>
  );
}
