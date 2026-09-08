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
  /**
   * Cómo encaja la imagen en su marco.
   *   'cover'   recorta para llenarlo. Miniaturas de un listado, donde todas
   *             las tarjetas tienen que medir lo mismo.
   *   'contain' la muestra entera dentro del marco, con aire alrededor.
   *             Logotipos: un logo recortado deja de ser reconocible, que es
   *             justo su función.
   *   'natural' no hay marco. La imagen manda y se ve completa, con su propia
   *             proporción: un afiche vertical sale vertical y una foto
   *             apaisada sale apaisada, sin recorte ni franjas vacías.
   */
  fit?: 'cover' | 'contain' | 'natural';
}

export function AppImage({
  imageKey,
  className,
  ratio,
  compact,
  rounded = true,
  fallback,
  fit = 'cover',
}: AppImageProps) {
  const asset = getImage(imageKey);
  const marco = cn(ratioClass[ratio ?? asset?.ratio ?? '16/9'], rounded && 'rounded-xl', className);

  /* El marcador de "imagen pendiente" conserva el marco siempre: no hay
     ninguna imagen que medir todavía, y sin proporción se quedaría sin altura
     y no se vería nada. Solo la imagen ya cargada puede prescindir de él. */
  const shape = fit === 'natural' ? cn(rounded && 'rounded-xl', className) : marco;

  const ausente = fallback ?? (
    <PlaceholderBox
      className={marco}
      compact={compact}
      label={asset?.description ?? 'Imagen pendiente'}
      path={asset?.suggestedPath}
    />
  );

  if (!asset?.src) return <>{ausente}</>;

  return <LoadedImage src={asset.src} alt={asset.alt} shape={shape} ausente={ausente} fit={fit} />;
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
  fit,
}: {
  src: string;
  alt: string;
  shape: string;
  ausente: ReactNode;
  fit: 'cover' | 'contain' | 'natural';
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return <>{ausente}</>;

  /* `cn` concatena sin resolver conflictos, así que las clases de encaje se
     eligen aquí una sola vez en vez de superponerse. */
  const encaje =
    fit === 'natural'
      ? /* Sin recorte y sin franjas: la imagen manda. El tope de altura es
           para que un afiche vertical no se coma la pantalla entera y haya
           que hacer scroll para llegar al pie de la propia foto. */
        'mx-auto block h-auto max-h-[70vh] w-auto max-w-full'
      : fit === 'contain'
        ? 'h-full w-full object-contain p-1.5'
        : 'h-full w-full object-cover';

  return (
    <img
      src={src}
      alt={alt}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn(encaje, 'bg-surface-2', shape)}
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
