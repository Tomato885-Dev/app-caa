import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import type { Role } from '@/core/types';
import { ROLE_LABEL } from '@/core/types';
import { EmptyState } from '@/ui/EmptyState';
import { SplashScreen } from '@/ui/SplashScreen';
import { useAuth } from './AuthContext';

/** Bloquea el acceso a usuarios sin sesión y recuerda a dónde querían ir. */
export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <SplashScreen />;
  if (!user) return <Navigate to="/acceso" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Restringe una rama de rutas a un rol mínimo (§8). */
export function RequireRole({ minimum }: { minimum: Role }) {
  const { hasRole, loading } = useAuth();

  if (loading) return <SplashScreen />;
  if (!hasRole(minimum)) {
    return (
      <div className="px-4 py-16">
        <EmptyState
          icon={ShieldAlert}
          title="Sección restringida"
          description={`Esta área está disponible solo para el perfil de ${ROLE_LABEL[minimum].toLowerCase()} o superior.`}
        />
      </div>
    );
  }
  return <Outlet />;
}
