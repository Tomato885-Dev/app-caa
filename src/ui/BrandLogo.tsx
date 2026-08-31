import { getImage } from '@/content/images';
import { appConfig } from '@/config/app.config';
import { cn } from './cn';

/* ============================================================================
   LOGO DE LA APLICACIÓN
   ----------------------------------------------------------------------------
   Punto único donde se dibuja el logo oficial. Barra superior, menú lateral,
   pantalla de acceso y pantalla de carga lo consumen desde aquí, de modo que
   cambiarlo en el futuro es reemplazar un archivo y nada más.

   El logo es BLANCO sobre fondo transparente, así que se presenta sobre una
   placa del verde de marca. Es la única forma de que se lea igual en modo
   claro (donde las superficies son blancas) y en modo oscuro. Blanco sobre
   #11673C da 6.93:1 de contraste: cumple WCAG AA.

   Es horizontal (≈ 1.64:1): se dimensiona por ALTURA y el ancho se ajusta solo.
   Nunca se recolorea ni se deforma.

   Archivos:
   · public/icons/logo.png       → el que se ve dentro de la app (blanco)
   · public/icons/icon.png       → cuadrado verde, icono al instalar la app
   · public/icons/logo-negro.png → la versión negra, por si se quiere volver
   ========================================================================== */

const sizes = {
  sm: { tile: 'h-9 rounded-lg px-2.5', img: 'h-5' }, // barra superior en móvil
  md: { tile: 'h-10 rounded-lg px-3', img: 'h-6' }, // menú lateral en escritorio
  lg: { tile: 'h-16 rounded-xl px-5', img: 'h-9' }, // pantalla de acceso
  xl: { tile: 'h-24 rounded-2xl px-7', img: 'h-14' }, // pantalla de carga
} as const;

export function BrandLogo({
  size = 'md',
  className,
  /** Texto alternativo; por defecto, el nombre de la organización. */
  alt,
}: {
  size?: keyof typeof sizes;
  className?: string;
  alt?: string;
}) {
  const asset = getImage('brand.logo');
  const label = alt ?? appConfig.organization.fullName;
  const { tile, img } = sizes[size];

  // Reserva del espacio mientras el logo no esté disponible: nunca se
  // sustituye por una marca inventada.
  if (!asset?.src) {
    return (
      <span
        role="img"
        aria-label={`Logo pendiente: ${label}`}
        data-placeholder="logo"
        className={cn(
          'inline-flex w-24 shrink-0 items-center justify-center border-2 border-dashed border-line-strong bg-surface-2 text-[9px] font-bold uppercase tracking-wide text-ink-3',
          tile,
          className,
        )}
      >
        Logo
      </span>
    );
  }

  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center bg-brand-500', tile, className)}
    >
      <img src={asset.src} alt={label} className={cn('w-auto object-contain', img)} />
    </span>
  );
}
