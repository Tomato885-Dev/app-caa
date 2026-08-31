import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from './cn';

/* ============================================================================
   AVISOS EMERGENTES
   ----------------------------------------------------------------------------
   Confirmaciones breves tras una acción (enviar a revisión, inscribirse,
   moderar). Se muestran sobre la barra inferior para no taparla.
   ========================================================================== */

type ToastKind = 'success' | 'info' | 'error';

interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
}

const ToastContext = createContext<((text: string, kind?: ToastKind) => void) | null>(null);

const icons = { success: CheckCircle2, info: Info, error: AlertTriangle } as const;

const styles: Record<ToastKind, string> = {
  success: 'bg-success-700 text-white',
  info: 'bg-ink text-canvas',
  error: 'bg-danger-700 text-white',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const notify = useCallback((text: string, kind: ToastKind = 'success') => {
    const id = Date.now() + Math.random();
    setMessages((current) => [...current, { id, kind, text }]);
    setTimeout(() => {
      setMessages((current) => current.filter((message) => message.id !== id));
    }, 3600);
  }, []);

  const value = useMemo(() => notify, [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6"
        >
          {messages.map((message) => {
            const Icon = icons[message.kind];
            return (
              <div
                key={message.id}
                className={cn(
                  'animate-in-up flex max-w-md items-center gap-2.5 rounded-full px-4 py-2.5 shadow-raised',
                  styles[message.kind],
                )}
              >
                <Icon size={16} className="shrink-0" />
                <span className="text-[13.5px] font-medium">{message.text}</span>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de <ToastProvider>.');
  return context;
}
