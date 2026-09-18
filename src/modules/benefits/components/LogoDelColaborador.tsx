import type { Benefit } from '@/core/types';
import { AppImage, Avatar, cn } from '@/ui';

/* ============================================================================
   EL LOGO DEL LOCAL
   ----------------------------------------------------------------------------
   Siempre del mismo porte y con el mismo marco, para que la lista se vea
   pareja. El problema que resuelve es real: los locales mandan el logo como
   les llega —unos con fondo blanco pegado a la imagen, otros en PNG
   transparente— y puestos uno al lado del otro parecían de dos apps
   distintas. Açaí al lado de Starbucks era el caso.

   Por eso el fondo blanco es lo normal, y el equipo puede apagarlo desde el
   panel cuando el logo ya es claro o el blanco lo arruina
   (`logoFondoBlanco`).
   ========================================================================== */

export function LogoDelColaborador({
  benefit,
  className,
}: {
  benefit: Benefit;
  /** El tamaño lo pone quien lo usa: la lista y la ficha no son iguales. */
  className?: string;
}) {
  const sobreBlanco = benefit.logoFondoBlanco !== false;

  return (
    <div
      className={cn(
        'shrink-0 overflow-hidden rounded-2xl',
        sobreBlanco ? 'bg-white p-2 ring-1 ring-black/10' : 'bg-surface-2 p-1.5 ring-1 ring-line',
        className,
      )}
    >
      <AppImage
        imageKey={benefit.logoImageKey}
        ratio="1/1"
        compact
        fit="contain"
        rounded={false}
        /* El fondo lo pone el marco de aqui, no la imagen: si no, un logo
           transparente queda sobre el gris oscuro del modo noche. */
        className={sobreBlanco ? 'bg-white' : 'bg-transparent'}
        /* Mientras no exista el archivo del logotipo se muestran las
           iniciales, no un hueco punteado: casi todos los colaboradores se
           cargan antes de conseguir su logo. */
        fallback={<Avatar name={benefit.partner} size="lg" className="size-full rounded-xl" />}
      />
    </div>
  );
}
