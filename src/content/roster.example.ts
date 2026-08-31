import type { RosterEntry } from './roster.types';

/* ============================================================================
   PLANTILLA DE LA NÓMINA OFICIAL
   ----------------------------------------------------------------------------
   La nómina real NO está en el repositorio: tiene nombres y correos de menores.
   Este archivo solo muestra el formato que espera la aplicación.

   CÓMO PONER LA NÓMINA REAL
   1. Copia este archivo como `roster.ts` en esta misma carpeta.
   2. Reemplaza las filas por los alumnos del establecimiento.
   3. Cada `grade` debe existir en `appConfig.grades`.

   `roster.ts` está en `.gitignore`, así que nunca se sube por accidente.
   Mientras no exista, la app arranca con la nómina de demostración.
   ========================================================================== */

export const roster: RosterEntry[] = [
  { name: 'Apellido Apellido Nombre', email: 'correo@verbo.cl', grade: '8° Básico A' },
];
