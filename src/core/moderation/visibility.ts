import { appConfig } from '@/config/app.config';
import { ROLE_ORDER, type Moderatable, type ModerationStatus, type Role, type User } from '@/core/types';

/* ============================================================================
   VISIBILIDAD SEGÚN ESTADO DE MODERACIÓN (§7.1)
   ----------------------------------------------------------------------------
   Regla única aplicada por todos los módulos:
   · La comunidad ve solo contenido aprobado.
   · Cada estudiante ve además sus propias publicaciones, con su estado.
   · Moderadores y administradores ven todo.
   ========================================================================== */

interface Authored extends Moderatable {
  author?: { id: string };
  organizer?: { id: string };
  seller?: { id: string };
  leads?: { id: string }[];
}

/** Id de quien creó el contenido, sea cual sea el nombre del campo. */
export function ownerIdOf(item: Authored): string | undefined {
  return item.author?.id ?? item.organizer?.id ?? item.seller?.id ?? item.leads?.[0]?.id;
}

export function canModerate(role: Role | null): boolean {
  return role ? ROLE_ORDER[role] >= ROLE_ORDER.moderator : false;
}

export function isVisibleTo<T extends Authored>(item: T, user: User | null): boolean {
  if (!user) return item.status === 'approved';
  if (canModerate(user.role)) return true;
  if (item.status === 'approved') return true;
  return ownerIdOf(item) === user.id;
}

/** Filtra una lista aplicando la regla de visibilidad. */
export function visibleTo<T extends Authored>(items: T[], user: User | null): T[] {
  return items.filter((item) => isVisibleTo(item, user));
}

/** Solo lo publicado: para portadas, destacados y contadores públicos. */
export function approvedOnly<T extends Moderatable>(items: T[]): T[] {
  return items.filter((item) => item.status === 'approved');
}

/**
 * Estado inicial de un contenido nuevo según quién lo crea (§7.1).
 * Administradores y moderadores publican directo; estudiantes pasan a revisión.
 */
export function initialStatusFor(user: User): ModerationStatus {
  if (!appConfig.moderation.requireApprovalForStudentContent) return 'approved';
  return canModerate(user.role) ? 'approved' : 'pending';
}

/** Mensaje que se muestra al estudiante tras enviar contenido. */
export function submissionMessage(status: ModerationStatus): string {
  return status === 'approved'
    ? 'Publicado correctamente.'
    : 'Enviado a revisión. Un moderador lo revisará antes de publicarse.';
}
