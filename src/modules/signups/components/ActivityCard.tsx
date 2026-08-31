import { CheckCircle2, Users } from 'lucide-react';
import { signupKindLabel, signupKindTone } from '@/content/taxonomies';
import type { Registration, SignupActivity } from '@/core/types';
import { formatCountdown } from '@/core/utils/date';
import { AppImage, Badge, CardLink } from '@/ui';
import { capacityOf, isOpen } from '../api';

export function ActivityCard({
  activity,
  registrations,
  registered,
}: {
  activity: SignupActivity;
  registrations: Registration[];
  registered?: boolean;
}) {
  const capacity = capacityOf(activity, registrations);
  const open = isOpen(activity);
  const countdown = formatCountdown(activity.closesAt);

  return (
    <CardLink to={`/inscripciones/${activity.id}`}>
      <div className="flex gap-3.5">
        <div className="w-24 shrink-0 sm:w-28">
          <AppImage imageKey={activity.imageKey} ratio="1/1" compact />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <Badge tone={signupKindTone[activity.kind]}>{signupKindLabel[activity.kind]}</Badge>
            {registered ? (
              <Badge tone="success" icon={CheckCircle2}>
                Inscrito
              </Badge>
            ) : null}
          </div>

          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-ink">
            {activity.title}
          </h3>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
            <span className="flex items-center gap-1 text-ink-2">
              <Users size={13} className="text-ink-3" />
              {capacity.capacity === null
                ? `${capacity.taken} inscritos · sin límite`
                : `${capacity.taken}/${capacity.capacity} cupos`}
            </span>

            {!open ? (
              <span className="font-semibold text-ink-3">Inscripciones cerradas</span>
            ) : capacity.full ? (
              <span className="font-semibold text-warning-700 dark:text-warning-500">
                Cupos completos
              </span>
            ) : countdown ? (
              <span className="font-semibold text-brand-600 dark:text-brand-300">{countdown}</span>
            ) : null}
          </div>
        </div>
      </div>
    </CardLink>
  );
}
