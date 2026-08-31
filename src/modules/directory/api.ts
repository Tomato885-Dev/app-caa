import { db } from '@/core/data';
import { useCollection } from '@/core/hooks/useData';
import type { User } from '@/core/types';

export function useDirectory() {
  return useCollection('users', db.users);
}

/**
 * Quiénes figuran en la base de contactos.
 *
 * Se excluyen las cuentas desactivadas y las de quienes eligieron no aparecer
 * (`hideFromDirectory`, ajustable desde el propio perfil). El buscador nunca
 * muestra a alguien que pidió quedar fuera.
 */
export function listedInDirectory(users: User[]): User[] {
  return users
    .filter((user) => user.active && !user.hideFromDirectory)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Enlace de teléfono, sin espacios ni separadores. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
