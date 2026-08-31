import type { Project } from '@/core/types';

/* ============================================================================
   PROYECTOS DEL COLEGIO · CONTENIDO DE EJEMPLO
   ----------------------------------------------------------------------------
   ⚠️ TODOS estos proyectos son inventados y están para mostrar el formato.
   Reemplázalos por los proyectos reales del establecimiento desde
   Administración → Contenidos → Proyectos, y luego exporta.

   El apartado está pensado para los cursos más pequeños: por eso cada proyecto
   se cuenta en lenguaje simple y siempre dice cómo participar.
   ========================================================================== */

const iso = (year: number, month: number, day: number) =>
  new Date(year, month - 1, day, 12).toISOString();

export const seedProjects: Project[] = [
  {
    id: 'prj_1',
    title: 'Huerto escolar',
    summary: 'Un huerto de verdad en el patio, cuidado por los cursos de básica.',
    description:
      'El huerto partió en un rincón del patio con cuatro cajones de madera y hoy ocupa todo el sector norte. Ahí se siembran lechugas, tomates, zanahorias y hierbas.\nCada curso de básica tiene su propio cajón y se turna para regar durante la semana. Lo que se cosecha se reparte entre los cursos que trabajaron y una parte va al casino.\nEs uno de los proyectos más antiguos del colegio que sigue funcionando.',
    area: 'Medioambiente',
    status: 'activo',
    startYear: 2018,
    endYear: null,
    imageKey: 'projects.huerto',
    ledBy: 'Academia de Ciencias y cursos de básica',
    howToJoin:
      'Habla con tu profesor jefe para que tu curso pida su cajón. También puedes sumarte a los turnos de riego en los recreos largos.',
    createdAt: iso(2018, 3, 12),
    updatedAt: iso(2026, 3, 2),
  },
  {
    id: 'prj_2',
    title: 'Reciclaje por curso',
    summary: 'Cada sala tiene su punto de reciclaje y se compite por curso.',
    description:
      'En cada sala hay tres contenedores: papel, plástico y latas. Una vez al mes se pesa lo que juntó cada curso y se publica la tabla.\nEl curso que más recicla en el año se gana una salida a terreno.\nLa idea nació de una asamblea de delegados y hoy participa el colegio completo.',
    area: 'Medioambiente',
    status: 'activo',
    startYear: 2021,
    endYear: null,
    imageKey: 'projects.reciclaje',
    ledBy: 'Brigada ambiental',
    howToJoin: 'Ya estás dentro: tu sala tiene los contenedores. Pregunta quién es el encargado de tu curso.',
    createdAt: iso(2021, 4, 5),
    updatedAt: iso(2026, 4, 18),
  },
  {
    id: 'prj_3',
    title: 'Radio del recreo',
    summary: 'Música y avisos por los parlantes del patio en el segundo recreo.',
    description:
      'Un grupo de alumnos arma la programación de cada semana: música pedida por los cursos, saludos de cumpleaños y los avisos del Centro de Alumnos.\nSe transmite desde la sala de computación con un micrófono y la consola del colegio.\nCualquier curso puede pedir una canción dejando el nombre en el buzón de la radio.',
    area: 'Cultura y arte',
    status: 'activo',
    startYear: 2023,
    endYear: null,
    imageKey: 'projects.radio',
    ledBy: 'Taller de comunicaciones',
    howToJoin: 'Anda a la sala de computación en el primer recreo del lunes y pregunta por el equipo de la radio.',
    createdAt: iso(2023, 5, 20),
    updatedAt: iso(2026, 5, 9),
  },
  {
    id: 'prj_4',
    title: 'Padrinos de lectura',
    summary: 'Alumnos grandes que leen cuentos a los más chicos una vez por semana.',
    description:
      'Los cursos de enseñanza media se emparejan con un curso de básica. Una vez a la semana, en la última hora del viernes, los grandes leen cuentos a los chicos en la biblioteca.\nCada pareja se mantiene todo el año, así que se conocen de verdad.\nEs el proyecto que más ha crecido: partió con un curso y hoy participan doce.',
    area: 'Convivencia',
    status: 'activo',
    startYear: 2019,
    endYear: null,
    imageKey: 'projects.padrinos-lectura',
    ledBy: 'Biblioteca y Centro de Alumnos',
    howToJoin: 'Si eres de básica, tu curso ya tiene padrinos asignados. Si eres de media, avisa en la biblioteca.',
    createdAt: iso(2019, 8, 2),
    updatedAt: iso(2026, 4, 25),
  },
  {
    id: 'prj_5',
    title: 'Mural del centenario',
    summary: 'El mural pintado entre todos los cursos para el aniversario del colegio.',
    description:
      'Durante dos meses, cada curso pintó una parte del muro que da al patio de básica. El diseño salió de un concurso interno que ganó una alumna de II Medio.\nSe usaron más de sesenta tarros de pintura y participaron cerca de cuatrocientos alumnos.\nEl mural sigue ahí y ya es parte del colegio, aunque el proyecto terminó cuando se pintó el último tramo.',
    area: 'Cultura y arte',
    status: 'historico',
    startYear: 2022,
    endYear: 2022,
    imageKey: 'projects.mural',
    ledBy: 'Departamento de Artes',
    createdAt: iso(2022, 9, 1),
    updatedAt: iso(2022, 11, 30),
  },
  {
    id: 'prj_6',
    title: 'Campaña del kilo',
    summary: 'La colecta de alimentos que se hizo cada invierno durante seis años.',
    description:
      'Cada julio, los cursos competían por juntar la mayor cantidad de alimentos no perecibles. Lo recolectado se entregaba a una fundación del sector.\nEn su mejor año se reunieron más de dos toneladas.\nLa campaña se cerró en 2023, cuando el colegio pasó a apoyar de forma permanente a un comedor del barrio en vez de hacer una colecta anual.',
    area: 'Acción social',
    status: 'historico',
    startYear: 2017,
    endYear: 2023,
    imageKey: 'projects.campana-kilo',
    ledBy: 'Pastoral y Centro de Alumnos',
    createdAt: iso(2017, 7, 3),
    updatedAt: iso(2023, 7, 28),
  },
];
