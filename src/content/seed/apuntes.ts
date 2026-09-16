import type { CarpetaApuntes } from '@/core/types';

/* ============================================================================
   CARPETAS DE EJEMPLO
   ----------------------------------------------------------------------------
   Solo para el modo demostración. Las generaciones se calculan sobre el año en
   curso, para que siempre calcen con los cursos de hoy. Los enlaces no llevan
   a ninguna carpeta real: con servidor, los carga el Centro de Alumnos.
   ========================================================================== */

const año = new Date().getFullYear();
const ahora = new Date().toISOString();

const NIVELES = ['IV Medio', 'III Medio', 'II Medio', 'I Medio', '8° Básico'];

export const seedApuntes: CarpetaApuntes[] = [
  ...NIVELES.map((nivel, faltan) => ({
    id: `apu_${faltan + 1}`,
    titulo: `Central de apuntes · Generación ${año + faltan}`,
    generacion: año + faltan,
    url: `https://drive.google.com/drive/folders/ejemplo-generacion-${año + faltan}`,
    descripcion: `Guías, resúmenes y pruebas anteriores, ordenados por asignatura. Hoy es ${nivel}.`,
    createdAt: ahora,
    updatedAt: ahora,
  })),
  {
    id: 'apu_6',
    titulo: 'Material para todos',
    url: 'https://drive.google.com/drive/folders/ejemplo-para-todos',
    descripcion: 'Técnicas de estudio, calendario de pruebas y formatos de trabajos.',
    createdAt: ahora,
    updatedAt: ahora,
  },
];
