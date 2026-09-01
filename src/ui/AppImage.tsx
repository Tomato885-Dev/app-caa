import { useState } from 'react';
import type { ReactNode } from 'react';
import { ImagePlus } from 'lucide-react';
import { getImage, type ImageRatio } from '@/content/images';
import { cn } from './cn';

/* ============================================================================
   IMÁGENES Y MARCADORES
   ----------------------------------------------------------------------------
   Componente único para mostrar imágenes de contenido. Si la imagen todavía no
   existe, dibuja un marcador inequívoco que indica qué foto falta y en qué ruta
   debe dejarse. Así, ningún lugar de la app queda con una imagen inventada.

   El marcador aparece en dos casos:
     · La entrada del manifiesto no tiene ruta (`src: null`).
     · La ruta está declarada pero el archivo aún no se ha copiado.

   El segundo caso permite dejar la ruta anotada de antemano: basta con dejar
   el archivo en su carpeta para que la foto aparezca, sin editar nada.
   ========================================================================== */

const ratioClass: Record<ImageRatio, string> = {
  '16/9': 'aspect-[16/9]',
  '3/2': 'aspect-[3/2]',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '21/9': 'aspect-[21/9]',
};

interface AppImageProps {
  /** Clave del manifiesto `src/content/images.ts`. */
  imageKey?: string;
  className?: string;
  /** Fuerza una proporción distinta a la declarada en el manifiesto. */
  ratio?: ImageRatio;
  /** Marcador compacto: solo icono, sin texto. Para miniaturas. */
  compact?: boolean;
  rounded?: boolean;
  /**
   * Qué mostrar cuando la imagen no está, en vez del marcador punteado.
   * Se usa donde una alternativa se ve mejor que un hueco reservado: por
   * ejemplo, las iniciales de un colaborador que aún no tiene logotipo.
   */
  fallback?: ReactNode;
}

export function AppImage({
  imageKey,
  className,
  ratio,
  compact,
  rounded = true,
  fallback,
}: AppImageProps) {
  const asset = getImage(imageKey);
  const shape = cn(ratioClass[ratio ?? asset?.ratio ?? '16/9'], rounded && 'rounded-xl', className);

  const ausente = fallback ?? (
    <PlaceholderBox
      className={shape}
      compact={compact}
      label={asset?.description ?? 'Imagen pendiente'}
      path={asset?.suggestedPath}
    />
  );

  if (!asset?.src) return <>{ausente}</>;

  return <LoadedImage src={asset.src} alt={asset.alt} shape={shape} ausente={ausente} />;
}

/**
 * Imagen con ruta declarada. Si el archivo no está todavía, cae al marcador
 * en vez de dejar el icono de imagen rota del navegador.
 */
function LoadedImage({
  src,
  alt,
  shape,
  ausente,
}: {
  src: string;
  alt: string;
  shape: string;
  ausente: ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return <>{ausente}</>;

  return (
    <img
      src={src}
      alt={alt}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('h-full w-full object-cover bg-surface-2', shape)}
    />
  );
}

function PlaceholderBox({
  className,
  label,
  path,
  compact,
}: {
  className?: string;
  label: string;
  path?: string;
  compact?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={`Imagen pendiente: ${label}`}
      data-placeholder="image"
      className={cn(
        'relative flex w-full items-center justify-center overflow-hidden',
        'border-2 border-dashed border-line-strong bg-surface-2',
        className,
      )}
    >
      {/* Trama diagonal: deja claro que es un espacio reservado, no una foto. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 11px)',
          color: 'var(--sf-line)',
        }}
      />

      {compact ? (
        <ImagePlus size={18} className="relative text-ink-3" />
      ) : (
        <div className="relative flex max-w-[92%] flex-col items-center gap-1.5 px-3 py-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            <ImagePlus size={11} />
            Imagen pendiente
          </span>
          <p className="text-[12.5px] font-semibold leading-snug text-ink-2">{label}</p>
          {path ? (
            <code className="rounded bg-surface-3 px-1.5 py-0.5 text-[10.5px] font-medium text-ink-3">
              {path}
            </code>
          ) : null}
        </div>
      )}
    </div>
  );
}
