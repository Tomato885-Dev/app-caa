/** Una fila de la nómina oficial del colegio. */
export interface RosterEntry {
  /** Nombre tal como aparece en las listas del establecimiento. */
  name: string;
  /** Correo institucional. En minúsculas y único en toda la nómina. */
  email: string;
  /** Curso al que pertenece. Debe existir en `appConfig.grades`. */
  grade: string;
}
