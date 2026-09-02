import { Ticket } from 'lucide-react';
import type { AppModule } from '@/core/modules/types';
import { BenefitDetailPage } from './BenefitDetailPage';
import { BenefitsListPage } from './BenefitsListPage';

/* Colaboradores de la campaña. Los administradores cargan cada colaborador y
   el beneficio que entrega desde Administración → Contenidos → Colaboradores;
   el estudiante abre uno, lee de qué se trata y muestra su código QR.

   El identificador del módulo sigue siendo `benefits`: es interno, no se ve, y
   cambiarlo obligaría a migrar el contenido ya cargado sin ganar nada.

   La plataforma no valida el canje ni procesa pagos: solo entrega el código
   para que el colaborador lo lea. */

export const benefitsModule: AppModule = {
  id: 'benefits',
  title: 'Colaboradores',
  description: 'Quiénes apoyan la campaña y qué beneficio entregan.',
  icon: Ticket,
  tone: 'accent',
  path: '/colaboradores',
  nav: { section: 'secondary', order: 55 },
  routes: [
    { index: true, element: <BenefitsListPage /> },
    { path: ':id', element: <BenefitDetailPage /> },
  ],
};
