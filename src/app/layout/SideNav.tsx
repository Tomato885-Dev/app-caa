import { NavLink } from 'react-router-dom';
import { appConfig } from '@/config/app.config';
import { useAuth } from '@/core/auth/AuthContext';
import { usePendingCount } from '@/core/moderation/useModerationQueue';
import { canModerate } from '@/core/moderation/visibility';
import { getNavGroups } from '@/core/modules/registry';
import { ROLE_LABEL } from '@/core/types';
import { Avatar, BrandLogo, accentSolid, cn } from '@/ui';

/* ============================================================================
   MENÚ LATERAL (ESCRITORIO)
   ----------------------------------------------------------------------------
   Misma fuente de datos que la barra inferior: el registro de módulos. En
   pantallas anchas se muestran todos los módulos sin agrupar en "Más".
   ========================================================================== */

export function SideNav() {
  const { user, role } = useAuth();
  const { all } = getNavGroups(role);
  const pending = usePendingCount(canModerate(role));

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <BrandLogo size="md" />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-bold leading-tight text-ink">
            {appConfig.organization.shortName}
          </p>
          <p className="truncate text-[11.5px] text-ink-3">{appConfig.organization.term}</p>
        </div>
      </div>

      <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto px-3 pb-4">
        <ul className="space-y-0.5">
          {all.map((mod) => (
            <li key={mod.id}>
              <NavLink
                to={mod.path}
                end={mod.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-field px-3 py-2.5 text-[14px] font-semibold transition',
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                  )
                }
              >
                <mod.icon size={19} />
                <span className="flex-1 truncate">{mod.title}</span>
                {mod.id === 'admin' && pending > 0 ? (
                  <span className={cn('rounded-full px-1.5 py-0.5 text-[10.5px] font-bold', accentSolid)}>
                    {pending}
                  </span>
                ) : null}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {user ? (
        <NavLink
          to="/perfil"
          className="flex items-center gap-3 border-t border-line px-4 py-3.5 transition hover:bg-surface-2"
        >
          <Avatar name={user.name} avatarKey={user.avatarKey} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-ink">{user.name}</p>
            <p className="truncate text-[11.5px] text-ink-3">
              {user.grade} · {ROLE_LABEL[user.role]}
            </p>
          </div>
        </NavLink>
      ) : null}
    </aside>
  );
}
