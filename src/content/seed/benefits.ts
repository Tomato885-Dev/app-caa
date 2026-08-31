import type { Benefit } from '@/core/types';

/* ============================================================================
   BENEFICIOS DE EJEMPLO
   ----------------------------------------------------------------------------
   Convenios ficticios, puestos solo para mostrar el formato. Reemplázalos por
   los acuerdos reales de la campaña desde Administración → Contenidos →
   Beneficios; no hace falta editar este archivo.

   `qrValue` es lo que el comercio lee al escanear. Puede ser un código, un
   identificador o una URL de validación.
   ========================================================================== */

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

export const seedBenefits: Benefit[] = [
  {
    id: 'ben_1',
    name: '2x1 en combos',
    partner: 'Comida rápida del centro comercial',
    summary: 'Dos combos por el precio de uno, de lunes a jueves.',
    description:
      'Convenio conseguido por la campaña para el local de comida rápida del centro comercial. Presentando el código QR en caja, el segundo combo de igual o menor valor sale sin costo.\nAplica de lunes a jueves durante todo el año escolar y es válido tanto en el mesón como en el autoservicio.',
    terms:
      'Un canje por persona y por día. No acumulable con otras promociones ni con descuentos de la aplicación del local. Se debe presentar credencial de estudiante junto al código.',
    category: 'Alimentación',
    logoImageKey: 'benefit.comida-rapida',
    qrValue: 'CAA2026-COMBO-2X1',
    code: 'CAA2026-COMBO-2X1',
    validUntil: inDays(180),
    active: true,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(4),
  },
  {
    id: 'ben_2',
    name: '30 % en entradas de cine',
    partner: 'Cine del barrio',
    summary: 'Descuento en la entrada general, todos los días.',
    description:
      'Descuento del 30 % sobre el valor de la entrada general en cualquier función, incluidos estrenos y fines de semana.\nEl código se muestra en la boletería antes de comprar; no se aplica a compras ya realizadas por internet.',
    terms:
      'Válido para una entrada por canje. No aplica a funciones especiales, maratones ni salas premium. Sujeto a disponibilidad de butacas.',
    category: 'Entretención',
    logoImageKey: 'benefit.cine',
    qrValue: 'CAA2026-CINE-30',
    code: 'CAA2026-CINE-30',
    validUntil: inDays(120),
    active: true,
    createdAt: daysAgo(26),
    updatedAt: daysAgo(26),
  },
  {
    id: 'ben_3',
    name: '20 % en útiles y cuadernos',
    partner: 'Librería del centro',
    summary: 'Descuento en toda la línea escolar.',
    description:
      'Descuento del 20 % en cuadernos, blocks, lápices y artículos de dibujo técnico. Pensado para el inicio de semestre y para las asignaturas con materiales propios.\nSe canjea en caja mostrando el código antes de pagar.',
    terms: 'No aplica a libros de texto, mochilas ni tecnología. Tope de $30.000 por compra.',
    category: 'Librería y útiles',
    logoImageKey: 'benefit.libreria',
    qrValue: 'CAA2026-UTILES-20',
    code: 'CAA2026-UTILES-20',
    validUntil: inDays(90),
    active: true,
    createdAt: daysAgo(21),
    updatedAt: daysAgo(21),
  },
  {
    id: 'ben_4',
    name: 'Primera clase liberada',
    partner: 'Gimnasio municipal',
    summary: 'Una clase de prueba sin costo en cualquier disciplina.',
    description:
      'Acceso liberado a una primera clase de prueba en cualquiera de las disciplinas del gimnasio: acondicionamiento, spinning, artes marciales o natación.\nAl escanear el código en recepción se registra el canje y se entrega el pase del día.',
    terms:
      'Un solo canje por estudiante. Requiere autorización del apoderado para menores de 16 años y presentar certificado de salud vigente para natación.',
    category: 'Deporte',
    logoImageKey: 'benefit.gimnasio',
    qrValue: 'CAA2026-GYM-TRIAL',
    code: 'CAA2026-GYM-TRIAL',
    validUntil: inDays(60),
    active: true,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
  },
  {
    id: 'ben_5',
    name: '15 % en fotocopias e impresiones',
    partner: 'Centro de copiado frente al colegio',
    summary: 'Descuento en impresión, anillado y empaste.',
    description:
      'Descuento del 15 % en fotocopias, impresión en blanco y negro o color, anillado y empaste de trabajos.\nEspecialmente útil para las entregas de fin de semestre y los proyectos de investigación.',
    terms: 'Aplica desde 20 copias. No acumulable con el precio por volumen del local.',
    category: 'Servicios',
    logoImageKey: 'benefit.copias',
    qrValue: 'CAA2026-COPIAS-15',
    code: 'CAA2026-COPIAS-15',
    active: true,
    createdAt: daysAgo(9),
    updatedAt: daysAgo(9),
  },
];
