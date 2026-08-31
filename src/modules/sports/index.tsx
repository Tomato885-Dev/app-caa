import { Trophy } from 'lucide-react';
import type { AppModule } from '@/core/modules/types';
import { SportsPage } from './SportsPage';

/* 365 · Resultados de las selecciones del colegio.
   Cinco disciplinas (fútbol, básquetbol, tenis, vóleibol y atletismo) por tres
   categorías (infantil, intermedia y superior). Los resultados se cargan desde
   Administración → Contenidos → 365. */

export const sportsModule: AppModule = {
  id: 'sports',
  title: '365',
  description: 'Resultados de las selecciones del colegio.',
  icon: Trophy,
  tone: 'brand',
  path: '/365',
  nav: { section: 'secondary', order: 50 },
  routes: [{ index: true, element: <SportsPage /> }],
};
