import type { Announcement } from '@/core/types';
import { author } from './users';

/* ============================================================================
   COMUNICADOS DE EJEMPLO
   ----------------------------------------------------------------------------
   Avisos breves del día a día: lo que el Centro de Alumnos necesita informar
   hoy, sin el formato editorial de una noticia.

   HAY DOS CLASES
     · 'general'      el aviso corriente.
     · 'inscripcion'  anuncia una convocatoria abierta.

   Las inscripciones NO se gestionan en la aplicación: el colegio no lo
   autoriza. El comunicado avisa de la convocatoria y explica en su propio
   texto cómo participar. Por eso llevan `deadline` (hasta cuándo) pero no
   cupos ni botón para inscribirse.
   ========================================================================== */

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
const daysFromNow = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

export const seedAnnouncements: Announcement[] = [
  {
    id: 'com_1',
    title: 'Cambio de sala para la asamblea de delegados',
    body: 'La asamblea de esta semana se traslada de la sala de reuniones al auditorio, porque se sumaron los delegados de enseñanza básica.\nLa hora se mantiene: 13:15, después del segundo recreo. Los delegados que no puedan asistir deben avisar a su vocal de curso.',
    kind: 'general',
    priority: 'importante',
    audience: 'Delegados de curso',
    pinned: true,
    author: author('usr_admin'),
    publishedAt: hoursAgo(4),
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(4),
  },
  {
    id: 'com_2',
    title: 'Último día para entregar los aportes de la campaña',
    body: 'Mañana cierra la recepción de aportes para la campaña solidaria. La caja estará en portería hasta las 16:00 y no se recibirán entregas atrasadas.\nLos cursos que ya completaron su meta pueden retirar su certificado en la oficina del Centro de Alumnos.',
    kind: 'general',
    priority: 'urgente',
    audience: 'Toda la comunidad',
    pinned: true,
    author: author('usr_admin'),
    publishedAt: hoursAgo(20),
    createdAt: hoursAgo(20),
    updatedAt: hoursAgo(20),
  },
  {
    id: 'com_3',
    title: 'Resultados de la votación por el lema del aniversario',
    body: 'Con 412 votos válidos, el lema elegido para la semana de aniversario fue el presentado por III Medio B.\nAgradecemos a todos los cursos que enviaron propuestas. El detalle del conteo queda disponible en la oficina del Centro de Alumnos para quien quiera revisarlo.',
    kind: 'general',
    priority: 'normal',
    audience: 'Toda la comunidad',
    pinned: false,
    author: author('usr_admin'),
    publishedAt: daysAgo(2),
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: 'com_4',
    title: 'Se habilita el nuevo horario de la sala de estudio',
    body: 'A partir del lunes, la sala de estudio queda abierta hasta las 18:30 de lunes a jueves.\nEl uso es libre y no requiere inscripción, pero se pide mantener silencio y dejar los puestos ordenados al salir.',
    kind: 'general',
    priority: 'normal',
    audience: 'Enseñanza media',
    pinned: false,
    author: author('usr_mod'),
    publishedAt: daysAgo(4),
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
  {
    id: 'com_5',
    title: 'Recordatorio: uso de la cancha durante los recreos',
    body: 'La cancha principal se reparte por niveles según el calendario publicado en el diario mural. Esta semana corresponde a I y II Medio.\nDurante los entrenamientos de las selecciones la cancha queda cerrada al uso libre.',
    kind: 'general',
    priority: 'normal',
    audience: 'I y II Medio',
    pinned: false,
    author: author('usr_admin'),
    publishedAt: daysAgo(6),
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
  },

  /* --- Comunicados de inscripción ------------------------------------------
     Anuncian una convocatoria. El cómo participar va dentro del texto.      */
  {
    id: 'com_ins_1',
    title: 'Convocatoria para la brigada ambiental',
    body: 'Se abren las postulaciones para integrar la brigada ambiental de este año. Buscamos estudiantes de todos los niveles con ganas de hacerse cargo del huerto, los puntos de reciclaje y las campañas del colegio.\nPara postular, habla con tu profesor jefe antes de la fecha de cierre. Él enviará los nombres de tu curso a la coordinación.',
    kind: 'inscripcion',
    priority: 'importante',
    audience: 'Toda la comunidad',
    pinned: false,
    deadline: daysFromNow(12),
    author: author('usr_admin'),
    publishedAt: daysAgo(3),
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: 'com_ins_2',
    title: 'Inscripciones para el taller de debate',
    body: 'El taller de debate abre sus inscripciones para el segundo semestre. Se reúne los martes en la sala de reuniones, después de la jornada.\nAnótate con la profesora encargada en la sala de profesores durante los recreos. Los cupos son limitados y se asignan por orden de llegada.',
    kind: 'inscripcion',
    priority: 'normal',
    audience: 'Enseñanza media',
    pinned: false,
    deadline: daysFromNow(5),
    author: author('usr_admin'),
    publishedAt: daysAgo(6),
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
  },
];
