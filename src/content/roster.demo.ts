import type { RosterEntry } from './roster.types';

/* ============================================================================
   NÓMINA DE DEMOSTRACIÓN
   ----------------------------------------------------------------------------
   Estudiantes INVENTADOS. Ninguno existe.

   PARA QUÉ SIRVE
   Para publicar la aplicación sin exponer datos de alumnos reales: en una
   demostración pública (mostrarla a la directiva, dejarla en internet un par
   de días) no hay ninguna razón para que viajen 400 nombres y correos de
   menores dentro de la página.

   CÓMO SE ACTIVA
   Con la variable de entorno `VITE_DEMO_ROSTER=true` al compilar. Cuando está
   activa, `content/seed/users.ts` usa esta lista y la nómina real NI SIQUIERA
   SE INCLUYE en el archivo final: el compilador la descarta entera.

   Sin esa variable, la app usa la nómina oficial de `content/roster.ts`.
   ========================================================================== */

export const demoRoster: RosterEntry[] = [
  /* --- 8° Básico A --- */
  { name: 'Aguirre Soto Emilia', email: 'demo.aguirre@verbo.cl', grade: '8° Básico A' },
  { name: 'Bravo Núñez Tomás', email: 'demo.bravo@verbo.cl', grade: '8° Básico A' },
  { name: 'Castro Vidal Josefa', email: 'demo.castro@verbo.cl', grade: '8° Básico A' },

  /* --- I Medio B --- */
  { name: 'Díaz Herrera Vicente', email: 'demo.diaz@verbo.cl', grade: 'I Medio B' },
  { name: 'Espinoza Lagos Florencia', email: 'demo.espinoza@verbo.cl', grade: 'I Medio B' },
  { name: 'Fuentes Rojas Agustín', email: 'demo.fuentes@verbo.cl', grade: 'I Medio B' },

  /* --- II Medio C --- */
  { name: 'Gallardo Pinto Isidora', email: 'demo.gallardo@verbo.cl', grade: 'II Medio C' },
  { name: 'Herrera Muñoz Benjamín', email: 'demo.herrera@verbo.cl', grade: 'II Medio C' },
  { name: 'Ibáñez Cortés Antonia', email: 'demo.ibanez@verbo.cl', grade: 'II Medio C' },

  /* --- III Medio A --- */
  { name: 'Jara Sepúlveda Martín', email: 'demo.jara@verbo.cl', grade: 'III Medio A' },
  { name: 'León Vargas Catalina', email: 'demo.leon@verbo.cl', grade: 'III Medio A' },

  /* --- IV Medio A --- */
  { name: 'Morales Silva Diego', email: 'demo.morales@verbo.cl', grade: 'IV Medio A' },
  { name: 'Navarro Reyes Trinidad', email: 'demo.navarro@verbo.cl', grade: 'IV Medio A' },
];
