import type { ReactNode } from 'react';
import { appConfig } from '@/config/app.config';
import { AppImage, BrandLogo } from '@/ui';

/* ============================================================================
   MARCO DE LAS PANTALLAS DE ACCESO
   ----------------------------------------------------------------------------
   Estructura común de "Iniciar sesión" y "Activar mi cuenta": portada,
   logotipo e identidad de la organización. Las dos pantallas comparten este
   marco para que se vean como una sola experiencia y para que un cambio de
   diseño se haga en un único archivo.

   En móvil la portada es una franja superior; en escritorio ocupa la mitad
   izquierda.
   ========================================================================== */

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas lg:flex-row">
      <div className="relative h-40 shrink-0 overflow-hidden sm:h-56 lg:h-auto lg:w-1/2">
        <AppImage imageKey="auth.hero" ratio="4/3" rounded={false} className="h-full" />
      </div>

      <div className="safe-bottom flex flex-1 items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">
          <div className="mb-7">
            <BrandLogo size="lg" className="mb-4 shadow-card" />
            <p className="text-[12px] font-bold uppercase tracking-wider text-ink-3">
              {appConfig.organization.fullName}
            </p>
            <h1 className="mt-1 text-[27px] font-extrabold leading-tight tracking-tight text-ink">
              {title}
            </h1>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{description}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
