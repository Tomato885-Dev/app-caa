/* ============================================================================
   VIDEOS DENTRO DE LA APP
   ----------------------------------------------------------------------------
   El equipo pega el enlace del video tal como lo copia —de YouTube, de Vimeo o
   de una carpeta de Drive— y la app lo convierte en la dirección que se puede
   incrustar. No hay que pedirle a nadie que busque el "código para insertar".

   SI NO SE PUEDE INCRUSTAR, NO SE INVENTA
   Instagram, TikTok o un sitio cualquiera no se dejan incrustar, o dejan de
   hacerlo cuando cambian de opinión. En esos casos la app no muestra un marco
   roto: muestra un botón que abre el video donde vive.

   YOUTUBE VA POR `youtube-nocookie`
   Es el mismo reproductor, pero no deja cookies de publicidad hasta que
   alguien le da play. La app la usan menores de edad y no hay razón para
   entregar más de lo necesario.
   ========================================================================== */

export type TipoDeVideo = 'youtube' | 'vimeo' | 'drive';

export interface VideoIncrustable {
  tipo: TipoDeVideo;
  /** La dirección para el marco del reproductor. */
  incrustar: string;
}

/** El id de YouTube: once caracteres de letras, números, guion y guion bajo. */
const ID_YOUTUBE = /^[\w-]{11}$/;

export function esEnlaceDeVideo(url: string): boolean {
  return incrustarVideo(url) !== null;
}

/**
 * Convierte el enlace que pegó el equipo en algo incrustable, o `null` si ese
 * sitio no se deja.
 */
export function incrustarVideo(url: string): VideoIncrustable | null {
  const limpio = (url ?? '').trim();
  if (!limpio) return null;

  let direccion: URL;
  try {
    direccion = new URL(limpio);
  } catch {
    return null;
  }

  // Solo https: un video por http avisaría de contenido inseguro.
  if (direccion.protocol !== 'https:') return null;

  const host = direccion.hostname.replace(/^www\./, '').toLowerCase();
  const partes = direccion.pathname.split('/').filter(Boolean);

  /* --- YouTube ------------------------------------------------------------
     Cinco formas de copiar el mismo video: el enlace corto, el normal, el de
     una transmisión en vivo, el de un short y el de incrustar. */
  if (host === 'youtu.be' && ID_YOUTUBE.test(partes[0] ?? '')) {
    return youtube(partes[0], direccion);
  }
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    const parametro = direccion.searchParams.get('v');
    if (parametro && ID_YOUTUBE.test(parametro)) return youtube(parametro, direccion);

    const [seccion, id] = partes;
    if (['live', 'shorts', 'embed', 'v'].includes(seccion ?? '') && ID_YOUTUBE.test(id ?? '')) {
      return youtube(id, direccion);
    }
  }

  /* --- Vimeo -------------------------------------------------------------- */
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = partes.find((parte) => /^\d{6,}$/.test(parte));
    if (id) return { tipo: 'vimeo', incrustar: `https://player.vimeo.com/video/${id}` };
  }

  /* --- Un archivo de Drive ------------------------------------------------
     El colegio graba y lo deja en Drive: /file/d/ID/view se incrusta con
     /preview. Quién puede verlo lo sigue decidiendo Google. */
  if (host === 'drive.google.com' && partes[0] === 'file' && partes[1] === 'd' && partes[2]) {
    return { tipo: 'drive', incrustar: `https://drive.google.com/file/d/${partes[2]}/preview` };
  }

  return null;
}

/** Arma la dirección de YouTube, respetando el minuto desde el que empieza. */
function youtube(id: string, original: URL): VideoIncrustable {
  const incrustar = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
  /* `playsinline` es lo que evita que el iPhone se lo lleve a pantalla
     completa apenas parte, y `rel=0` deja las sugerencias del final dentro
     del mismo canal. */
  incrustar.searchParams.set('playsinline', '1');
  incrustar.searchParams.set('rel', '0');

  const desde = segundosDelEnlace(original);
  if (desde) incrustar.searchParams.set('start', String(desde));

  return { tipo: 'youtube', incrustar: incrustar.toString() };
}

/** "?t=90", "?t=1m30s" o "?start=90" — el momento donde empieza el video. */
export function segundosDelEnlace(direccion: URL): number | null {
  const valor = direccion.searchParams.get('t') ?? direccion.searchParams.get('start');
  if (!valor) return null;

  if (/^\d+$/.test(valor)) return Number(valor);

  const partes = valor.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!partes) return null;

  const [, horas, minutos, segundos] = partes;
  const total = Number(horas ?? 0) * 3600 + Number(minutos ?? 0) * 60 + Number(segundos ?? 0);
  return total > 0 ? total : null;
}
