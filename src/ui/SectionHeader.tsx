import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/** Encabezado de bloque dentro de una página, con enlace opcional a "ver todo". */
export function SectionHeader({
  title,
  description,
  to,
  linkLabel = 'Ver todo',
  action,
}: {
  title: string;
  description?: string;
  to?: string;
  linkLabel?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-[18px] font-extrabold leading-tight tracking-tight text-ink">
          <span aria-hidden className="h-[18px] w-[5px] shrink-0 rounded-full bg-accent-500" />
          {title}
        </h2>
        {description ? <p className="mt-0.5 text-[13px] text-ink-2">{description}</p> : null}
      </div>

      {to ? (
        <Link
          to={to}
          className="inline-flex shrink-0 items-center gap-0.5 text-[13px] font-semibold text-brand-600 dark:text-brand-300"
        >
          {linkLabel}
          <ChevronRight size={15} />
        </Link>
      ) : (
        action
      )}
    </div>
  );
}
