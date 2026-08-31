import { ClipboardList } from 'lucide-react';
import { db } from '@/core/data';
import type { AppModule, CalendarSource } from '@/core/modules/types';
import { SignupDetailPage } from './SignupDetailPage';
import { SignupsListPage } from './SignupsListPage';

/* Inscripciones (§6.4): acción social, grupos scout, torneos, proyectos y
   actividades del Centro de Alumnos, con cupos y formulario configurable. */

/** Los cierres de convocatoria se marcan en el calendario para no perderlos. */
const signupsCalendar: CalendarSource = {
  id: 'signups',
  label: 'Cierre de inscripciones',
  tone: 'accent',
  icon: ClipboardList,
  fetch: async () =>
    (await db.signupActivities.list())
      .filter((activity) => activity.status === 'approved' && activity.open)
      .map((activity) => ({
        id: activity.id,
        date: activity.closesAt,
        title: `Cierran las inscripciones: ${activity.title}`,
        detail: activity.location,
        // La fecha límite es del día completo, no de una hora concreta.
        allDay: true,
        href: `/inscripciones/${activity.id}`,
        sourceId: 'signups',
      })),
};

export const signupsModule: AppModule = {
  id: 'signups',
  title: 'Inscripciones',
  description: 'Participa en actividades con cupos abiertos.',
  icon: ClipboardList,
  tone: 'brand',
  path: '/inscripciones',
  nav: { section: 'primary', order: 40, shortLabel: 'Inscribir' },
  routes: [
    { index: true, element: <SignupsListPage /> },
    { path: ':id', element: <SignupDetailPage /> },
  ],
  calendarSources: [signupsCalendar],
};
