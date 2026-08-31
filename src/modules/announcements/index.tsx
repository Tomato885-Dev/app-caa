import { Megaphone } from 'lucide-react';
import type { AppModule } from '@/core/modules/types';
import { AnnouncementDetailPage } from './AnnouncementDetailPage';
import { AnnouncementsPage } from './AnnouncementsPage';

/* Comunicados del Centro de Alumnos: avisos breves del día a día.
   Se diferencian de las noticias (§6.2) en el formato y el ritmo: aquí no hay
   imagen ni bajada editorial, sino información puntual, fechada y con
   destinatario. Publican solo los administradores. */

export const announcementsModule: AppModule = {
  id: 'announcements',
  title: 'Comunicados',
  description: 'Avisos oficiales del día a día.',
  icon: Megaphone,
  tone: 'brand',
  path: '/comunicados',
  nav: { section: 'secondary', order: 15, shortLabel: 'Avisos' },
  routes: [
    { index: true, element: <AnnouncementsPage /> },
    { path: ':id', element: <AnnouncementDetailPage /> },
  ],
};
