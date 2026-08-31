import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { appConfig } from '@/config/app.config';
import { db } from '@/core/data';
import { ROLE_ORDER, type ID, type Role, type User } from '@/core/types';
import { hasPassword, setPassword, verifyPassword } from './credentials';
import { MailError, mailerIsConfigured, sendVerificationCode } from './mailer';
import { checkPassword } from './passwordPolicy';
import {
  CODE_TTL_MINUTES,
  checkCode,
  createChallenge,
  isVerified,
  secondsUntilResend,
} from './verification';

/* ============================================================================
   AUTENTICACIÓN Y SESIÓN
   ----------------------------------------------------------------------------
   §5 y §7 del documento: el acceso es exclusivo para cuentas institucionales
   previamente autorizadas, y cada cuenta queda ligada al nombre real y curso
   del estudiante.

   EL ACCESO TIENE CUATRO CANDADOS
     1. El correo pertenece a un dominio institucional autorizado.
     2. El correo figura en la nómina oficial (`src/content/roster.ts`), que es
        de donde se generan las cuentas.
     3. La cuenta fue activada con una contraseña y esta coincide.
     4. El correo fue comprobado con un código de 6 dígitos (`verification.ts`).

   REGISTRO
   `register()` no crea cuentas nuevas: solo le pone contraseña a una cuenta
   que ya existe en la nómina. Nadie puede darse de alta por su cuenta, que es
   justamente lo que pidió el Centro de Alumnos.

   LA VERIFICACIÓN PENDIENTE VIVE EN MEMORIA
   Entre "escribí mi contraseña" y "escribí el código" la cuenta queda en
   `pending`, que NO se guarda en ningún lado. Si se recarga la página hay que
   volver a escribir la contraseña: así el código por sí solo nunca alcanza
   para entrar.
   ========================================================================== */

const SESSION_KEY = 'appcaa:v1:session';

export class AuthError extends Error {}

/** Datos de la cuenta que se muestran al confirmar el registro. */
export interface AccountPreview {
  id: ID;
  name: string;
  grade: string;
  email: string;
}

/**
 * Cuenta que ya demostró su contraseña y solo espera el código del correo.
 * Vive en memoria, nunca en el almacenamiento.
 */
export interface PendingVerification extends AccountPreview {
  /** `true` si el correo salió de verdad; `false` en modo desarrollo. */
  sent: boolean;
  /** Código a la vista SOLO en modo desarrollo (sin servicio de correo). */
  devCode?: string;
  /** Minutos de validez del código, para mostrarlos en pantalla. */
  expiresInMinutes: number;
}

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  loading: boolean;
  /** Cuenta a la espera del código. Si no es null, la UI pide el código. */
  pending: PendingVerification | null;
  /** Inicia sesión con correo institucional y contraseña. */
  signIn: (email: string, password: string) => Promise<User | null>;
  /** Primer paso del registro: confirma que el correo está habilitado. */
  lookupAccount: (email: string) => Promise<AccountPreview>;
  /** Segundo paso del registro: crea la contraseña y pide el código. */
  register: (email: string, password: string) => Promise<User | null>;
  /** Tercer paso: comprueba el código y deja la sesión iniciada. */
  confirmVerification: (code: string) => Promise<User>;
  /** Envía un código nuevo, respetando el tiempo de espera. */
  resendVerification: () => Promise<PendingVerification>;
  /** Abandona la verificación en curso y vuelve al formulario. */
  cancelVerification: () => void;
  /** Acceso directo de demostración, sin contraseña. Se apaga en appConfig. */
  signInAsDemo: (userId: ID) => Promise<User>;
  signOut: () => void;
  /** Actualiza el perfil de la sesión activa (§6.8). */
  updateProfile: (
    patch: Partial<
      Pick<User, 'name' | 'grade' | 'bio' | 'avatarKey' | 'phone' | 'hideFromDirectory'>
    >,
  ) => Promise<void>;
  /** Cambia la contraseña de la sesión activa, verificando la anterior. */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  /** ¿La sesión alcanza al menos este rol? */
  hasRole: (minimum: Role) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Comprueba que el correo pertenezca a un dominio institucional autorizado. */
