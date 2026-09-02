import type { AppModule } from '@/core/modules/types';
import { adminModule } from './admin';
import { announcementsModule } from './announcements';
import { benefitsModule } from './benefits';
import { calendarModule } from './calendar';
import { directoryModule } from './directory';
import { eventsModule } from './events';
import { homeModule } from './home';
import { newsModule } from './news';
import { profileModule } from './profile';
import { projectsModule } from './projects';
import { sportsModule } from './sports';

/* ============================================================================
   MÓDULOS DE LA APLICACIÓN
   ----------------------------------------------------------------------------
   Única lista que hay que tocar para incorporar un apartado nuevo:

   1. Crear `src/modules/<nuevo>/index.tsx` exportando un `AppModule`.
   2. Importarlo y agregarlo a este arreglo.
   3. Añadir su `id` a `appConfig.enabledModules`.

   El router, la navegación (móvil y escritorio), los accesos directos de
   Inicio, el calendario mensual y la cola de moderación se actualizan solos.
   ========================================================================== */

export const appModules: AppModule[] = [
  homeModule,
  announcementsModule,
  newsModule,
  calendarModule,
  eventsModule,
  sportsModule,
  benefitsModule,
  projectsModule,
  directoryModule,
  profileModule,
  adminModule,
];
