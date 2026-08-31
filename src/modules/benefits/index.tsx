import { Ticket } from 'lucide-react';
import type { AppModule } from '@/core/modules/types';
import { BenefitDetailPage } from './BenefitDetailPage';
import { BenefitsListPage } from './BenefitsListPage';

/* Beneficios de la campaña. Los administradores cargan los convenios desde
   Administración → Contenidos → Beneficios; el estudiante abre uno, lee de qué
   se trata y muestra su código QR para canjearlo.

   La plataforma no valida el canje ni procesa pagos: solo entrega el código,
   igual que el marketplace solo difunde y no cobra (§6.7). */

export const benefitsModule: AppModule = {
  id: 'benefits',
  title: 'Beneficios',
  description: 'Convenios de la campaña, con código QR.',
  icon: Ticket,
  tone: 'accent',
  path: '/beneficios',
  nav: { section: 'secondary', order: 55 },
  routes: [
    { index: true, element: <BenefitsListPage /> },
    { path: ':id', element: <BenefitDetailPage /> },
  ],
};
