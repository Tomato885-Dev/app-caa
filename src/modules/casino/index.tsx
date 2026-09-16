import { UtensilsCrossed } from 'lucide-react';
import type { AppModule } from '@/core/modules/types';
import { CasinoPage } from './CasinoPage';

/* La minuta del casino, día por día. La carga el Centro de Alumnos por mes
   desde Administración → Contenidos → Casino; los alumnos solo la leen. */

export const casinoModule: AppModule = {
  id: 'casino',
  title: 'Casino',
  description: 'Lo que se sirve cada día en el almuerzo.',
  icon: UtensilsCrossed,
  tone: 'accent',
  path: '/casino',
  nav: { section: 'secondary', order: 25 },
  routes: [{ index: true, element: <CasinoPage /> }],
};
