import { cn } from './cn';

export interface ChipOption {
  value: string;
  label: string;
  count?: number;
}

/**
 * Fila de filtros con desplazamiento horizontal. Escala a muchas categorías
 * sin romper el diseño en pantallas angostas.
 */
export function FilterChips({
  options,
  value,
  onChange,
  className,
}: {
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filtros"
      className={cn('no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-0.5', className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold transition',
              // Amarillo para lo seleccionado; siempre con texto oscuro.
              active
                ? 'bg-accent-500 text-on-accent shadow-sm'
                : 'bg-surface text-ink-2 border border-line hover:border-line-strong',
            )}
          >
            {option.label}
            {option.count !== undefined ? (
              <span className={cn('ml-1.5', active ? 'text-accent-700' : 'text-ink-3')}>
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Control segmentado para 2–4 vistas mutuamente excluyentes. */
export function SegmentedTabs({
  options,
  value,
  onChange,
  className,
}: {
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn('flex gap-1 rounded-field bg-surface-2 p-1', className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 rounded-[calc(var(--radius-field)-0.25rem)] px-3 py-2 text-[13px] font-semibold transition',
              active
                ? 'bg-surface text-brand-600 shadow-sm dark:text-brand-300'
                : 'text-ink-2 hover:text-ink',
            )}
          >
            {option.label}
            {option.count !== undefined && option.count > 0 ? (
              <span className="ml-1.5 text-ink-3">{option.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
