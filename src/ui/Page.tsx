import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { findModuleByPath } from '@/core/modules/registry';
import { cn } from './cn';
import { toneVivid, toneWash } from './tone';

/**
 * Contenedor estándar de página. Fija el ancho máximo en escritorio y el
 * respiro inferior necesario para que la barra de navegación no tape contenido.
 */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-3xl px-4 pb-32 pt-4 lg:pb-10', className)}>
      {children}
    </div>
  );
}

/**
 * Encabezado de página: título grande, bajada y acciones.
 *
 * Al lado del título va el ícono de la sección, en su color. No se le pasa: lo
 * averigua solo desde la ruta, con el mismo registro de módulos que arma la
 * navegación. Así una sección nueva lo tiene sin tocar su pantalla, y el ícono
 * del título es siempre el mismo que el del menú.
 */
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
  const modulo = findModuleByPath(useLocation().pathname);
  const Icono = modulo?.icon;
  const tono = modulo?.tone ?? 'brand';

  return (
    <header
      className={cn(
        'relative mb-5 overflow-hidden rounded-card border border-line bg-surface p-4 shadow-card',
        className,
      )}
    >
      {/* El bano de color de la seccion. Es lo que hace que Noticias no se vea
          igual que Proyectos ni que Casino, sin tener que dibujar una portada
          distinta en cada pantalla. */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent',
          toneWash[tono],
        )}
      />
      {/* Un aro, del mismo gesto que la portada de Inicio. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full border-[10px] border-current opacity-[0.07]"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3.5">
          {Icono && modulo ? (
            <span
              aria-hidden
              className={cn(
                'mt-0.5 flex size-12 shrink-0 -rotate-3 items-center justify-center rounded-2xl shadow-raised',
                toneVivid[modulo.tone],
              )}
            >
              <Icono size={23} />
            </span>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-tight text-ink">
              {title}
            </h1>
            {description ? (
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{description}</p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
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
