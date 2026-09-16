import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthContext';
import { getNavGroups } from '@/core/modules/registry';
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
  const moreIsActive = overflow.some(
    (mod) => location.pathname === mod.path || location.pathname.startsWith(`${mod.path}/`),
  );

  return (
    <>
      <nav
        aria-label="Navegación principal"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface shadow-nav lg:hidden"
      >
        <ul className="flex items-stretch">
          {bottom.map((mod) => (
            <li key={mod.id} className="flex-1">
              <NavLink to={mod.path} className="block" end={mod.path === '/'}>
                {({ isActive }) => (
                  <NavItem
                    icon={<mod.icon size={21} strokeWidth={isActive ? 2.4 : 1.9} />}
                    label={mod.nav.shortLabel ?? mod.title}
                    active={isActive}
                  />
                )}
              </NavLink>
            </li>
          ))}

          {overflow.length > 0 ? (
            <li className="flex-1">
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                aria-haspopup="dialog"
                className="w-full"
              >
                <NavItem
                  icon={<LayoutGrid size={21} strokeWidth={moreIsActive ? 2.4 : 1.9} />}
                  label="Más"
                  active={moreIsActive}
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
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <span
      className={cn(
        'flex flex-col items-center gap-1 px-1 pb-2 pt-2 transition active:scale-95',
        active ? 'text-brand-700 dark:text-brand-300' : 'text-ink-3',
      )}
    >
      {/* La píldora crece desde el centro al elegir la sección: se nota dónde
          estás sin tener que leer. */}
      <span className="relative flex h-8 w-14 items-center justify-center">
        <span
          aria-hidden
          className={cn(
            'absolute inset-0 rounded-full bg-accent-500 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
            active ? 'scale-100' : 'scale-0',
          )}
        />
        <span className={cn('relative', active && 'text-on-accent')}>{icon}</span>
      </span>
      <span className={cn('text-[10.5px] leading-tight', active ? 'font-bold' : 'font-medium')}>
        {label}
      </span>
    </span>
  );
}
