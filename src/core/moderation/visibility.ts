import { ROLE_ORDER, type Moderatable, type Role } from '@/core/types';

/* ============================================================================
   QUÉ SE VE Y QUIÉN MANDA
   ----------------------------------------------------------------------------
   De lo que fue un sistema de moderación completo quedan dos preguntas, que
   son las únicas que la aplicación sigue haciendo.

   POR QUÉ SE ENCOGIÓ
   La revisión previa existía porque los estudiantes publicaban: el Marketplace
   y los grupos de Comunidad pasaban por una cola antes de aparecer. El colegio
   decidió quitar los dos, y publicar quedó reservado al equipo del Centro de
   Alumnos, así que no hay nada que revisar. La cola y los reportes se
   eliminaron; el resto se borró junto con ellos.

   EL ESTADO `status` SIGUE EXISTIENDO
   Cada noticia y cada evento guardan si están publicados. Hoy nacen siempre
   como `approved` porque solo los crea el equipo, pero el campo se conserva:
   permite despublicar algo sin borrarlo, y es lo que haría falta el día que se
   quiera devolverle la palabra a los estudiantes.
   ========================================================================== */

/** ¿Esta persona puede publicar y administrar? */
export function canModerate(role: Role | null): boolean {
  return role ? ROLE_ORDER[role] >= ROLE_ORDER.moderator : false;
}

/** Solo lo publicado: es lo que ve la comunidad en listados y portadas. */
export function approvedOnly<T extends Moderatable>(items: T[]): T[] {
  return items.filter((item) => item.status === 'approved');
}
