import type { CommunityGroup } from '@/core/types';
import { author } from './users';

/* Organizaciones y actividades permanentes (§6.6): objetivos, responsables,
   formas de participación y enlaces de contacto. */

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

export const seedCommunityGroups: CommunityGroup[] = [
  {
    id: 'grp_scouts',
    name: 'Grupo Scout',
    shortDescription: 'Formación en la vida al aire libre, servicio y trabajo en patrullas.',
    about: `El grupo scout reúne a estudiantes de distintos niveles en torno al método scout: patrullas, progresión personal y servicio a la comunidad.

Las reuniones son semanales e incluyen juegos, técnica scout y planificación de salidas. Una vez al mes se realiza una actividad fuera del colegio.`,
    goals: [
      'Formar equipos de trabajo autónomos entre estudiantes de distintos niveles.',
      'Desarrollar habilidades de vida al aire libre y primeros auxilios.',
      'Realizar al menos un proyecto de servicio a la comunidad por semestre.',
    ],
    howToJoin:
      'Asiste a cualquier reunión de los viernes a las 16:00 en la sala 12, o postula desde la sección Inscripciones cuando se abra una nueva convocatoria.',
    category: 'Organizaciones',
    coverImageKey: 'community.scouts.cover',
    logoImageKey: 'community.scouts.logo',
    leads: [author('usr_est4')],
    links: [{ label: 'Correo del grupo', url: 'mailto:scouts@verbo.cl' }],
    meetingInfo: 'Viernes 16:00 · Sala 12',
    status: 'approved',
    createdAt: daysAgo(200),
    updatedAt: daysAgo(10),
  },
  {
    id: 'grp_accion_social',
    name: 'Área de Acción Social',
    shortDescription: 'Voluntariados, campañas solidarias y apoyo escolar en la comuna.',
    about: `El área de acción social coordina las iniciativas solidarias de la enseñanza media: campañas de recolección, visitas a instituciones y apoyo escolar.

El trabajo se organiza en equipos por tipo de actividad, de modo que cada estudiante pueda participar según su disponibilidad.`,
    goals: [
      'Sostener al menos dos campañas solidarias por año con participación de todos los niveles.',
      'Mantener un equipo estable de apoyo escolar para estudiantes de básica.',
      'Vincular a la comunidad escolar con organizaciones de la comuna.',
    ],
    howToJoin:
      'Inscríbete en el voluntariado permanente desde la sección Inscripciones, o escribe al correo del área para sumarte a una campaña puntual.',
    category: 'Solidario',
    coverImageKey: 'community.accion-social.cover',
    logoImageKey: 'community.accion-social.logo',
    leads: [author('usr_est1'), author('usr_admin')],
    links: [{ label: 'Correo del área', url: 'mailto:accionsocial@verbo.cl' }],
    meetingInfo: 'Miércoles 13:30 · Sala de pastoral',
    status: 'approved',
    createdAt: daysAgo(190),
    updatedAt: daysAgo(6),
  },
  {
    id: 'grp_barra',
    name: 'Barra Oficial',
    shortDescription: 'Organización de la hinchada en torneos, aniversario y encuentros deportivos.',
    about: `La barra oficial coordina el apoyo a las selecciones en partidos y torneos, además de preparar las presentaciones de la semana de aniversario.

Se organiza en comisiones: percusión, lienzos y coreografía. No se requiere experiencia previa para participar en ninguna de ellas.`,
    goals: [
      'Acompañar a todas las selecciones en sus encuentros locales.',
      'Preparar la presentación de aniversario con participación de los cuatro niveles.',
      'Mantener un ambiente de apoyo respetuoso hacia rivales y árbitros.',
    ],
    howToJoin:
      'Súmate a cualquier ensayo de los martes en el gimnasio o escribe al correo de la barra indicando en qué comisión te interesa participar.',
    category: 'Deportivo',
    coverImageKey: 'community.barra.cover',
    logoImageKey: 'community.barra.logo',
    leads: [author('usr_est2')],
    links: [{ label: 'Correo de la barra', url: 'mailto:barra@verbo.cl' }],
    meetingInfo: 'Martes 16:30 · Gimnasio',
    status: 'approved',
    createdAt: daysAgo(150),
    updatedAt: daysAgo(20),
  },
  {
    id: 'grp_debate',
    name: 'Academia de Debate',
    shortDescription: 'Entrenamiento en argumentación y participación en torneos interescolares.',
    about: `La academia de debate entrena semanalmente en formato parlamentario británico y participa en torneos interescolares durante el año.

Las sesiones incluyen preparación de casos, práctica de oratoria y debates internos.`,
    goals: [
      'Formar a estudiantes en argumentación y expresión oral.',
      'Representar a la comunidad escolar en al menos tres torneos anuales.',
      'Organizar un torneo interno abierto a todos los niveles.',
    ],
    howToJoin:
      'Las puertas están abiertas todo el año: asiste a una sesión de prueba los jueves a las 16:00 en la sala 8.',
    category: 'Académico',
    coverImageKey: 'community.academia.cover',
    logoImageKey: 'community.academia.logo',
    leads: [author('usr_est1')],
    links: [{ label: 'Correo de la academia', url: 'mailto:debate@verbo.cl' }],
    meetingInfo: 'Jueves 16:00 · Sala 8',
    status: 'approved',
    createdAt: daysAgo(140),
    updatedAt: daysAgo(25),
  },
  {
    id: 'grp_pastoral',
    name: 'Grupo de Pastoral Estudiantil',
    shortDescription: 'Encuentros, jornadas de reflexión y acompañamiento entre pares.',
    about: `El grupo de pastoral organiza jornadas de reflexión, encuentros por nivel y actividades de acompañamiento entre estudiantes.

Es un espacio abierto, sin requisitos de participación, coordinado junto al equipo de pastoral del colegio.`,
    goals: [
      'Ofrecer instancias de encuentro y reflexión para cada nivel.',
      'Formar un equipo de acompañamiento entre pares.',
      'Colaborar con el área de acción social en actividades conjuntas.',
    ],
    howToJoin: 'Participa en la próxima jornada o escribe al correo del grupo para más información.',
    category: 'Organizaciones',
    coverImageKey: 'community.pastoral.cover',
    logoImageKey: 'community.pastoral.logo',
    leads: [author('usr_est3')],
    links: [{ label: 'Correo del grupo', url: 'mailto:pastoral@verbo.cl' }],
    meetingInfo: 'Lunes 13:30 · Capilla',
    status: 'approved',
    createdAt: daysAgo(120),
    updatedAt: daysAgo(30),
  },
];
