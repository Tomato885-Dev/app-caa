import { CalendarDays } from 'lucide-react';
import { db } from '@/core/data';
import type { AppModule, CalendarSource } from '@/core/modules/types';
import { EventDetailPage } from './EventDetailPage';
import { EventsListPage } from './EventsListPage';

/* Eventos (§6.3): calendario centralizado con fecha, horario, ubicación,
   descripción, requisitos y contacto. */

/** Los eventos publicados se dibujan en el calendario mensual. */
const eventsCalendar: CalendarSource = {
  id: 'events',
  label: 'Eventos',
  tone: 'brand',
  icon: CalendarDays,
  fetch: async () =>
    (await db.events.list())
      // Solo lo aprobado: el calendario es una vista pública del mes.
      .filter((event) => event.status === 'approved')
      .map((event) => ({
        id: event.id,
        date: event.startsAt,
        endDate: event.endsAt,
        title: event.title,
        detail: event.location,
        href: `/eventos/${event.id}`,
        sourceId: 'events',
      })),
};

export const eventsModule: AppModule = {
  id: 'events',
  title: 'Eventos',
  description: 'Calendario de actividades de la comunidad.',
  icon: CalendarDays,
  tone: 'brand',
  path: '/eventos',
  nav: { section: 'primary', order: 35 },
  routes: [
    { index: true, element: <EventsListPage /> },
    { path: ':id', element: <EventDetailPage /> },
  ],
  calendarSources: [eventsCalendar],
};
