import { CalendarRange } from 'lucide-react';
import type { AppModule } from '@/core/modules/types';
import { CalendarPage } from './CalendarPage';

/* Calendario mensual de actividades del Centro de Alumnos.

   El módulo no tiene datos propios: dibuja lo que aportan las `calendarSources`
   de los demás módulos (eventos, convocatorias de inscripción y las que se
   sumen después). Para que una actividad aparezca en el calendario basta con
   publicarla en su módulo; no hay que cargarla dos veces. */

export const calendarModule: AppModule = {
  id: 'calendar',
  title: 'Calendario',
  description: 'Las actividades del mes, en una sola vista.',
  icon: CalendarRange,
  tone: 'brand',
  path: '/calendario',
  nav: { section: 'secondary', order: 30 },
  routes: [{ index: true, element: <CalendarPage /> }],
};
