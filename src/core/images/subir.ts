import { supabase, usingServer } from '@/core/data';

/* ============================================================================
   SUBIR UNA FOTO
   ----------------------------------------------------------------------------
   Toma el archivo que la persona arrastró o eligió de su fototeca, lo reduce
   en el propio teléfono y lo guarda en el servidor. Devuelve la dirección de
   la foto, que es lo que se guarda junto al contenido.

   POR QUÉ SE REDUCE ANTES DE SUBIR, Y NO DESPUÉS
   Una foto de iPhone pesa entre 3 y 5 MB. Subirla entera es lento con los
   datos del colegio, y peor: esa misma foto la descargarían después los 694
   alumnos cada vez que abran la noticia. Reducirla a 1600 píxeles de ancho la
   deja en unos 300 KB —más que suficiente para cualquier pantalla— y ahorra
   más del 90% del tráfico en los dos sentidos.

   Se hace aquí y no en el servidor porque el trabajo pesado lo pone el
   teléfono de quien publica, una vez, en lugar de una función que tendríamos
   que pagar y mantener.
   ========================================================================== */

const ANCHO_MAXIMO = 1600;
const CALIDAD = 0.82;
/** Tope de seguridad: por encima de esto ni se intenta abrir la imagen. */
const TAMANO_MAXIMO_ORIGEN = 25 * 1024 * 1024;

export interface FotoSubida {
  /** Dirección pública. Es lo que se guarda como `imageKey` del contenido. */
  url: string;
  /** Cuánto pesaba y cuánto pesa, para poder decirlo en pantalla. */
  bytesOriginal: number;
  bytesFinal: number;
}

export function esImagen(archivo: File): boolean {
  return /^image\/(jpeg|png|webp|heic|heif)$/i.test(archivo.type) || /^image\//i.test(archivo.type);
}

/** Lee el archivo respetando la orientación con que se tomó la foto. */
async function cargarBitmap(archivo: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    // `imageOrientation` evita que las fotos verticales de iPhone salgan
    // acostadas: la orientación viene en los metadatos, no en los píxeles.
    return createImageBitmap(archivo, { imageOrientation: 'from-image' });
  }
  const url = URL.createObjectURL(archivo);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('No se pudo leer la imagen.'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Reduce la foto y la convierte a JPEG. */
async function reducir(archivo: File): Promise<Blob> {
  const bitmap = await cargarBitmap(archivo);
  const anchoOriginal = bitmap.width;
  const altoOriginal = bitmap.height;

  const escala = Math.min(1, ANCHO_MAXIMO / anchoOriginal);
  const ancho = Math.round(anchoOriginal * escala);
  const alto = Math.round(altoOriginal * escala);

  const lienzo = document.createElement('canvas');
  lienzo.width = ancho;
  lienzo.height = alto;

  const contexto = lienzo.getContext('2d');
  if (!contexto) throw new Error('Este navegador no puede procesar la imagen.');

  /* Fondo blanco: los PNG con transparencia quedarían con manchas negras al
     pasar a JPEG, que no admite transparencia. */
  contexto.fillStyle = '#ffffff';
  contexto.fillRect(0, 0, ancho, alto);
  contexto.drawImage(bitmap as CanvasImageSource, 0, 0, ancho, alto);

  if ('close' in bitmap) bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    lienzo.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo convertir la imagen.'))),
      'image/jpeg',
      CALIDAD,
    );
  });
}

function nombreUnico(): string {
  const ahora = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fecha = `${ahora.getFullYear()}${pad(ahora.getMonth() + 1)}${pad(ahora.getDate())}`;
  const azar =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${fecha}-${azar}.jpg`;
}

export async function subirFoto(archivo: File): Promise<FotoSubida> {
  if (!usingServer || !supabase) {
    throw new Error('Subir fotos necesita el servidor conectado.');
  }
  if (!esImagen(archivo)) {
    throw new Error('Ese archivo no es una imagen.');
  }
  if (archivo.size > TAMANO_MAXIMO_ORIGEN) {
    throw new Error('Esa imagen es demasiado grande. Prueba con una más liviana.');
  }

  const reducida = await reducir(archivo);
  const ruta = nombreUnico();

  const { error } = await supabase.storage.from('imagenes').upload(ruta, reducida, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
    // Nombre único en cada subida: nunca se pisa una foto ya publicada.
    upsert: false,
  });

  if (error) {
    if (/row-level security|policy/i.test(error.message)) {
      throw new Error('No tienes permiso para subir fotos.');
    }
    if (/bucket/i.test(error.message)) {
      throw new Error('Falta crear el depósito de imágenes en Supabase (08-imagenes.sql).');
    }
    throw new Error(`No se pudo subir: ${error.message}`);
  }

  const { data } = supabase.storage.from('imagenes').getPublicUrl(ruta);

  return {
    url: data.publicUrl,
    bytesOriginal: archivo.size,
    bytesFinal: reducida.size,
  };
}

/** Para poder decir "de 4,2 MB a 310 KB" en vez de un número suelto. */
export function pesoLegible(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
  return Math.round(bytes / 1024) + ' KB';
}