export function isInstitutionalEmail(email: string): boolean {
  const value = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
  const domain = value.split('@')[1];
  // Coincidencia exacta: @sub.verbo.cl no entra a menos que se declare aparte.
  return appConfig.auth.allowedEmailDomains.some((allowed) => domain === allowed.toLowerCase());
}

const domainsText = () =>
  appConfig.auth.allowedEmailDomains.map((domain) => `@${domain}`).join(' o ');

/**
 * Localiza la cuenta habilitada para un correo. Aplica los candados 1 y 2.
 * Es la puerta común de `signIn`, `lookupAccount` y `register`.
 */
async function findEnabledAccount(email: string): Promise<User> {
  const value = normalizeEmail(email);

  if (!isInstitutionalEmail(value)) {
    throw new AuthError(`Debes usar tu correo institucional (${domainsText()}).`);
  }

  const users = await db.users.list();
  const found = users.find((candidate) => candidate.email.toLowerCase() === value);

  // El correo es institucional pero no está en la nómina: no hay cuenta.
  if (!found) {
    throw new AuthError(
      'Ese correo no figura en la nómina habilitada. Si crees que es un error, avísale al Centro de Alumnos.',
    );
  }
  if (!found.active) {
    throw new AuthError('Esta cuenta está desactivada. Contacta a la administración.');
  }
  return found;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingVerification | null>(null);

  // Restaura la sesión guardada y refresca el perfil desde la fuente de datos.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const storedId = localStorage.getItem(SESSION_KEY);
      if (storedId) {
        const found = await db.users.get(storedId);
        if (!cancelled && found?.active) setUser(found);
        else if (!cancelled) localStorage.removeItem(SESSION_KEY);
      }
      if (!cancelled) setLoading(false);
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const startSession = useCallback((account: User) => {
    localStorage.setItem(SESSION_KEY, account.id);
    setPending(null);
    setUser(account);
    return account;
  }, []);

  /**
   * Genera un código, se lo pasa al servicio de correo y deja la cuenta a la
   * espera. Es el paso común del registro y del inicio de sesión sin verificar.
   */
  const requestVerification = useCallback(async (account: User) => {
    const code = await createChallenge(account.id, account.email);

    let sent = false;
    try {
      sent = await sendVerificationCode({
        to: account.email,
        name: account.name,
        code,
        expiresInMinutes: CODE_TTL_MINUTES,
      });
    } catch (caught) {
      // El fallo del correo se cuenta como error de acceso: la UI ya sabe
      // mostrar `AuthError` y el estudiante no necesita distinguirlos.
      throw caught instanceof MailError ? new AuthError(caught.message) : caught;
    }

    const next: PendingVerification = {
      id: account.id,
      name: account.name,
      grade: account.grade,
      email: account.email,
      sent,
      // Sin servicio de correo el código se muestra: si no, no habría cómo entrar.
      devCode: mailerIsConfigured() ? undefined : code,
      expiresInMinutes: CODE_TTL_MINUTES,
    };

    setPending(next);
    return next;
  }, []);

  const signIn = useCallback<AuthContextValue['signIn']>(
    async (email, password) => {
      const account = await findEnabledAccount(email);

      // La cuenta existe pero nadie la ha activado todavía.
      if (!hasPassword(account.id)) {
        throw new AuthError(
          'Esta cuenta aún no tiene contraseña. Créala en "Activar mi cuenta".',
        );
      }
      if (!password) {
        throw new AuthError('Escribe tu contraseña.');
      }
      // Mismo mensaje para correo y clave equivocados: no confirma cuál falló.
      if (!(await verifyPassword(account.id, password))) {
        throw new AuthError('Correo o contraseña incorrectos.');
      }

      // Contraseña correcta pero correo sin comprobar: se retoma el código.
      if (appConfig.auth.requireEmailVerification && !isVerified(account.id)) {
        await requestVerification(account);
        return null;
      }

      return startSession(account);
    },
    [startSession, requestVerification],
  );

  const lookupAccount = useCallback<AuthContextValue['lookupAccount']>(async (email) => {
    const account = await findEnabledAccount(email);

    if (hasPassword(account.id)) {
      throw new AuthError('Esta cuenta ya está activada. Inicia sesión con tu contraseña.');
    }
    return { id: account.id, name: account.name, grade: account.grade, email: account.email };
  }, []);

  const register = useCallback<AuthContextValue['register']>(
    async (email, password) => {
      const account = await findEnabledAccount(email);

      if (hasPassword(account.id)) {
        throw new AuthError('Esta cuenta ya está activada. Inicia sesión con tu contraseña.');
      }

      const check = checkPassword(password, account.email);
      if (!check.valid) throw new AuthError(check.error);

      await setPassword(account.id, password);

      // Con verificación activa la sesión NO empieza aquí: falta el código.
      if (appConfig.auth.requireEmailVerification) {
        await requestVerification(account);
        return null;
      }
      return startSession(account);
    },
    [startSession, requestVerification],
  );

  const confirmVerification = useCallback<AuthContextValue['confirmVerification']>(
    async (code) => {
      if (!pending) {
        throw new AuthError('La verificación expiró. Vuelve a escribir tu contraseña.');
      }

      const result = await checkCode(pending.id, code);

      if (result.status === 'ok') {
        const account = await db.users.get(pending.id);
        if (!account?.active) throw new AuthError('Esta cuenta ya no está disponible.');
        return startSession(account);
      }
      if (result.status === 'expired') {
        throw new AuthError('El código venció. Pide uno nuevo.');
      }
      if (result.status === 'exhausted') {
        throw new AuthError('Demasiados intentos fallidos. Pide un código nuevo.');
      }
      if (result.status === 'missing') {
        throw new AuthError('No hay ningún código pendiente. Pide uno nuevo.');
      }
      throw new AuthError(
        result.attemptsLeft === 1
          ? 'Código incorrecto. Te queda 1 intento.'
          : `Código incorrecto. Te quedan ${result.attemptsLeft} intentos.`,
      );
    },
    [pending, startSession],
  );

  const resendVerification = useCallback<AuthContextValue['resendVerification']>(async () => {
    if (!pending) {
      throw new AuthError('La verificación expiró. Vuelve a escribir tu contraseña.');
    }

    const wait = secondsUntilResend(pending.id);
    if (wait > 0) {
      throw new AuthError(`Espera ${wait} segundos antes de pedir otro código.`);
    }

    const account = await db.users.get(pending.id);
    if (!account?.active) throw new AuthError('Esta cuenta ya no está disponible.');

    return requestVerification(account);
  }, [pending, requestVerification]);

  const cancelVerification = useCallback(() => setPending(null), []);

  const signInAsDemo = useCallback<AuthContextValue['signInAsDemo']>(
    async (userId) => {
      if (!appConfig.auth.enableDemoAccounts) {
        throw new AuthError('El acceso de demostración está desactivado.');
      }
      const account = await db.users.get(userId);
      if (!account?.active) throw new AuthError('Esa cuenta de demostración no está disponible.');
      return startSession(account);
    },
    [startSession],
  );

  const signOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setPending(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(
    async (patch) => {
      if (!user) return;
      const updated = await db.users.update(user.id, patch);
      setUser(updated);
    },
    [user],
  );

  const changePassword = useCallback<AuthContextValue['changePassword']>(
    async (currentPassword, newPassword) => {
      if (!user) throw new AuthError('No hay una sesión activa.');

      // Una cuenta abierta con el acceso de demostración no tiene clave previa.
      if (hasPassword(user.id) && !(await verifyPassword(user.id, currentPassword))) {
        throw new AuthError('La contraseña actual no es correcta.');
      }

      const check = checkPassword(newPassword, user.email);
      if (!check.valid) throw new AuthError(check.error);

      await setPassword(user.id, newPassword);
    },
    [user],
  );

  const hasRole = useCallback(
    (minimum: Role) => (user ? ROLE_ORDER[user.role] >= ROLE_ORDER[minimum] : false),
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      loading,
      pending,
      signIn,
      lookupAccount,
      register,
      confirmVerification,
      resendVerification,
      cancelVerification,
      signInAsDemo,
      signOut,
      updateProfile,
      changePassword,
      hasRole,
    }),
    [
      user,
      loading,
      pending,
      signIn,
      lookupAccount,
      register,
      confirmVerification,
      resendVerification,
      cancelVerification,
      signInAsDemo,
      signOut,
      updateProfile,
      changePassword,
      hasRole,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return context;
}

/** Sesión garantizada: para usar dentro de rutas ya protegidas. */
export function useCurrentUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error('No hay sesión activa en una ruta protegida.');
  return user;
}
