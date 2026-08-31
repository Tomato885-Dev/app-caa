import { Newspaper } from 'lucide-react';
import type { AppModule } from '@/core/modules/types';
import { NewsDetailPage } from './NewsDetailPage';
import { NewsListPage } from './NewsListPage';

/* Noticias (§6.2). Solo los administradores publican; el resto de la
   comunidad lee. La creación se realiza desde Administración → Contenidos. */

export const newsModule: AppModule = {
  id: 'news',
  title: 'Noticias',
  description: 'Comunicados y anuncios oficiales.',
  icon: Newspaper,
  tone: 'brand',
  path: '/noticias',
  nav: { section: 'primary', order: 20 },
  routes: [
    { index: true, element: <NewsListPage /> },
    { path: ':id', element: <NewsDetailPage /> },
  ],
};
