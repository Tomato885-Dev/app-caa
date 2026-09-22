import type { Benefit } from '@/core/types';
import { CardLink } from '@/ui';
import { LogoDelColaborador } from './LogoDelColaborador';

/* ============================================================================
   TARJETA DE UN COLABORADOR
   ----------------------------------------------------------------------------
   En dos columnas y con el logo grande arriba, como una vitrina. Antes era una
   lista de filas y se leía como una planilla: todas iguales, el logo chico a
   un costado y el ojo sin dónde detenerse.

   YA NO ES UN "BENEFICIO"
   El sistema partió como un canjeo de descuentos: cada convenio traía código,
   QR, vigencia y "cómo canjear". No prendió con los locales, así que se saca
   toda esa mecánica de la vista. Se conserva el modelo por dentro —por si
   algún convenio vuelve a tener descuento en el futuro— pero la tarjeta solo
   presenta al colaborador: logo, marca, nombre y una etiqueta al pie. Todo lo
   demás (canje, vencimiento, dónde) se dejó de mostrar.
   ========================================================================== */

export function BenefitCard({ benefit }: { benefit: Benefit }) {
  return (
    <CardLink to={`/colaboradores/${benefit.id}`} flush className="group flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center px-3 pb-3 pt-4 text-center">
        <LogoDelColaborador
          benefit={benefit}
          className="w-[76px] transition duration-200 group-hover:-translate-y-0.5 group-hover:rotate-[-3deg]"
        />

        <p className="mt-3 line-clamp-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-3">
          {benefit.partner}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-[14.5px] font-extrabold leading-tight tracking-tight text-ink">
          {benefit.name}
        </h3>
      </div>

      {/* La etiqueta del pie: sencilla y siempre igual. Antes decía la forma
          de canje; ahora simplemente identifica que este es un colaborador
          del Centro de Alumnos, sin promesas de descuento. */}
      <p className="flex items-center justify-center gap-1.5 bg-brand-500/12 px-2 py-2 text-[11.5px] font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
        Colaborador
      </p>
    </CardLink>
  );
}
