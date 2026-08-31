import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { RequireAuth, RequireRole } from '@/core/auth/guards';
import { getModules, registerModules } from '@/core/modules/registry';
import type { AppModule } from '@/core/modules/types';
import { appModules } from '@/modules';
import { AppShell } from '@/app/layout/AppShell';
import { LoginPage } from '@/app/pages/LoginPage';
import { NotFoundPage } from '@/app/pages/NotFoundPage';
import { RegisterPage } from '@/app/pages/RegisterPage';

/* ============================================================================
   ROUTER
   ----------------------------------------------------------------------------
   Las rutas se derivan del registro de módulos: no hay una lista de rutas que
   mantener en paralelo. Cada módulo aporta sus propias páginas y su rol mínimo.
   ========================================================================== */

registerModules(appModules);

/** Convierte un módulo en su rama de rutas, aplicando su guardia de rol. */
function toRoute(mod: AppModule): RouteObject {
  const branch: RouteObject = { path: mod.path, children: mod.routes };

  if (mod.minRole && mod.minRole !== 'student') {
    return { element: <RequireRole minimum={mod.minRole} />, children: [branch] };
  }
  return branch;
}

/*
 * Carpeta desde la que se sirve la app (`base` de Vite). Es '/' en un dominio
 * propio y '/nombre-del-repositorio/' en GitHub Pages; el router necesita
 * saberlo para que los enlaces internos apunten al lugar correcto.
 */
const basename = import.meta.env.BASE_URL;

const router = createBrowserRouter([
  { path: '/acceso', element: <LoginPage /> },
  { path: '/registro', element: <RegisterPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [...getModules().map(toRoute), { path: '*', element: <NotFoundPage /> }],
      },
    ],
  },
], { basename });

export function AppRouter() {
  return <RouterProvider router={router} />;
}
