/* ============================================================================
   MANIFIESTO DE IMÁGENES
   ----------------------------------------------------------------------------
   TODAS las imágenes de la app se declaran aquí. Mientras `src` sea `null`, la
   app muestra un marcador visible que indica qué imagen falta y dónde dejarla.

   CÓMO REEMPLAZAR UNA IMAGEN
   1. Copia el archivo en `public/images/…` (usa la ruta de `suggestedPath`).
   2. Cambia `src: null` por `src: '/images/…'` en la entrada correspondiente.
   3. Ajusta `alt` para describir la imagen real (accesibilidad).

   No hace falta tocar ningún componente.
   ========================================================================== */

export type ImageRatio = '16/9' | '3/2' | '4/3' | '1/1' | '21/9';

export interface ImageAsset {
  /** Ruta pública de la imagen final. `null` = marcador pendiente. */
  src: string | null;
  /** Texto alternativo (obligatorio para accesibilidad). */
  alt: string;
  /** Qué debe mostrar la imagen. Se ve en el marcador. */
  description: string;
  ratio: ImageRatio;
  /** Dónde dejar el archivo definitivo. */
  suggestedPath: string;
}

function pending(
  description: string,
  suggestedPath: string,
  ratio: ImageRatio = '16/9',
  alt = '',
): ImageAsset {
  return { src: null, alt: alt || description, description, ratio, suggestedPath };
}

