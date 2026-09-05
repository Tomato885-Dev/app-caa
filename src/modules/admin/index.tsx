import { ShieldCheck } from 'lucide-react';
import { RequireRole } from '@/core/auth/guards';
import type { AppModule } from '@/core/modules/types';
import { AdminHomePage } from './AdminHomePage';
import { ContentPage } from './ContentPage';
import { UsersPage } from './UsersPage';

/* ============================================================================
   ADMINISTRACIÓN
   ----------------------------------------------------------------------------
   Dos herramientas: publicar contenido y gestionar cuentas.

   YA NO HAY COLA DE MODERACIÓN NI REPORTES
   Tenían sentido cuando los estudiantes podían publicar —el Marketplace y los
   grupos de Comunidad— y todo pasaba por revisión antes de aparecer. Al
   quitarse esos módulos por decisión del colegio, publicar quedó reservado al
   equipo, así que no había nada que revisar ni a quién reportar: las dos
   pantallas mostraban listas permanentemente vacías.

   QUÉ ES HOY UN MODERADOR
   Alguien que puede publicar pero no tocar cuentas. Es el mismo permiso que da
   la base de datos (`es_editor()` en `supabase/01-esquema.sql`), y por eso el
   módulo sigue empezando en ese rol: si la app exigiera ser administrador, un
   moderador tendría permiso para publicar y ninguna pantalla desde donde
   hacerlo.
   ========================================================================== */

export const adminModule: AppModule = {
  id: 'admin',
  title: 'Administración',
  description: 'Gestión de contenidos y cuentas.',
  icon: ShieldCheck,
  tone: 'danger',
  path: '/admin',
  minRole: 'moderator',
  nav: { section: 'secondary', order: 95, shortLabel: 'Admin' },
  routes: [
    { index: true, element: <AdminHomePage /> },
    { path: 'contenidos', element: <ContentPage /> },
    // Las cuentas y los roles solo los toca la administración.
    {
      element: <RequireRole minimum="admin" />,
      children: [{ path: 'usuarios', element: <UsersPage /> }],
    },
  ],
};
