import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { AppModule } from '@/core/modules/types';
import { Sheet, cn, toneSoft } from '@/ui';

/** Menú "Más": lista todos los módulos que no caben en la barra inferior. */
export function MoreSheet({
  open,
  onClose,
  modules,
}: {
  open: boolean;
  onClose: () => void;
  modules: AppModule[];
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Más secciones">
      <ul className="space-y-1.5">
        {modules.map((mod) => (
          <li key={mod.id}>
            <Link
              to={mod.path}
              onClick={onClose}
              className="flex items-center gap-3.5 rounded-2xl p-3 transition hover:bg-surface-2 active:scale-[0.99]"
            >
              <span
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  toneSoft[mod.tone],
                )}
              >
                <mod.icon size={20} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-semibold text-ink">{mod.title}</span>
                <span className="block truncate text-[12.5px] text-ink-2">{mod.description}</span>
              </span>

              <ChevronRight size={17} className="shrink-0 text-ink-3" />
            </Link>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
