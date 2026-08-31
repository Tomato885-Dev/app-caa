import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from './cn';
import { IconButton } from './Button';

/* ============================================================================
   HOJA MODAL
   ----------------------------------------------------------------------------
   Patrón único para todos los diálogos de la app: en móvil sube desde abajo
   (alcanzable con el pulgar) y en escritorio se centra como ventana.
   ========================================================================== */

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Barra fija inferior para acciones principales. */
  footer?: ReactNode;
  size?: 'md' | 'lg';
}

export function Sheet({ open, onClose, title, description, children, footer, size = 'md' }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    // Evita que el fondo haga scroll mientras la hoja está abierta.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink/60 animate-fade"
        onClick={onClose}
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92dvh] w-full flex-col bg-surface shadow-raised outline-none',
          'rounded-t-3xl sm:rounded-3xl animate-in-up',
          size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg',
        )}
      >
        {/* Asa visual: indica que la hoja se puede cerrar. */}
        <div className="flex justify-center pt-2.5 sm:hidden">
          <span className="h-1 w-9 rounded-full bg-line-strong" />
        </div>

        <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-3.5">
          <div className="min-w-0">
            <h2 className="text-[17px] font-bold leading-tight text-ink">{title}</h2>
            {description ? (
              <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{description}</p>
            ) : null}
          </div>
          <IconButton icon={X} label="Cerrar" onClick={onClose} className="-mr-2 -mt-1.5" />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>

        {footer ? (
          <footer className="safe-bottom border-t border-line bg-surface px-5 py-3.5">{footer}</footer>
        ) : (
          <div className="safe-bottom" />
        )}
      </div>
    </div>,
    document.body,
  );
}
