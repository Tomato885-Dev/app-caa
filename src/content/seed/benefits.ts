import type { Benefit } from '@/core/types';

/* ============================================================================
   COLABORADORES DE LA CAMPAÑA
   ----------------------------------------------------------------------------
   Quince espacios, uno por cada colaborador, listos para completar desde
   Administración → Contenidos → Colaboradores. Después hay que exportar el
   contenido para que quede guardado.

   QUÉ EDITAR EN CADA UNO
     · El nombre del colaborador y qué beneficio entrega.
     · La descripción y las condiciones de uso.
     · `redeem`: cómo se canjea, con la forma que definió el local (un
       código, un QR, una tienda en línea o unos pasos). Ver
       `modules/benefits/canje.ts`. Los cuatro primeros traen un ejemplo de
       cada forma; el resto queda sin definir, como un convenio recién cargado.

   Van sin logotipo. Para agregarlos se declaran en `content/images.ts` con
   claves que empiecen por `benefit.` y se eligen desde el mismo formulario.
   ========================================================================== */

const iso = (day: number) => new Date(2026, 0, day, 12).toISOString();

export const seedBenefits: Benefit[] = [
  {
    id: 'ben_01',
    partner: 'Colaborador 1',
    name: 'Beneficio por definir',
    summary: 'Pendiente de completar: resume el beneficio en una línea.',
    description:
      'Pendiente de completar.\nExplica quién es el colaborador y en qué consiste el beneficio que entrega a los estudiantes.',
    terms: 'Pendiente de completar: vigencia, tope de canjes y restricciones.',
    category: 'Otros',
    logoImageKey: 'benefit.colaborador-01',
    redeem: { method: 'codigo', code: 'VERBO15', steps: 'Pídelo antes de pagar.' },
    active: true,
    createdAt: iso(1),
    updatedAt: iso(1),
  },
  {
    id: 'ben_02',
    partner: 'Colaborador 2',
    name: 'Beneficio por definir',
    summary: 'Pendiente de completar: resume el beneficio en una línea.',
    description:
      'Pendiente de completar.\nExplica quién es el colaborador y en qué consiste el beneficio que entrega a los estudiantes.',
    terms: 'Pendiente de completar: vigencia, tope de canjes y restricciones.',
    category: 'Otros',
    logoImageKey: 'benefit.colaborador-02',
    redeem: { method: 'qr', qrValue: 'https://example.com/convenio-demo', steps: 'Muestra el QR en caja.' },
    active: true,
    createdAt: iso(2),
    updatedAt: iso(2),
  },
  {
    id: 'ben_03',
    partner: 'Colaborador 3',
    name: 'Beneficio por definir',
    summary: 'Pendiente de completar: resume el beneficio en una línea.',
    description:
      'Pendiente de completar.\nExplica quién es el colaborador y en qué consiste el beneficio que entrega a los estudiantes.',
    terms: 'Pendiente de completar: vigencia, tope de canjes y restricciones.',
    category: 'Otros',
    logoImageKey: 'benefit.colaborador-03',
    redeem: { method: 'enlace', url: 'https://example.com/tienda', code: 'VERBO10' },
    active: true,
    createdAt: iso(3),
    updatedAt: iso(3),
  },
  {
    id: 'ben_04',
    partner: 'Colaborador 4',
    name: 'Beneficio por definir',
    summary: 'Pendiente de completar: resume el beneficio en una línea.',
    description:
      'Pendiente de completar.\nExplica quién es el colaborador y en qué consiste el beneficio que entrega a los estudiantes.',
    terms: 'Pendiente de completar: vigencia, tope de canjes y restricciones.',
    category: 'Otros',
    logoImageKey: 'benefit.colaborador-04',
    redeem: {
      method: 'indicaciones',
      steps: 'Muestra tu credencial del colegio en caja.\nDi que vienes por el convenio del Centro de Alumnos.',
    },
    active: true,
    createdAt: iso(4),
    updatedAt: iso(4),
  },
  {
    id: 'ben_05',
    partner: 'Colaborador 5',
    name: 'Beneficio por definir',
    summary: 'Pendiente de completar: resume el beneficio en una línea.',
    description:
      'Pendiente de completar.\nExplica quién es el colaborador y en qué consiste el beneficio que entrega a los estudiantes.',
    terms: 'Pendiente de completar: vigencia, tope de canjes y restricciones.',
    category: 'Otros',
    logoImageKey: 'benefit.colaborador-05',
    active: true,
    createdAt: iso(5),
    updatedAt: iso(5),
  },
  {
    id: 'ben_06',
    partner: 'Colaborador 6',
    name: 'Beneficio por definir',
    summary: 'Pendiente de completar: resume el beneficio en una línea.',
    description:
      'Pendiente de completar.\nExplica quién es el colaborador y en qué consiste el beneficio que entrega a los estudiantes.',
    terms: 'Pendiente de completar: vigencia, tope de canjes y restricciones.',
    category: 'Otros',
    logoImageKey: 'benefit.colaborador-06',
    active: true,
    createdAt: iso(6),
    updatedAt: iso(6),
  },
  {
    id: 'ben_07',
    partner: 'Colaborador 7',
    name: 'Beneficio por definir',
    summary: 'Pendiente de completar: resume el beneficio en una línea.',
    description:
      'Pendiente de completar.\nExplica quién es el colaborador y en qué consiste el beneficio que entrega a los estudiantes.',
    terms: 'Pendiente de completar: vigencia, tope de canjes y restricciones.',
    category: 'Otros',
    logoImageKey: 'benefit.colaborador-07',
    active: true,
    createdAt: iso(7),
    updatedAt: iso(7),
  },
  {
    id: 'ben_08',
    partner: 'Colaborador 8',
    name: 'Beneficio por definir',
    summary: 'Pendiente de completar: resume el beneficio en una línea.',
    description:
      'Pendiente de completar.\nExplica quién es el colaborador y en qué consiste el beneficio que entrega a los estudiantes.',
    terms: 'Pendiente de completar: vigencia, tope de canjes y restricciones.',
    category: 'Otros',
    logoImageKey: 'benefit.colaborador-08',
    active: true,
    createdAt: iso(8),
    updatedAt: iso(8),
  },
  {
    id: 'ben_09',
    partner: 'Colaborador 9',
    name: 'Beneficio por definir',
    summary: 'Pendiente de completar: resume el beneficio en una línea.',
    description:
      'Pendiente de completar.\nExplica quién es el colaborador y en qué consiste el beneficio que entrega a los estudiantes.',
    terms: 'Pendiente de completar: vigencia, tope de canjes y restricciones.',
    category: 'Otros',
    logoImageKey: 'benefit.colaborador-09',
    active: true,
    createdAt: iso(9),
    updatedAt: iso(9),
  },
  {
    id: 'ben_10',
    partner: 'Colaborador 10',
    name: 'Beneficio por definir',
    summary: 'Pendiente de completar: resume el beneficio en una línea.',
    description:
      'Pendiente de completar.\nExplica quién es el colaborador y en qué consiste el beneficio que entrega a los estudiantes.',
    terms: 'Pendiente de completar: vigencia, tope de canjes y restricciones.',
    category: 'Otros',
    logoImageKey: 'benefit.colaborador-10',
    active: true,
    createdAt: iso(10),
    updatedAt: iso(10),
  },
  {
    id: 'ben_11',
    partner: 'Colaborador 11',
    name: 'Beneficio por definir',
    summary: 'Pendiente de completar: resume el beneficio en una línea.',
    description:
      'Pendiente de completar.\nExplica quién es el colaborador y en qué consiste el beneficio que entrega a los estudiantes.',
    terms: 'Pendiente de completar: vigencia, tope de canjes y restricciones.',
    category: 'Otros',
    logoImageKey: 'benefit.colaborador-11',
    active: true,
    createdAt: iso(11),
    updatedAt: iso(11),
  },
  {
    id: 'ben_12',
    partner: 'Colaborador 12',
    name: 'Beneficio por definir',
    summary: 'Pendiente de completar: resume el beneficio en una línea.',
    description:
      'Pendiente de completar.\nExplica quién es el colaborador y en qué consiste el beneficio que entrega a los estudiantes.',
    terms: 'Pendiente de completar: vigencia, tope de canjes y restricciones.',
    category: 'Otros',
    logoImageKey: 'benefit.colaborador-12',
    active: true,
    createdAt: iso(12),
    updatedAt: iso(12),
  },
  {
    id: 'ben_13',
    partner: 'Colaborador 13',
    name: 'Beneficio por definir',
    summary: 'Pendiente de completar: resume el beneficio en una línea.',
    description:
      'Pendiente de completar.\nExplica quién es el colaborador y en qué consiste el beneficio que entrega a los estudiantes.',
    terms: 'Pendiente de completar: vigencia, tope de canjes y restricciones.',
    category: 'Otros',
    logoImageKey: 'benefit.colaborador-13',
    active: true,
    createdAt: iso(13),
    updatedAt: iso(13),
  },
  {
    id: 'ben_14',
    partner: 'Colaborador 14',
    name: 'Beneficio por definir',
    summary: 'Pendiente de completar: resume el beneficio en una línea.',
    description:
      'Pendiente de completar.\nExplica quién es el colaborador y en qué consiste el beneficio que entrega a los estudiantes.',
    terms: 'Pendiente de completar: vigencia, tope de canjes y restricciones.',
    category: 'Otros',
    logoImageKey: 'benefit.colaborador-14',
    active: true,
    createdAt: iso(14),
    updatedAt: iso(14),
  },
  {
    id: 'ben_15',
    partner: 'Colaborador 15',
    name: 'Beneficio por definir',
    summary: 'Pendiente de completar: resume el beneficio en una línea.',
    description:
      'Pendiente de completar.\nExplica quién es el colaborador y en qué consiste el beneficio que entrega a los estudiantes.',
    terms: 'Pendiente de completar: vigencia, tope de canjes y restricciones.',
    category: 'Otros',
    logoImageKey: 'benefit.colaborador-15',
    active: true,
    createdAt: iso(15),
    updatedAt: iso(15),
  },
];
