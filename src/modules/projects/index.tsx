import { Lightbulb } from 'lucide-react';
import type { AppModule } from '@/core/modules/types';
import { ProjectDetailPage } from './ProjectDetailPage';
import { ProjectsPage } from './ProjectsPage';

/* Proyectos del colegio: iniciativas vigentes e históricas, contadas en
   lenguaje simple porque el apartado apunta a los cursos más pequeños.
   Publican solo los administradores, igual que los comunicados. */

export const projectsModule: AppModule = {
  id: 'projects',
  title: 'Proyectos',
  description: 'Lo que el colegio ha construido con los años.',
  icon: Lightbulb,
  tone: 'accent',
  path: '/proyectos',
  nav: { section: 'secondary', order: 45, shortLabel: 'Proyectos' },
  routes: [
    { index: true, element: <ProjectsPage /> },
    { path: ':id', element: <ProjectDetailPage /> },
  ],
};
