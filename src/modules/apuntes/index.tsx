import { BookOpen } from 'lucide-react';
import type { AppModule } from '@/core/modules/types';
import { ApuntesPage } from './ApuntesPage';

/* La Central de apuntes: las carpetas de Drive de cada generación. El Centro
   de Alumnos agrega los enlaces desde Administración → Contenidos → Apuntes. */

export const apuntesModule: AppModule = {
  id: 'apuntes',
  title: 'Central de apuntes',
  description: 'Las carpetas de apuntes de tu generación.',
  icon: BookOpen,
  tone: 'brand',
  path: '/apuntes',
  nav: { section: 'secondary', order: 40, shortLabel: 'Apuntes' },
  routes: [{ index: true, element: <ApuntesPage /> }],
};
