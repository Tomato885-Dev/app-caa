import { ImagePlus } from 'lucide-react';
import { getImage, type ImageRatio } from '@/content/images';
import { cn } from './cn';

/* ============================================================================
   IMÁGENES Y MARCADORES
   ----------------------------------------------------------------------------
   Componente único para mostrar imágenes de contenido. Si la imagen todavía no
   existe en el manifiesto (`src: null`), dibuja un marcador inequívoco que
   indica qué foto falta y en qué ruta debe dejarse.

   Así, ningún lugar de la app queda con una imagen inventada o improvisada.
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
}

export function AppImage({ imageKey, className, ratio, compact, rounded = true }: AppImageProps) {
  const asset = getImage(imageKey);
  const shape = cn(ratioClass[ratio ?? asset?.ratio ?? '16/9'], rounded && 'rounded-xl', className);

  // Sin clave declarada: marcador genérico.
  if (!asset) {
    return <PlaceholderBox className={shape} compact label="Imagen pendiente" />;
  }

  if (asset.src) {
    return (
      <img
        src={asset.src}
        alt={asset.alt}
        loading="lazy"
        decoding="async"
        className={cn('h-full w-full object-cover bg-surface-2', shape)}
      />
    );
  }

  return (
    <PlaceholderBox
      className={shape}
      compact={compact}
      label={asset.description}
      path={asset.suggestedPath}
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
