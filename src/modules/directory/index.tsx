import { BookUser } from 'lucide-react';
import type { AppModule } from '@/core/modules/types';
import { DirectoryPage } from './DirectoryPage';

/* Base de contactos: buscador de personas de la comunidad.
   No guarda datos propios — lee las cuentas que ya administra el panel de
   administración —, así que el correo y el teléfono se mantienen en un solo
   lugar. Cada persona puede ocultarse del buscador desde su perfil. */

export const directoryModule: AppModule = {
  id: 'directory',
  title: 'Contactos',
  description: 'Busca a alguien de la comunidad y contáctalo.',
  icon: BookUser,
  tone: 'neutral',
  path: '/contactos',
  nav: { section: 'secondary', order: 80 },
  routes: [{ index: true, element: <DirectoryPage /> }],
};
