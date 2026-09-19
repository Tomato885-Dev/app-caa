import { useState } from 'react';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { ExternalLink, Play } from 'lucide-react';
import { incrustarVideo } from '@/core/video/incrustar';
import { cn } from './cn';

/* ============================================================================
   EL REPRODUCTOR
   ----------------------------------------------------------------------------
   EN LA WEB se incrusta: un marco de 16:9 con el video adentro, cargado
   perezoso para no gastar datos de nadie hasta que se ve.

   EN EL TELÉFONO NO SE PUEDE, y no es algo que podamos permitir. Dentro de la
   app instalada las páginas viven en `capacitor://localhost`, y YouTube no
   reconoce esa dirección como un sitio: responde "error 153" y se queda negro.
   Arreglarlo de raíz significaría cambiarle la dirección interna a la app, y
   eso cerraría la sesión de los 694 alumnos.

   Así que en el teléfono se muestra la portada del video con su botón de play,
   y al tocarlo se abre ENCIMA de la app, con un botón para volver. Se siente
   como si siguieras adentro, que era el punto.
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
  const enTelefono = Capacitor.isNativePlatform();
  const limpio = url.trim();

  /* Un enlace que no se deja incrustar en ninguna parte: queda el botón. */
  if (!video) {
    if (!/^https:\/\//i.test(limpio)) return null;
    return <BotonDeVideo url={limpio} className={className} />;
  }

  if (enTelefono) {
    return <PortadaDelVideo video={video} titulo={titulo} className={className} />;
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

/** Abre el video encima de la app, o en el navegador si estamos en la web. */
async function abrir(url: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  try {
    await Browser.open({ url, presentationStyle: 'popover' });
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * La portada: la foto del video con el botón de play encima. Si el sitio no da
 * foto —Vimeo, Drive—, queda el verde de la app, que se ve mejor que un hueco.
 */
function PortadaDelVideo({
  video,
  titulo,
  className,
}: {
  video: NonNullable<ReturnType<typeof incrustarVideo>>;
  titulo: string;
  className?: string;
}) {
  const [sinFoto, setSinFoto] = useState(false);
  const foto = !sinFoto ? video.miniatura : undefined;

  return (
    <button
      type="button"
      onClick={() => void abrir(video.original)}
      aria-label={`Reproducir ${titulo}`}
      className={cn(
        'group relative block aspect-video w-full overflow-hidden rounded-card shadow-card transition active:scale-[0.99]',
        'bg-gradient-to-br from-brand-600 to-brand-900',
        className,
      )}
    >
      {foto ? (
        <img
          src={foto}
          alt=""
          onError={() => setSinFoto(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}

      {/* Un velo oscuro para que el play se lea sobre cualquier foto. */}
      <span aria-hidden className="absolute inset-0 bg-black/30" />

      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 flex size-[68px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-raised transition group-hover:scale-105"
      >
        <Play size={30} className="ml-1 fill-[#101a15] text-[#101a15]" />
      </span>

      <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-[12.5px] font-semibold text-white">
        Toca para ver el video
      </span>
    </button>
  );
}

function BotonDeVideo({ url, className }: { url: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => void abrir(url)}
      className={cn(
        'flex h-12 w-full items-center justify-center gap-2 rounded-field bg-brand-500 px-4 text-[14.5px] font-semibold text-white transition hover:bg-brand-600 active:scale-[0.98]',
        className,
      )}
    >
      <Play size={17} />
      Ver el video
      <ExternalLink size={15} />
    </button>
  );
}
