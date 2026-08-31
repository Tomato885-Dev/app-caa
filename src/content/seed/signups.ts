import type { Registration, SignupActivity } from '@/core/types';
import { author } from './users';

/* Actividades con inscripción (§6.4) y registros de ejemplo. */

const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

export const seedSignupActivities: SignupActivity[] = [
  {
    id: 'act_1',
    title: 'Voluntariado de acción social',
    description:
      'Equipo permanente que organiza visitas, colectas y apoyo escolar en instituciones de la comuna. Se trabaja en turnos de sábado por medio.',
    kind: 'accion_social',
    imageKey: 'signup.accion-social',
    organizer: author('usr_admin'),
    closesAt: inDays(12),
    capacity: 40,
    location: 'Punto de encuentro: portería principal',
    requirements: 'Autorización del apoderado. Disponibilidad de al menos dos sábados al mes.',
    questions: [
      {
        id: 'q_disponibilidad',
        label: '¿Qué sábados tienes disponibilidad?',
        type: 'select',
        required: true,
        options: ['Primer y tercer sábado', 'Segundo y cuarto sábado', 'Todos los sábados'],
      },
      {
        id: 'q_experiencia',
        label: '¿Has participado antes en voluntariados? Cuéntanos brevemente.',
        type: 'textarea',
        required: false,
      },
    ],
    open: true,
    status: 'approved',
    createdAt: daysAgo(18),
    updatedAt: daysAgo(2),
  },
  {
    id: 'act_2',
    title: 'Grupo scout · postulación de nuevas patrullas',
    description:
      'Incorporación de estudiantes al grupo scout. Se realizan reuniones semanales y salidas una vez al mes.',
    kind: 'scout',
    imageKey: 'signup.brigada-ambiental',
    organizer: author('usr_est4'),
    closesAt: inDays(25),
    capacity: 24,
    location: 'Sala 12, viernes 16:00',
    requirements: 'Abierto a estudiantes de 8° básico a II medio.',
    questions: [
      {
        id: 'q_experiencia_scout',
        label: '¿Perteneciste antes a un grupo scout?',
        type: 'select',
        required: true,
        options: ['Sí', 'No'],
      },
    ],
    open: true,
    status: 'approved',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
  },
  {
    id: 'act_3',
    title: 'Torneo interno de ajedrez',
    description:
      'Torneo por sistema suizo a cinco rondas, abierto a todos los niveles. Se juega durante los recreos y after school.',
    kind: 'torneo',
    imageKey: 'signup.torneo-ajedrez',
    organizer: author('usr_admin'),
    closesAt: inDays(5),
    capacity: 32,
    location: 'Biblioteca, sala anexa',
    requirements: 'No se requiere experiencia previa.',
    questions: [
      {
        id: 'q_nivel',
        label: 'Nivel de juego',
        type: 'select',
        required: true,
        options: ['Principiante', 'Intermedio', 'Avanzado'],
      },
    ],
    open: true,
    status: 'approved',
    createdAt: daysAgo(9),
    updatedAt: daysAgo(9),
  },
  {
    id: 'act_4',
    title: 'Equipo de la revista estudiantil',
    description:
      'Convocatoria para redacción, fotografía, ilustración y diseño de la próxima edición de la revista.',
    kind: 'proyecto',
    imageKey: 'signup.revista-estudiantil',
    organizer: author('usr_est3'),
    closesAt: inDays(20),
    capacity: null,
    location: 'Reuniones en sala de computación',
    requirements: 'Compromiso con los plazos de cierre de edición.',
    questions: [
      {
        id: 'q_area',
        label: '¿En qué área te gustaría participar?',
        type: 'select',
        required: true,
        options: ['Redacción', 'Fotografía', 'Ilustración', 'Diseño y diagramación'],
      },
      {
        id: 'q_portafolio',
        label: 'Enlace a trabajos previos (opcional)',
        type: 'text',
        required: false,
      },
    ],
    open: true,
    status: 'approved',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
  },
];

export const seedRegistrations: Registration[] = [
  {
    id: 'reg_1',
    activityId: 'act_1',
    user: author('usr_est1'),
    answers: { q_disponibilidad: 'Segundo y cuarto sábado' },
    state: 'confirmed',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
  },
  {
    id: 'reg_2',
    activityId: 'act_3',
    user: author('usr_est4'),
    answers: { q_nivel: 'Intermedio' },
    state: 'confirmed',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
  {
    id: 'reg_3',
    activityId: 'act_1',
    user: author('usr_est2'),
    answers: { q_disponibilidad: 'Todos los sábados' },
    state: 'confirmed',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
];
