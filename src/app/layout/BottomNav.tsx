import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthContext';
import { getNavGroups } from '@/core/modules/registry';
import { useNovedadesDe, useNovedadesDeVarias } from '@/app/novedades/NovedadesContext';
import { cn } from '@/ui';
import { MoreSheet } from './MoreSheet';

/* ============================================================================
   BARRA DE NAVEGACIÓN INFERIOR (MÓVIL)
   ----------------------------------------------------------------------------
   Muestra los primeros accesos definidos por el registro de módulos y agrupa
   el resto bajo "Más". Así la barra mantiene su tamaño aunque la app crezca.
   ========================================================================== */

export function BottomNav() {
  const { role } = useAuth();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const { bottom, overflow } = getNavGroups(role);
  /* Lo que hay sin ver en las secciones que no caben en la barra: si no, algo
     nuevo en Colaboradores no se anunciaría en ninguna parte. */
  const novedadesDeMas = useNovedadesDeVarias(overflow.map((mod) => mod.id));
  const moreIsActive = overflow.some(
    (mod) => location.pathname === mod.path || location.pathname.startsWith(`${mod.path}/`),
  );

  return (
    <>
      {/* UNA ISLA FLOTANTE. La barra no va pegada al borde: flota sobre el
          contenido en verde oscuro, en los dos temas. La sección donde estás
          se abre en una píldora amarilla con su nombre; las demás quedan como
          ícono. Se ve distinto a cualquier app del colegio, y se usa igual. */}
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.6rem)] z-40 lg:hidden"
      >
        <ul className="mx-auto flex max-w-md items-center justify-between gap-1 rounded-[1.75rem] bg-brand-800 p-1.5 shadow-dock ring-1 ring-white/10 dark:bg-brand-900">
          {bottom.map((mod) => (
            <li key={mod.id} className="flex min-w-0 justify-center">
              <NavLink to={mod.path} className="block" end={mod.path === '/'}>
                {({ isActive }) => (
                  <NavItem
                    icon={<mod.icon size={21} strokeWidth={isActive ? 2.5 : 2} />}
                    label={mod.nav.shortLabel ?? mod.title}
                    active={isActive}
                    modulo={mod.id}
                  />
                )}
              </NavLink>
            </li>
          ))}

          {overflow.length > 0 ? (
            <li className="flex min-w-0 justify-center">
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                aria-haspopup="dialog"
                className="block"
              >
                <NavItem
                  icon={<LayoutGrid size={21} strokeWidth={moreIsActive ? 2.5 : 2} />}
                  label="Más"
                  active={moreIsActive}
                  novedades={novedadesDeMas}
                />
              </button>
            </li>
          ) : null}
        </ul>
      </nav>

      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} modules={overflow} />
    </>
  );
}

function NavItem({
  icon,
  label,
  active,
  modulo,
  novedades,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  /** Para leer sus novedades. El botón "Más" pasa el total en `novedades`. */
  modulo?: string;
  novedades?: number;
}) {
  const propias = useNovedadesDe(modulo ?? '');
  /* En la sección donde ya estás no se muestra: la estás mirando. */
  const cuantas = active ? 0 : (novedades ?? propias);

  return (
    <span
      className={cn(
        'relative flex h-12 items-center justify-center gap-2 rounded-[1.35rem] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90',
        active
          ? 'bg-accent-500 px-4 text-on-accent shadow-card'
          : 'w-12 text-brand-200 hover:bg-brand-700 hover:text-white',
      )}
    >
      {icon}
      {cuantas > 0 ? <Cuantas cuantas={cuantas} /> : null}
      <span
        className={cn(
          'whitespace-nowrap text-[13px] font-extrabold',
          active ? 'animate-fade' : 'sr-only',
        )}
      >
        {label}
      </span>
    </span>
  );
}

/**
 * El número de lo que no has visto. Va en amarillo y no en rojo: el rojo en
 * esta app significa "cuidado", y aquí no hay nada de qué preocuparse, solo
 * algo nuevo que mirar.
 */
function Cuantas({ cuantas }: { cuantas: number }) {
  return (
    <span
      aria-label={cuantas > 8 ? 'más de nueve sin ver' : `${cuantas} sin ver`}
      className="absolute -right-0.5 -top-0.5 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-extrabold tabular-nums text-on-accent ring-2 ring-brand-800 dark:ring-brand-900"
    >
      {cuantas > 8 ? '+9' : cuantas}
    </span>
  );
}
