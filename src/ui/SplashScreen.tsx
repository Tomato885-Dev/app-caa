import { Loader2 } from 'lucide-react';
import { appConfig } from '@/config/app.config';
import { BrandLogo } from './BrandLogo';

/** Pantalla de espera mientras se restaura la sesión. */
export function SplashScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-canvas">
      <BrandLogo size="xl" className="shadow-card" />

      <div className="flex items-center gap-2 text-ink-3">
        <Loader2 size={15} className="animate-spin" />
        <p className="text-[13px] font-medium">{appConfig.organization.shortName}</p>
      </div>
    </div>
  );
}
