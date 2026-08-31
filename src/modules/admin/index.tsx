import { ShieldCheck } from 'lucide-react';
import { RequireRole } from '@/core/auth/guards';
import type { AppModule } from '@/core/modules/types';
import { AdminHomePage } from './AdminHomePage';
import { ContentPage } from './ContentPage';
import { ModerationQueuePage } from './ModerationQueuePage';
import { ReportsPage } from './ReportsPage';
import { UsersPage } from './UsersPage';

/* Administración y gobernanza (§8). Visible desde el rol de moderador; las
   herramientas de gestión de contenidos y cuentas exigen rol de administrador. */

export const adminModule: AppModule = {
  id: 'admin',
  title: 'Administración',
  description: 'Moderación, reportes y gestión de contenidos.',
  icon: ShieldCheck,
  tone: 'danger',
  path: '/admin',
  minRole: 'moderator',
  nav: { section: 'secondary', order: 95, shortLabel: 'Admin' },
  routes: [
    { index: true, element: <AdminHomePage /> },
    { path: 'moderacion', element: <ModerationQueuePage /> },
    { path: 'reportes', element: <ReportsPage /> },
    {
      element: <RequireRole minimum="admin" />,
      children: [
        { path: 'contenidos', element: <ContentPage /> },
        { path: 'usuarios', element: <UsersPage /> },
      ],
    },
  ],
};
