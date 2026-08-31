import type { MarketplaceListing, Report } from '@/core/types';
import { author } from './users';

/* Marketplace estudiantil (§6.7). La plataforma solo difunde: el contacto y
   cualquier acuerdo ocurren fuera de la aplicación. */

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

export const seedMarketplaceListings: MarketplaceListing[] = [
  {
    id: 'lst_1',
    title: 'Stickers ilustrados a pedido',
    description:
      'Diseño e impresión de stickers personalizados: mascotas, frases, logos de curso o alianza. Entrega en el colegio en tres días hábiles.',
    category: 'Diseño e ilustración',
    type: 'producto',
    priceLabel: 'Desde $1.500 por plancha',
    imageKeys: ['market.stickers'],
    seller: author('usr_est3'),
    contact: { label: 'Escribir por correo', url: 'mailto:antonia.salas@verbo.cl' },
    available: true,
    status: 'approved',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: 'lst_2',
    title: 'Tortas y postres por encargo',
    description:
      'Preparación de tortas, brownies y postres individuales para cumpleaños y actividades de curso. Se reciben pedidos con una semana de anticipación.',
    category: 'Alimentos',
    type: 'producto',
    priceLabel: 'A convenir según tamaño',
    imageKeys: ['market.pasteleria'],
    seller: author('usr_est5'),
    contact: { label: 'Escribir por correo', url: 'mailto:josefa.miranda@verbo.cl' },
    available: true,
    status: 'approved',
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
  },
  {
    id: 'lst_3',
    title: 'Clases particulares de matemática',
    description:
      'Reforzamiento de matemática para 8° básico a II medio. Sesiones de 60 minutos, presenciales en biblioteca o por videollamada.',
    category: 'Clases y tutorías',
    type: 'servicio',
    priceLabel: '$5.000 por sesión',
    imageKeys: ['market.clases-matematica'],
    seller: author('usr_est1'),
    contact: { label: 'Escribir por correo', url: 'mailto:camila.rojas@verbo.cl' },
    available: true,
    status: 'approved',
    createdAt: daysAgo(11),
    updatedAt: daysAgo(11),
  },
  {
    id: 'lst_4',
    title: 'Fotografía de eventos y actividades',
    description:
      'Cobertura fotográfica de partidos, presentaciones y actividades de curso. Entrega de galería editada en 48 horas.',
    category: 'Fotografía y video',
    type: 'servicio',
    priceLabel: 'A convenir',
    imageKeys: ['market.fotografia'],
    seller: author('usr_est2'),
    contact: { label: 'Escribir por correo', url: 'mailto:matias.fuentes@verbo.cl' },
    available: true,
    status: 'approved',
    createdAt: daysAgo(14),
    updatedAt: daysAgo(14),
  },
  {
    id: 'lst_5',
    title: 'Pulseras artesanales tejidas',
    description:
      'Pulseras hechas a mano con los colores que elijas. Ideales para alianzas y regalos de curso.',
    category: 'Artesanía',
    type: 'producto',
    priceLabel: '$2.000 cada una',
    imageKeys: ['market.pulseras'],
    seller: author('usr_est4'),
    contact: { label: 'Escribir por correo', url: 'mailto:benjamin.cortes@verbo.cl' },
    available: true,
    status: 'approved',
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
  },
  {
    id: 'lst_6',
    title: 'Diseño de afiches para actividades',
    description:
      'Diseño de afiches y publicaciones para redes de cursos, academias y proyectos estudiantiles. Incluye dos rondas de correcciones.',
    category: 'Diseño e ilustración',
    type: 'servicio',
    priceLabel: 'Desde $4.000',
    imageKeys: ['market.diseno-afiches'],
    seller: author('usr_est3'),
    contact: { label: 'Escribir por correo', url: 'mailto:antonia.salas@verbo.cl' },
    available: true,
    // En revisión: alimenta la cola de moderación desde el primer arranque.
    status: 'pending',
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(6),
  },
];

/* Un reporte abierto de ejemplo (§8.2), para que el panel no arranque vacío. */
export const seedReports: Report[] = [
  {
    id: 'rpt_1',
    contentKind: 'marketplaceListing',
    contentId: 'lst_5',
    contentTitle: 'Pulseras artesanales tejidas',
    reason: 'No corresponde a la categoría',
    detail: 'Creo que esta publicación encaja mejor en otra categoría del marketplace.',
    reporter: author('usr_est5'),
    state: 'open',
    createdAt: hoursAgo(9),
    updatedAt: hoursAgo(9),
  },
];
