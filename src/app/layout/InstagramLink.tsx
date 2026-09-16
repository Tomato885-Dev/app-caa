import { Instagram } from 'lucide-react';
import { appConfig } from '@/config/app.config';
import { cn } from '@/ui';

/* ============================================================================
   INSTAGRAM DEL CENTRO DE ALUMNOS
   ----------------------------------------------------------------------------
   Un ícono chico en la barra de arriba, no un bloque: quien lo busca lo
   encuentra, y a quien no, no le quita espacio. Abre fuera de la app; en el
   teléfono, Instagram lo toma y abre el perfil directo en su aplicación.

   Si `organization.instagramUrl` está vacío, no se muestra nada.
   ========================================================================== */

export function InstagramLink({ className }: { className?: string }) {
  const url = appConfig.organization.instagramUrl;
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram del Centro de Alumnos"
      title="Instagram del Centro de Alumnos"
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-field text-ink-2 transition',
        'hover:bg-surface-2 hover:text-ink active:scale-95',
        className,
      )}
    >
      <Instagram size={19} />
    </a>
  );
}
