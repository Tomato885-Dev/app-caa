import type { EventItem } from '@/core/types';
import { author } from './users';

/* Eventos de ejemplo (§6.3): fecha, horario, ubicación, requisitos y contacto. */

const inDays = (days: number, hour = 9, minute = 0) => {
  const date = new Date(Date.now() + days * 86_400_000);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

export const seedEvents: EventItem[] = [
  {
    id: 'evt_1',
    title: 'Semana de aniversario',
    description:
      'Cinco días de competencias entre alianzas, actividades culturales y el acto de cierre. Cada alianza presenta su barra, coreografía y stand temático.',
    category: 'Institucional',
    imageKey: 'event.aniversario',
    startsAt: inDays(6, 8, 30),
    endsAt: inDays(10, 18, 0),
    location: 'Patio central y gimnasio',
    requirements: 'Participación abierta a toda la enseñanza media. Uso de buzo institucional.',
    contactName: 'Comisión de aniversario',
    contactEmail: 'centrodealumnos@verbo.cl',
    organizer: author('usr_admin'),
    status: 'approved',
    createdAt: daysAgo(20),
    updatedAt: daysAgo(3),
  },
  {
    id: 'evt_2',
    title: 'Torneo interescolar de fútbol',
    description:
      'Fase de grupos del torneo interescolar. Participan las selecciones de I a IV medio en categorías damas y varones.',
    category: 'Deportivo',
    imageKey: 'event.torneo-futbol',
    startsAt: inDays(3, 15, 0),
    endsAt: inDays(3, 19, 0),
    location: 'Cancha principal',
    requirements: 'Solo jugadores inscritos en la nómina de cada selección.',
    contactName: 'Coordinación deportiva',
    contactEmail: 'deportes@verbo.cl',
    organizer: author('usr_admin'),
    status: 'approved',
    createdAt: daysAgo(14),
    updatedAt: daysAgo(14),
  },
  {
    id: 'evt_3',
    title: 'Feria vocacional',
    description:
      'Instituciones de educación superior presentan sus carreras y procesos de admisión. Incluye charlas breves durante toda la jornada.',
    category: 'Académico',
    imageKey: 'event.feria-vocacional',
    startsAt: inDays(18, 9, 0),
    endsAt: inDays(18, 13, 30),
    location: 'Gimnasio techado',
    requirements: 'Dirigida principalmente a III y IV medio. Asistencia libre para el resto.',
    contactName: 'Orientación',
    contactEmail: 'orientacion@verbo.cl',
    organizer: author('usr_admin'),
    status: 'approved',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  {
    id: 'evt_4',
    title: 'Muestra de arte y música estudiantil',
    description:
      'Exposición de trabajos visuales y presentaciones musicales preparadas por estudiantes de todos los niveles.',
    category: 'Cultural',
    imageKey: 'event.gala-arte',
    startsAt: inDays(27, 18, 30),
    endsAt: inDays(27, 21, 0),
    location: 'Salón de actos',
    requirements: 'Entrada liberada. Inscripción previa para quienes expongan.',
    contactName: 'Academia de artes',
    contactEmail: 'artes@verbo.cl',
    organizer: author('usr_admin'),
    status: 'approved',
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
  },
  {
    id: 'evt_5',
    title: 'Jornada scout de fin de semestre',
    description:
      'Actividad al aire libre con juegos de patrulla, fogata y ceremonia de progresión personal.',
    category: 'Recreativo',
    imageKey: 'event.jornada-scout',
    startsAt: inDays(40, 9, 0),
    endsAt: inDays(41, 17, 0),
    location: 'Por confirmar',
    requirements: 'Autorización del apoderado y equipo personal de campamento.',
    contactName: 'Grupo scout',
    contactEmail: 'scouts@verbo.cl',
    organizer: author('usr_est4'),
    status: 'approved',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
  },
];
