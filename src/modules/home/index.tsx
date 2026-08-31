import { House } from 'lucide-react';
import type { AppModule } from '@/core/modules/types';
import { HomePage } from './HomePage';

/* Inicio (§6.1): nexo de acceso a la información más relevante. */

export const homeModule: AppModule = {
  id: 'home',
  title: 'Inicio',
  description: 'Resumen de la actividad escolar.',
  icon: House,
  tone: 'brand',
  path: '/',
  nav: { section: 'primary', order: 10 },
  routes: [{ index: true, element: <HomePage /> }],
};
