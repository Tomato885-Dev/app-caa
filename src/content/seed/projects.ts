import type { Project } from '@/core/types';

/* ============================================================================
   PROYECTOS DEL COLEGIO
   ----------------------------------------------------------------------------
   Trece espacios, uno por cada proyecto del establecimiento, listos para
   completar. Los títulos y textos son provisorios: reemplázalos desde
   Administración → Contenidos → Proyectos y luego exporta el contenido.

   QUÉ EDITAR EN CADA UNO
     · Nombre, la frase del listado y la descripción completa.
     · El área, para que los filtros agrupen bien.
     · El estado: "En marcha" o "Ya terminó" (con su año de término).
     · Cómo participar, en los que siguen vigentes.

   Van sin fotografía a propósito. Si más adelante quieren agregarlas, se
   declaran en `content/images.ts` con claves que empiecen por `projects.`
   y se eligen desde el mismo formulario.
   ========================================================================== */

const iso = (year: number, month: number, day: number) =>
  new Date(year, month - 1, day, 12).toISOString();

export const seedProjects: Project[] = [
  {
    id: 'prj_01',
    title: 'Proyecto 1',
    summary: 'Pendiente de completar: describe el proyecto en una frase.',
    description:
      'Pendiente de completar.\nCuenta cómo partió el proyecto, qué hace hoy y qué ha logrado. Escribe simple: este apartado lo leen sobre todo los cursos más pequeños.',
    area: 'Medioambiente',
    status: 'activo',
    startYear: 2026,
    endYear: null,
    createdAt: iso(2026, 1, 1),
    updatedAt: iso(2026, 1, 1),
  },
  {
    id: 'prj_02',
    title: 'Proyecto 2',
    summary: 'Pendiente de completar: describe el proyecto en una frase.',
    description:
      'Pendiente de completar.\nCuenta cómo partió el proyecto, qué hace hoy y qué ha logrado. Escribe simple: este apartado lo leen sobre todo los cursos más pequeños.',
    area: 'Acción social',
    status: 'activo',
    startYear: 2026,
    endYear: null,
    createdAt: iso(2026, 1, 2),
    updatedAt: iso(2026, 1, 2),
  },
  {
    id: 'prj_03',
    title: 'Proyecto 3',
    summary: 'Pendiente de completar: describe el proyecto en una frase.',
    description:
      'Pendiente de completar.\nCuenta cómo partió el proyecto, qué hace hoy y qué ha logrado. Escribe simple: este apartado lo leen sobre todo los cursos más pequeños.',
    area: 'Cultura y arte',
    status: 'activo',
    startYear: 2026,
    endYear: null,
    createdAt: iso(2026, 1, 3),
    updatedAt: iso(2026, 1, 3),
  },
  {
    id: 'prj_04',
    title: 'Proyecto 4',
    summary: 'Pendiente de completar: describe el proyecto en una frase.',
    description:
      'Pendiente de completar.\nCuenta cómo partió el proyecto, qué hace hoy y qué ha logrado. Escribe simple: este apartado lo leen sobre todo los cursos más pequeños.',
    area: 'Deporte',
    status: 'activo',
    startYear: 2026,
    endYear: null,
    createdAt: iso(2026, 1, 4),
    updatedAt: iso(2026, 1, 4),
  },
  {
    id: 'prj_05',
    title: 'Proyecto 5',
    summary: 'Pendiente de completar: describe el proyecto en una frase.',
    description:
      'Pendiente de completar.\nCuenta cómo partió el proyecto, qué hace hoy y qué ha logrado. Escribe simple: este apartado lo leen sobre todo los cursos más pequeños.',
    area: 'Ciencia y tecnología',
    status: 'activo',
    startYear: 2026,
    endYear: null,
    createdAt: iso(2026, 1, 5),
    updatedAt: iso(2026, 1, 5),
  },
  {
    id: 'prj_06',
    title: 'Proyecto 6',
    summary: 'Pendiente de completar: describe el proyecto en una frase.',
    description:
      'Pendiente de completar.\nCuenta cómo partió el proyecto, qué hace hoy y qué ha logrado. Escribe simple: este apartado lo leen sobre todo los cursos más pequeños.',
    area: 'Convivencia',
    status: 'activo',
    startYear: 2026,
    endYear: null,
    createdAt: iso(2026, 1, 6),
    updatedAt: iso(2026, 1, 6),
  },
  {
    id: 'prj_07',
    title: 'Proyecto 7',
    summary: 'Pendiente de completar: describe el proyecto en una frase.',
    description:
      'Pendiente de completar.\nCuenta cómo partió el proyecto, qué hace hoy y qué ha logrado. Escribe simple: este apartado lo leen sobre todo los cursos más pequeños.',
    area: 'Medioambiente',
    status: 'activo',
    startYear: 2026,
    endYear: null,
    createdAt: iso(2026, 1, 7),
    updatedAt: iso(2026, 1, 7),
  },
  {
    id: 'prj_08',
    title: 'Proyecto 8',
    summary: 'Pendiente de completar: describe el proyecto en una frase.',
    description:
      'Pendiente de completar.\nCuenta cómo partió el proyecto, qué hace hoy y qué ha logrado. Escribe simple: este apartado lo leen sobre todo los cursos más pequeños.',
    area: 'Acción social',
    status: 'activo',
    startYear: 2026,
    endYear: null,
    createdAt: iso(2026, 1, 8),
    updatedAt: iso(2026, 1, 8),
  },
  {
    id: 'prj_09',
    title: 'Proyecto 9',
    summary: 'Pendiente de completar: describe el proyecto en una frase.',
    description:
      'Pendiente de completar.\nCuenta cómo partió el proyecto, qué hace hoy y qué ha logrado. Escribe simple: este apartado lo leen sobre todo los cursos más pequeños.',
    area: 'Cultura y arte',
    status: 'activo',
    startYear: 2026,
    endYear: null,
    createdAt: iso(2026, 1, 9),
    updatedAt: iso(2026, 1, 9),
  },
  {
    id: 'prj_10',
    title: 'Proyecto 10',
    summary: 'Pendiente de completar: describe el proyecto en una frase.',
    description:
      'Pendiente de completar.\nCuenta cómo partió el proyecto, qué hace hoy y qué ha logrado. Escribe simple: este apartado lo leen sobre todo los cursos más pequeños.',
    area: 'Deporte',
    status: 'activo',
    startYear: 2026,
    endYear: null,
    createdAt: iso(2026, 1, 10),
    updatedAt: iso(2026, 1, 10),
  },
  {
    id: 'prj_11',
    title: 'Proyecto 11',
    summary: 'Pendiente de completar: describe el proyecto en una frase.',
    description:
      'Pendiente de completar.\nCuenta cómo partió el proyecto, qué hace hoy y qué ha logrado. Escribe simple: este apartado lo leen sobre todo los cursos más pequeños.',
    area: 'Ciencia y tecnología',
    status: 'activo',
    startYear: 2026,
    endYear: null,
    createdAt: iso(2026, 1, 11),
    updatedAt: iso(2026, 1, 11),
  },
  {
    id: 'prj_12',
    title: 'Proyecto 12',
    summary: 'Pendiente de completar: describe el proyecto en una frase.',
    description:
      'Pendiente de completar.\nCuenta cómo partió el proyecto, qué hace hoy y qué ha logrado. Escribe simple: este apartado lo leen sobre todo los cursos más pequeños.',
    area: 'Convivencia',
    status: 'activo',
    startYear: 2026,
    endYear: null,
    createdAt: iso(2026, 1, 12),
    updatedAt: iso(2026, 1, 12),
  },
  {
    id: 'prj_13',
    title: 'Proyecto 13',
    summary: 'Pendiente de completar: describe el proyecto en una frase.',
    description:
      'Pendiente de completar.\nCuenta cómo partió el proyecto, qué hace hoy y qué ha logrado. Escribe simple: este apartado lo leen sobre todo los cursos más pequeños.',
    area: 'Medioambiente',
    status: 'activo',
    startYear: 2026,
    endYear: null,
    createdAt: iso(2026, 1, 13),
    updatedAt: iso(2026, 1, 13),
  },
];
