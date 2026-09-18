import { ExternalLink, Play } from 'lucide-react';
import { incrustarVideo } from '@/core/video/incrustar';
import { cn } from './cn';

/* ============================================================================
   EL REPRODUCTOR
   ----------------------------------------------------------------------------
   Un marco de 16:9 con el video adentro. Se carga perezoso a propósito: una
   noticia con video no tiene por qué gastar datos de nadie hasta que se ve.

   Cuando el sitio no se deja incrustar, en vez de un marco en blanco sale un
   botón que lo abre donde vive. Es preferible a fingir que hay un reproductor.
   ========================================================================== */

export function VideoIncrustado({
  url,
  titulo,
  className,
}: {
  url: string;
  /** Para el lector de pantalla: "Video de …". */
  titulo: string;
  className?: string;
}) {
  const video = incrustarVideo(url);

  if (!video) {
    const limpio = url.trim();
    if (!/^https:\/\//i.test(limpio)) return null;

    return (
      <a
        href={limpio}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex h-12 w-full items-center justify-center gap-2 rounded-field bg-brand-500 px-4 text-[14.5px] font-semibold text-white transition hover:bg-brand-600 active:scale-[0.98]',
          className,
        )}
      >
        <Play size={17} />
        Ver el video
        <ExternalLink size={15} />
      </a>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-card border border-line bg-black shadow-card',
        className,
      )}
    >
      <iframe
        src={video.incrustar}
        title={titulo}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="block aspect-video w-full border-0"
      />
    </div>
  );
}
