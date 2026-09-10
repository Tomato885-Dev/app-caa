import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { RequireAuth, RequireRole } from '@/core/auth/guards';
import { escucharNativo } from '@/core/notifications/nativo';
import { getModules, registerModules } from '@/core/modules/registry';
import type { AppModule } from '@/core/modules/types';
import { appModules } from '@/modules';
import { AppShell } from '@/app/layout/AppShell';
import { LoginPage } from '@/app/pages/LoginPage';
import { NotFoundPage } from '@/app/pages/NotFoundPage';
import { RecoverPasswordPage } from '@/app/pages/RecoverPasswordPage';
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
  { path: '/recuperar', element: <RecoverPasswordPage /> },
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

/* ----------------------------------------------------------------------------
   TOCAR UNA NOTIFICACIÓN ABRE LO QUE ANUNCIA
   Solo en la app instalada; en el navegador de esto se encarga `public/sw.js`.

   Va aquí, fuera de React, por una razón: cuando alguien toca el aviso con la
   app cerrada, el sistema la levanta y entrega el evento antes de que exista
   ningún componente montado que pueda escucharlo. El router, en cambio, ya
   está construido en cuanto se carga este archivo.

   Un aviso que solo abre la aplicación en la portada obliga a buscar a mano lo
   que se acaba de anunciar, que es justo lo que la notificación venía a
   ahorrar.
   -------------------------------------------------------------------------- */
escucharNativo((ruta) => void router.navigate(ruta));

export function AppRouter() {
  return <RouterProvider router={router} />;
}
