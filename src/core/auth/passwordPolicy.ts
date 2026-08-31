/* ============================================================================
   REGLAS DE CONTRASEÑA
   ----------------------------------------------------------------------------
   Un solo lugar para endurecer o relajar los requisitos. La pantalla de
   registro muestra estas mismas reglas como lista de verificación, de modo que
   el estudiante ve qué le falta mientras escribe, en vez de recibir un error
   al final.
   ========================================================================== */

export const PASSWORD_MIN_LENGTH = 8;

export interface PasswordRule {
  id: string;
  /** Texto mostrado en la lista de requisitos. */
  label: string;
  test: (password: string, email: string) => boolean;
}

export const passwordRules: PasswordRule[] = [
  {
    id: 'length',
    label: `Al menos ${PASSWORD_MIN_LENGTH} caracteres`,
    test: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: 'letter',
    label: 'Al menos una letra',
    test: (password) => /\p{L}/u.test(password),
  },
  {
    id: 'number',
    label: 'Al menos un número',
    test: (password) => /\d/.test(password),
  },
  {
    id: 'notEmail',
    label: 'Distinta de tu correo y de tu nombre de usuario',
    test: (password, email) => {
      const local = email.split('@')[0]?.toLowerCase() ?? '';
      const value = password.toLowerCase();
      if (!value) return false;
      if (!local) return true;
      return value !== local && value !== email.toLowerCase() && !local.includes(value);
    },
  },
];

/** Claves demasiado evidentes: se rechazan aunque cumplan la longitud. */
const OBVIOUS = new Set([
  '12345678',
  '123456789',
  '1234567890',
  'password',
  'password1',
  'contrasena',
  'contraseña',
  'qwertyui',
  'qwerty123',
  'iloveyou',
  'estudiante',
  'colegio123',
  'verbo123',
  'abc12345',
]);

export interface PasswordCheck {
  /** Reglas cumplidas e incumplidas, en orden, para pintar la lista. */
  results: { rule: PasswordRule; ok: boolean }[];
  valid: boolean;
  /** Primer problema en lenguaje natural, o cadena vacía si está todo bien. */
  error: string;
}

export function checkPassword(password: string, email: string): PasswordCheck {
  const results = passwordRules.map((rule) => ({ rule, ok: rule.test(password, email) }));
  const failed = results.find((entry) => !entry.ok);

  if (failed) {
    return { results, valid: false, error: `La contraseña debe cumplir: ${failed.rule.label.toLowerCase()}.` };
  }
  if (OBVIOUS.has(password.toLowerCase())) {
    return {
      results,
      valid: false,
      error: 'Esa contraseña es demasiado común. Elige una que solo tú puedas adivinar.',
    };
  }
  return { results, valid: true, error: '' };
}

/**
 * Fuerza orientativa (0 a 3) para la barra de la pantalla de registro.
 * No bloquea nada: solo anima a usar una clave más larga y variada.
 */
export function passwordStrength(password: string): { score: 0 | 1 | 2 | 3; label: string } {
  if (password.length < PASSWORD_MIN_LENGTH) return { score: 0, label: 'Muy corta' };

  let score = 0;
  if (password.length >= 12) score += 1;
  if (/\p{Lu}/u.test(password) && /\p{Ll}/u.test(password)) score += 1;
  if (/[^\p{L}\d]/u.test(password)) score += 1;

  const labels = ['Aceptable', 'Buena', 'Fuerte', 'Muy fuerte'] as const;
  const capped = Math.min(score, 3) as 0 | 1 | 2 | 3;
  return { score: capped, label: labels[capped] };
}