export const images: Record<string, ImageAsset> = {
  /* --- Identidad ---------------------------------------------------------
     El logo oficial ya está incorporado. Para actualizarlo hay dos archivos:
     · public/icons/logo.png → el que se ve dentro de la app (blanco)
     · public/icons/icon.png → el cuadrado verde, icono al instalar la app   */
  'brand.logo': {
    src: '/icons/logo.png',
    alt: 'Logo oficial Caa 2026',
    description: 'Logo oficial del Centro de Alumnos (blanco, sobre placa verde)',
    ratio: '3/2',
    suggestedPath: 'public/icons/logo.png',
  },
  'auth.hero': pending(
    'Foto de portada de la pantalla de acceso: comunidad estudiantil, patio o actividad masiva',
    'public/images/brand/acceso-portada.jpg',
    '4/3',
  ),

  /* --- Inicio ----------------------------------------------------------- */
  'home.banner': pending(
    'Imagen destacada del banner de Inicio (campaña o actividad vigente)',
    'public/images/inicio/banner.jpg',
    '21/9',
  ),

  /* --- Noticias --------------------------------------------------------- */
  'news.asamblea': pending(
    'Foto de la asamblea estudiantil o reunión del Centro de Alumnos',
    'public/images/noticias/asamblea.jpg',
  ),
  'news.resultados': pending(
    'Foto del conteo de votos o de la directiva electa',
    'public/images/noticias/resultados-eleccion.jpg',
  ),
  'news.campana-solidaria': pending(
    'Foto de la recolección de la campaña solidaria',
    'public/images/noticias/campana-solidaria.jpg',
  ),
  'news.horario-biblioteca': pending(
    'Foto de la biblioteca o sala de estudio',
    'public/images/noticias/biblioteca.jpg',
  ),
  'news.taller-liderazgo': pending(
    'Foto del taller de liderazgo estudiantil',
    'public/images/noticias/taller-liderazgo.jpg',
  ),

  /* --- Eventos ---------------------------------------------------------- */
  'event.aniversario': pending(
    'Foto de la semana de aniversario (alianzas, decoración, público)',
    'public/images/eventos/aniversario.jpg',
  ),
  'event.torneo-futbol': pending(
    'Foto del torneo de fútbol interescolar',
    'public/images/eventos/torneo-futbol.jpg',
  ),
  'event.feria-vocacional': pending(
    'Foto de la feria vocacional o stands de universidades',
    'public/images/eventos/feria-vocacional.jpg',
  ),
  'event.gala-arte': pending(
    'Foto de la muestra de arte o presentación cultural',
    'public/images/eventos/gala-arte.jpg',
  ),
  'event.jornada-scout': pending(
    'Foto de la jornada scout al aire libre',
    'public/images/eventos/jornada-scout.jpg',
  ),

  /* --- Inscripciones ---------------------------------------------------- */
  'signup.accion-social': pending(
    'Foto de voluntariado o trabajo de acción social',
    'public/images/inscripciones/accion-social.jpg',
  ),
  'signup.torneo-ajedrez': pending(
    'Foto del club o torneo de ajedrez',
    'public/images/inscripciones/ajedrez.jpg',
  ),
  'signup.brigada-ambiental': pending(
    'Foto de la brigada ambiental en actividad',
    'public/images/inscripciones/brigada-ambiental.jpg',
  ),
  'signup.revista-estudiantil': pending(
    'Foto del equipo de la revista estudiantil trabajando',
    'public/images/inscripciones/revista.jpg',
  ),

  /* --- Proyectos del colegio ---------------------------------------------
     Los proyectos van SIN fotografía. Si más adelante quieren agregarlas,
     se declara aquí una entrada por proyecto con una clave que empiece por
     `projects.` y se elige desde el formulario de administración. Ejemplo:

       'projects.huerto': pending(
         'Alumnos trabajando en el huerto escolar',
         'public/images/proyectos/huerto.jpg',
       ),                                                                   */

  /* --- Colaboradores -----------------------------------------------------
     Logotipo de cada colaborador de la campaña. Cuadrado, con fondo claro:
     se muestra dentro de un círculo en el listado.

     LAS RUTAS YA ESTÁN DECLARADAS. Para poner un logotipo NO hay que editar
     este archivo: basta con dejar la imagen en `public/images/colaboradores/`
     con el nombre que dice `suggestedPath`. Mientras el archivo no exista, la
     app muestra las iniciales del colaborador.                              */
  'benefit.colaborador-01': {
    src: '/images/colaboradores/colaborador-01.png',
    alt: 'Logotipo del colaborador 1',
    description: 'Logotipo del colaborador 1',
    ratio: '1/1',
    suggestedPath: 'public/images/colaboradores/colaborador-01.png',
  },
  'benefit.colaborador-02': {
    src: '/images/colaboradores/colaborador-02.png',
    alt: 'Logotipo del colaborador 2',
    description: 'Logotipo del colaborador 2',
    ratio: '1/1',
    suggestedPath: 'public/images/colaboradores/colaborador-02.png',
  },
  'benefit.colaborador-03': {
    src: '/images/colaboradores/colaborador-03.png',
    alt: 'Logotipo del colaborador 3',
    description: 'Logotipo del colaborador 3',
    ratio: '1/1',
    suggestedPath: 'public/images/colaboradores/colaborador-03.png',
  },
  'benefit.colaborador-04': {
    src: '/images/colaboradores/colaborador-04.png',
    alt: 'Logotipo del colaborador 4',
    description: 'Logotipo del colaborador 4',
    ratio: '1/1',
    suggestedPath: 'public/images/colaboradores/colaborador-04.png',
  },
  'benefit.colaborador-05': {
    src: '/images/colaboradores/colaborador-05.png',
    alt: 'Logotipo del colaborador 5',
    description: 'Logotipo del colaborador 5',
    ratio: '1/1',
    suggestedPath: 'public/images/colaboradores/colaborador-05.png',
  },
  'benefit.colaborador-06': {
    src: '/images/colaboradores/colaborador-06.png',
    alt: 'Logotipo del colaborador 6',
    description: 'Logotipo del colaborador 6',
    ratio: '1/1',
    suggestedPath: 'public/images/colaboradores/colaborador-06.png',
  },
  'benefit.colaborador-07': {
    src: '/images/colaboradores/colaborador-07.png',
    alt: 'Logotipo del colaborador 7',
    description: 'Logotipo del colaborador 7',
    ratio: '1/1',
    suggestedPath: 'public/images/colaboradores/colaborador-07.png',
  },
  'benefit.colaborador-08': {
    src: '/images/colaboradores/colaborador-08.png',
    alt: 'Logotipo del colaborador 8',
    description: 'Logotipo del colaborador 8',
    ratio: '1/1',
    suggestedPath: 'public/images/colaboradores/colaborador-08.png',
  },
  'benefit.colaborador-09': {
    src: '/images/colaboradores/colaborador-09.png',
    alt: 'Logotipo del colaborador 9',
    description: 'Logotipo del colaborador 9',
    ratio: '1/1',
    suggestedPath: 'public/images/colaboradores/colaborador-09.png',
  },
  'benefit.colaborador-10': {
    src: '/images/colaboradores/colaborador-10.png',
    alt: 'Logotipo del colaborador 10',
    description: 'Logotipo del colaborador 10',
    ratio: '1/1',
    suggestedPath: 'public/images/colaboradores/colaborador-10.png',
  },
  'benefit.colaborador-11': {
    src: '/images/colaboradores/colaborador-11.png',
    alt: 'Logotipo del colaborador 11',
    description: 'Logotipo del colaborador 11',
    ratio: '1/1',
    suggestedPath: 'public/images/colaboradores/colaborador-11.png',
  },
  'benefit.colaborador-12': {
    src: '/images/colaboradores/colaborador-12.png',
    alt: 'Logotipo del colaborador 12',
    description: 'Logotipo del colaborador 12',
    ratio: '1/1',
    suggestedPath: 'public/images/colaboradores/colaborador-12.png',
  },
  'benefit.colaborador-13': {
    src: '/images/colaboradores/colaborador-13.png',
    alt: 'Logotipo del colaborador 13',
    description: 'Logotipo del colaborador 13',
    ratio: '1/1',
    suggestedPath: 'public/images/colaboradores/colaborador-13.png',
  },
  'benefit.colaborador-14': {
    src: '/images/colaboradores/colaborador-14.png',
    alt: 'Logotipo del colaborador 14',
    description: 'Logotipo del colaborador 14',
    ratio: '1/1',
    suggestedPath: 'public/images/colaboradores/colaborador-14.png',
  },
  'benefit.colaborador-15': {
    src: '/images/colaboradores/colaborador-15.png',
    alt: 'Logotipo del colaborador 15',
    description: 'Logotipo del colaborador 15',
    ratio: '1/1',
    suggestedPath: 'public/images/colaboradores/colaborador-15.png',
  },

};

