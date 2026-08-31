import { CircleUser } from 'lucide-react';
import type { AppModule } from '@/core/modules/types';
import { ProfilePage } from './ProfilePage';

/* Perfil de usuario (§6.8). Accesible desde el avatar de la barra superior y
   desde el menú lateral, por eso no ocupa un espacio en la barra inferior. */

export const profileModule: AppModule = {
  id: 'profile',
  title: 'Mi perfil',
  description: 'Tus datos, inscripciones y publicaciones.',
  icon: CircleUser,
  tone: 'neutral',
  path: '/perfil',
  nav: { section: 'secondary', order: 90 },
  routes: [{ index: true, element: <ProfilePage /> }],
};
