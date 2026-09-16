import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { InvitacionAvisos } from './InvitacionAvisos';
import { SideNav } from './SideNav';
import { TopBar } from './TopBar';

/**
 * Estructura común de todas las pantallas autenticadas:
 * menú lateral en escritorio, barra superior e inferior en móvil.
 */
export function AppShell() {
  const location = useLocation();

  // Cada navegación empieza arriba, como en una app nativa.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="min-h-dvh bg-canvas">
      <SideNav />

      <div className="lg:pl-64">
        <TopBar />
        <main className="animate-fade" key={location.pathname}>
          <Outlet />
        </main>
      </div>

      <BottomNav />

      {/* Solo aquí, dentro de la app con sesión: nunca en la pantalla de acceso. */}
      <InvitacionAvisos />
    </div>
  );
}