/**
 * Devuelve el descriptor de una imagen. Si la clave no está registrada,
 * genera un marcador igualmente visible para no romper la interfaz.
 */
/**
 * Antepone la carpeta desde la que se sirve la app.
 *
 * Las rutas del manifiesto se escriben desde la raíz (`/images/...`), que es
 * lo natural de leer. Pero la app no siempre vive en la raíz: en GitHub Pages
 * cuelga de `/nombre-del-repositorio/`, y ahí una ruta absoluta apunta fuera
 * de la aplicación y la imagen no aparece.
 *
 * `BASE_URL` vale '/' en un dominio propio y '/app-caa/' en GitHub Pages, así
 * que el mismo manifiesto sirve en los dos casos sin tocar nada.
 */
function resolverRuta(src: string | null): string | null {
  if (!src) return null;
  if (!src.startsWith('/')) return src;
  return import.meta.env.BASE_URL.replace(/\/$/, '') + src;
}

export function getImage(key: string | undefined): ImageAsset | null {
  if (!key) return null;

  const asset = images[key];
  if (asset) return { ...asset, src: resolverRuta(asset.src) };

  return {
    src: null,
    alt: '',
    description: `Imagen sin registrar (clave: ${key})`,
    ratio: '16/9',
    suggestedPath: 'Registrar la clave en src/content/images.ts',
  };
}
