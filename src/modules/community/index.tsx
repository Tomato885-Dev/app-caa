import { Users } from 'lucide-react';
import type { AppModule } from '@/core/modules/types';
import { CommunityDetailPage } from './CommunityDetailPage';
import { CommunityListPage } from './CommunityListPage';

/* Comunidad y actividades permanentes (§6.6): información general, objetivos,
   responsables, formas de participación y enlaces de contacto. */

export const communityModule: AppModule = {
  id: 'community',
  title: 'Comunidad',
  description: 'Organizaciones y actividades permanentes.',
  icon: Users,
  tone: 'brand',
  path: '/comunidad',
  nav: { section: 'secondary', order: 60 },
  routes: [
    { index: true, element: <CommunityListPage /> },
    { path: ':id', element: <CommunityDetailPage /> },
  ],
};
