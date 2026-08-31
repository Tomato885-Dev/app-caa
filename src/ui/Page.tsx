import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from './cn';

/**
 * Contenedor estándar de página. Fija el ancho máximo en escritorio y el
 * respiro inferior necesario para que la barra de navegación no tape contenido.
 */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-3xl px-4 pb-28 pt-4 lg:pb-10', className)}>
      {children}
    </div>
  );
}

/** Encabezado de página: título grande, bajada y acciones. */
export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('mb-5 flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-tight text-ink">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pt-1">{action}</div> : null}
    </header>
  );
}

/** Fila de metadato con icono. Usada en las fichas de detalle. */
export function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex gap-3 py-2.5">
      <Icon size={17} className="mt-0.5 shrink-0 text-ink-3" />
      <div className="min-w-0">
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">{label}</p>
        <div className="mt-0.5 text-[14px] leading-relaxed text-ink">{value}</div>
      </div>
    </div>
  );
}

/** Bloque de texto largo con saltos de párrafo respetados. */
export function Prose({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={index} className="text-[14.5px] leading-relaxed text-ink-2">
            {paragraph}
          </p>
        ))}
    </div>
  );
}
