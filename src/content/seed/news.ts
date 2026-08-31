import type { NewsPost } from '@/core/types';
import { author } from './users';

/* Noticias de ejemplo (§6.2). Publicadas solo por administradores. */

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

export const seedNews: NewsPost[] = [
  {
    id: 'new_1',
    title: 'Se abre la convocatoria a proyectos estudiantiles 2027',
    summary:
      'Cualquier grupo de estudiantes puede presentar una iniciativa para recibir apoyo del Centro de Alumnos.',
    body: `El Centro de Alumnos abre la convocatoria anual de proyectos estudiantiles. La invitación está dirigida a todos los cursos de enseñanza media que quieran desarrollar una iniciativa cultural, deportiva, académica o solidaria.

Cada proyecto debe presentar un objetivo claro, el equipo responsable y una estimación de los recursos necesarios. Las propuestas seleccionadas contarán con acompañamiento del Centro de Alumnos y espacio de difusión en esta plataforma.

Las postulaciones se reciben a través de la sección Inscripciones hasta la fecha indicada en la convocatoria.`,
    category: 'Centro de Alumnos',
    imageKey: 'news.asamblea',
    author: author('usr_admin'),
    featured: true,
    publishedAt: daysAgo(1),
    status: 'approved',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'new_2',
    title: 'Resultados de la elección de directivas de curso',
    summary:
      'Ya están disponibles los resultados oficiales del proceso eleccionario de todos los niveles.',
    body: `Finalizó el proceso de elección de directivas de curso con una participación cercana al 90% de los estudiantes habilitados.

Agradecemos a las comisiones electorales de cada nivel por su trabajo y a todas las listas que participaron. Las directivas electas asumen funciones a partir de la próxima semana.

El detalle por curso está disponible en la oficina del Centro de Alumnos y será enviado a cada profesor jefe.`,
    category: 'Comunicados',
    imageKey: 'news.resultados',
    author: author('usr_admin'),
    featured: false,
    publishedAt: daysAgo(4),
    status: 'approved',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
  {
    id: 'new_3',
    title: 'La campaña solidaria de invierno superó su meta',
    summary:
      'Gracias a la participación de todos los niveles se reunieron más de mil artículos de abrigo.',
    body: `La campaña solidaria de invierno cerró con un resultado muy por encima de lo esperado. Participaron los cursos de 8° básico a IV medio junto al área de acción social.

Los artículos reunidos serán entregados a las organizaciones con las que trabaja la comunidad escolar durante las próximas semanas.

Agradecemos especialmente a los equipos que coordinaron la recolección en cada nivel.`,
    category: 'Acción social',
    imageKey: 'news.campana-solidaria',
    author: author('usr_admin'),
    featured: true,
    publishedAt: daysAgo(9),
    status: 'approved',
    createdAt: daysAgo(9),
    updatedAt: daysAgo(9),
  },
  {
    id: 'new_4',
    title: 'Nuevo horario extendido de biblioteca en período de pruebas',
    summary: 'La sala de estudio permanecerá abierta hasta las 18:30 durante las semanas de evaluaciones.',
    body: `Durante los períodos de evaluación, la biblioteca ampliará su horario de atención hasta las 18:30 de lunes a jueves.

El espacio estará disponible para estudio individual y grupal. Se pide mantener el silencio en la sala principal y usar las salas anexas para trabajos en equipo.`,
    category: 'Académico',
    imageKey: 'news.horario-biblioteca',
    author: author('usr_admin'),
    featured: false,
    publishedAt: daysAgo(15),
    status: 'approved',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
  },
  {
    id: 'new_5',
    title: 'Taller de liderazgo para directivas de curso',
    summary:
      'Dos jornadas de formación en trabajo en equipo, organización y comunicación para representantes.',
    body: `Se realizará un taller de liderazgo dirigido a las directivas de curso electas y a quienes participan en organizaciones estudiantiles.

El taller aborda organización de equipos, planificación de actividades y comunicación efectiva dentro de la comunidad escolar.

Los cupos son limitados y la inscripción se realiza desde la sección Inscripciones.`,
    category: 'Centro de Alumnos',
    imageKey: 'news.taller-liderazgo',
    author: author('usr_admin'),
    featured: false,
    publishedAt: daysAgo(22),
    status: 'approved',
    createdAt: daysAgo(22),
    updatedAt: daysAgo(22),
  },
];
