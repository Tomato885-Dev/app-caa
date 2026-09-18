import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { NovedadesProvider } from '@/app/novedades/NovedadesContext';
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
    /* Las novedades se cuentan una vez aquí y las leen la barra, el menú y la
       portada: ver `NovedadesContext`. */
    <NovedadesProvider>
      <div className="relative isolate min-h-dvh bg-canvas">
        {/* El fondo de la app: manchas de verde y amarillo que se mueven muy
          despacio detrás de todo, y una trama de puntos. Queda fijo, así que
          el contenido se desliza por encima como sobre un vidrio. */}
        <div aria-hidden className="fondo-vivo">
          <span className="mancha mancha-1" />
          <span className="mancha mancha-2" />
          <span className="mancha mancha-3" />
          <span className="trama" />
        </div>

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
    </NovedadesProvider>
  );
}
