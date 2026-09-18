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

/**
 * Enlace para escribirle por WhatsApp.
 *
 * WhatsApp necesita el número completo con el código del país y sin signos,
 * pero la gente lo escribe como quiere: "+56 9 1234 5678", "9 1234 5678" o
 * "12345678". Acá se completa lo que falte, asumiendo Chile.
 *
 * Devuelve `null` cuando no es un celular —por ejemplo un teléfono de casa
 * o un número a medio escribir—, y en ese caso el botón no se muestra: es
 * mejor que no aparezca a que abra una conversación con un número que no
 * existe.
 */
export function whatsappHref(phone: string): string | null {
  const escrito = phone.trim();
  const digitos = escrito.replace(/\D/g, '');

  /* Número de otro país, escrito con el + adelante: se respeta tal cual. */
  if (escrito.startsWith('+') && !digitos.startsWith('56')) {
    return digitos.length >= 8 ? `https://wa.me/${digitos}` : null;
  }

  /* Chile: 56 + 9 + ocho dígitos. Se acepta con o sin cada parte. */
  let numero = digitos;
  if (numero.startsWith('56')) numero = numero.slice(2);
  if (numero.length === 8) numero = `9${numero}`;
  if (numero.length !== 9 || !numero.startsWith('9')) return null;

  return `https://wa.me/56${numero}`;
}
