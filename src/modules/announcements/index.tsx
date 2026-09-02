import { ClipboardList, Megaphone } from 'lucide-react';
import { db } from '@/core/data';
import type { AppModule, CalendarSource } from '@/core/modules/types';
import { AnnouncementDetailPage } from './AnnouncementDetailPage';
import { AnnouncementsPage } from './AnnouncementsPage';

/* ============================================================================
   COMUNICADOS DEL CENTRO DE ALUMNOS
   ----------------------------------------------------------------------------
   Avisos breves del día a día. Se diferencian de las noticias (§6.2) en el
   formato y el ritmo: aquí no hay imagen ni bajada editorial, sino información
   puntual, fechada y con destinatario. Publican solo los administradores.

   INCLUYE LAS INSCRIPCIONES
   Las convocatorias son comunicados de tipo 'inscripcion', no un módulo
   aparte: el colegio no autoriza inscribirse desde la aplicación, así que una
   convocatoria es un aviso que informa y explica cómo participar fuera de
   ella. Siendo lo mismo, se publican y se leen en el mismo lugar.
   ========================================================================== */

/** Los cierres de convocatoria aparecen solos en el calendario mensual. */
const inscriptionsCalendar: CalendarSource = {
  id: 'inscriptions',
  label: 'Cierre de inscripciones',
  tone: 'accent',
  icon: ClipboardList,
  fetch: async () =>
    (await db.announcements.list())
      .filter((item) => item.kind === 'inscripcion' && Boolean(item.deadline))
      .map((item) => ({
        id: item.id,
        date: item.deadline as string,
        title: `Cierran las inscripciones: ${item.title}`,
        detail: item.audience,
        // La fecha límite es del día completo, no de una hora concreta.
        allDay: true,
        href: `/comunicados/${item.id}`,
        sourceId: 'inscriptions',
      })),
};

export const announcementsModule: AppModule = {
  id: 'announcements',
  title: 'Comunicados',
  description: 'Avisos oficiales del día a día y convocatorias abiertas.',
  icon: Megaphone,
  tone: 'brand',
  path: '/comunicados',
  nav: { section: 'secondary', order: 15, shortLabel: 'Avisos' },
  routes: [
    { index: true, element: <AnnouncementsPage /> },
    { path: ':id', element: <AnnouncementDetailPage /> },
  ],
  calendarSources: [inscriptionsCalendar],
};
