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
     · `qrValue`: lo que el comercio lee al escanear. Puede ser un código, un
       identificador o una dirección de validación. Debe ser distinto en cada
       colaborador.

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
    qrValue: 'CAA2026-COLAB-01',
    code: 'CAA2026-COLAB-01',
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
    qrValue: 'CAA2026-COLAB-02',
    code: 'CAA2026-COLAB-02',
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
    qrValue: 'CAA2026-COLAB-03',
    code: 'CAA2026-COLAB-03',
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
    qrValue: 'CAA2026-COLAB-04',
    code: 'CAA2026-COLAB-04',
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
    qrValue: 'CAA2026-COLAB-05',
    code: 'CAA2026-COLAB-05',
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
    qrValue: 'CAA2026-COLAB-06',
    code: 'CAA2026-COLAB-06',
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
    qrValue: 'CAA2026-COLAB-07',
    code: 'CAA2026-COLAB-07',
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
    qrValue: 'CAA2026-COLAB-08',
    code: 'CAA2026-COLAB-08',
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
    qrValue: 'CAA2026-COLAB-09',
    code: 'CAA2026-COLAB-09',
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
    qrValue: 'CAA2026-COLAB-10',
    code: 'CAA2026-COLAB-10',
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
    qrValue: 'CAA2026-COLAB-11',
    code: 'CAA2026-COLAB-11',
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
    qrValue: 'CAA2026-COLAB-12',
    code: 'CAA2026-COLAB-12',
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
    qrValue: 'CAA2026-COLAB-13',
    code: 'CAA2026-COLAB-13',
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
    qrValue: 'CAA2026-COLAB-14',
    code: 'CAA2026-COLAB-14',
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
    qrValue: 'CAA2026-COLAB-15',
    code: 'CAA2026-COLAB-15',
    active: true,
    createdAt: iso(15),
    updatedAt: iso(15),
  },
];
