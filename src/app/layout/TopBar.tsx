import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Moon, Sun, SunMoon } from 'lucide-react';
import { appConfig } from '@/config/app.config';
import { useAuth } from '@/core/auth/AuthContext';
import { findModuleByPath } from '@/core/modules/registry';
import { useTheme } from '@/app/theme/ThemeContext';
import { Avatar, BrandLogo, IconButton } from '@/ui';
import { Link } from 'react-router-dom';

/* ============================================================================
   BARRA SUPERIOR (MÓVIL)
   ----------------------------------------------------------------------------
   En la raíz de un módulo muestra la identidad del Centro de Alumnos; en
   páginas de detalle se convierte en cabecera de navegación con botón atrás.
   ========================================================================== */

const themeIcon = { light: Sun, dark: Moon, system: SunMoon } as const;
const themeLabel = { light: 'Tema claro', dark: 'Tema oscuro', system: 'Tema automático' } as const;
const nextTheme = { light: 'dark', dark: 'system', system: 'light' } as const;

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { preference, setPreference } = useTheme();

  const currentModule = findModuleByPath(location.pathname);
  const isDetailPage = Boolean(currentModule && location.pathname !== currentModule.path);
  const ThemeIcon = themeIcon[preference];

  return (
    <header className="safe-top sticky top-0 z-30 border-b border-line bg-surface lg:hidden">
      <div className="flex h-14 items-center gap-1 px-2">
        {isDetailPage ? (
          <>
            <IconButton icon={ChevronLeft} label="Volver" onClick={() => navigate(-1)} />
            <h1 className="min-w-0 flex-1 truncate text-[15px] font-bold text-ink">
              {currentModule?.title}
            </h1>
          </>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2.5 pl-2">
            <BrandLogo size="sm" />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold leading-tight text-ink">
                {appConfig.organization.shortName}
              </p>
              <p className="truncate text-[11px] leading-tight text-ink-3">
                {appConfig.organization.institution}
              </p>
            </div>
          </div>
        )}

        <IconButton
          icon={ThemeIcon}
          label={`${themeLabel[preference]}. Tocar para cambiar.`}
          onClick={() => setPreference(nextTheme[preference])}
        />

        {user ? (
          <Link to="/perfil" aria-label="Mi perfil" className="ml-0.5 mr-1 shrink-0">
            <Avatar name={user.name} avatarKey={user.avatarKey} size="sm" />
          </Link>
        ) : null}
      </div>
    </header>
  );
}
