import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { appConfig } from '@/config/app.config';
import { demoAccounts, seedUsers } from '@/content/seed/users';
import { AuthError, useAuth } from '@/core/auth/AuthContext';
import { usingServer } from '@/core/data';
import { ROLE_LABEL } from '@/core/types';
import {
  Avatar,
  Button,
  Card,
  Field,
  Input,
  PasswordField,
  SplashScreen,
} from '@/ui';
import { AuthLayout } from './AuthLayout';
import { VerifyEmailStep } from './VerifyEmailStep';

/* ============================================================================
   INICIAR SESIÓN (§5 y §7)
   ----------------------------------------------------------------------------
   Segunda puerta del acceso: la cuenta ya fue activada en `RegisterPage` y
   aquí se entra con correo institucional + contraseña.

   El error se muestra una sola vez, sobre el formulario, en vez de repartido
   por campo: en un login de dos campos indicar cuál falló le sirve más a quien
   prueba contraseñas ajenas que a quien se equivocó de tecla.
   ========================================================================== */

export function LoginPage() {
  const { user, loading, pending, signIn, signInAsDemo, canRecoverPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  if (loading) return <SplashScreen />;

  const destination = (location.state as { from?: string })?.from ?? '/';
  if (user) return <Navigate to={destination} replace />;

  const run = async (action: () => Promise<unknown>) => {
    setError('');
    setSubmitting(true);
    try {
      // `signIn` devuelve `null` cuando falta verificar el correo: en ese caso
      // no se navega, porque `pending` cambia esta pantalla al paso del código.
      const signedIn = await action();
      if (signedIn) navigate(destination, { replace: true });
    } catch (caught) {
      setError(
        caught instanceof AuthError
          ? caught.message
          : 'No fue posible iniciar sesión. Intenta de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Cuenta con contraseña correcta pero correo sin comprobar: se retoma aquí
  // mismo, sin mandar a la persona a otra pantalla.
  if (pending) {
    return (
      <AuthLayout
        title="Verifica tu correo"
        description="Tu cuenta quedó a medio activar. Terminemos ahora."
      >
        <VerifyEmailStep pending={pending} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      description={`${appConfig.organization.institution} · Plataforma de participación estudiantil.`}
    >
      {/* PRIMERO SE ACTIVA. Estaba al fondo, bajo el formulario, y mucha gente
          intentaba iniciar sesión sin haber activado nunca su cuenta: no tenía
          contraseña que escribir y la app le respondía "contraseña incorrecta". */}
      <div className="mb-6 rounded-field border border-brand-200 bg-brand-50 p-4 dark:border-brand-500/40 dark:bg-brand-950">
        <p className="text-[14px] font-bold text-brand-700 dark:text-brand-300">
          ¿Primera vez en la app?
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
          Antes de iniciar sesión tienes que <span className="font-semibold text-ink">activar tu
          cuenta</span>. Se hace una sola vez y te llega un código al correo.
        </p>
        <Link
          to="/registro"
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-field bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-[0.98]"
        >
          <UserPlus size={17} />
          Activar mi cuenta
        </Link>
      </div>

      <p className="mb-3 text-[12px] font-bold uppercase tracking-wider text-ink-3">
        Ya activé mi cuenta
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void run(() => signIn(email, password));
        }}
        className="space-y-4"
        noValidate
      >
        {error ? (
          <p
            role="alert"
            className="rounded-field border border-danger-500 bg-surface-2 px-3.5 py-3 text-[13px] font-medium leading-relaxed text-danger-500"
          >
            {error}
          </p>
        ) : null}

        <Field label="Correo institucional" htmlFor="login-email" hint={appConfig.auth.emailHint}>
          <Input
            id="login-email"
            type="email"
            autoComplete="username"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={`nombre.apellido@${appConfig.auth.allowedEmailDomains[0]}`}
            aria-invalid={Boolean(error)}
          />
        </Field>

        <PasswordField
          label="Contraseña"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Tu contraseña"
          aria-invalid={Boolean(error)}
        />

        <Button
          type="submit"
          size="lg"
          variant="secondary"
          icon={LogIn}
          loading={submitting}
          className="w-full"
        >
          Entrar
        </Button>
      </form>

      {/* Con servidor se recupera sola, por correo. Sin servidor no hay a dónde
          escribir, así que se explica en vez de ofrecer un enlace que no
          llevaría a ninguna parte. */}
      <div className="mt-3 text-center">
        {canRecoverPassword ? (
          <Link
            to="/recuperar"
            className="text-[13px] font-semibold text-brand-600 underline-offset-2 hover:underline dark:text-brand-300"
          >
            Olvidé mi contraseña
          </Link>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setShowHelp((current) => !current)}
              aria-expanded={showHelp}
              className="text-[13px] font-semibold text-brand-600 underline-offset-2 hover:underline dark:text-brand-300"
            >
              Olvidé mi contraseña
            </button>
            {showHelp ? (
              <p className="mt-2 rounded-field border border-line bg-surface-2 px-3.5 py-3 text-left text-[12.5px] leading-relaxed text-ink-2">
                Escríbele al Centro de Alumnos para que restablezca tu cuenta desde el panel de
                administración. Luego podrás crear una contraseña nueva en{' '}
                <span className="font-semibold text-ink">Activar mi cuenta</span>.
              </p>
            ) : null}
          </>
        )}
      </div>

      <div className="mt-6 flex gap-2.5 rounded-field border border-line bg-surface-2 p-3.5">
        <ShieldCheck size={17} className="mt-0.5 shrink-0 text-ink-3" />
        <p className="text-[12.5px] leading-relaxed text-ink-2">
          El acceso está restringido a las cuentas institucionales de la nómina oficial. Tu
          contraseña se guarda cifrada y nadie —tampoco la administración— puede leerla.
        </p>
      </div>

      {/* Acceso rápido de demostración; se desactiva en appConfig. */}
      {appConfig.auth.enableDemoAccounts && !usingServer ? (
        <section className="mt-7">
          <p className="mb-1 text-[11.5px] font-bold uppercase tracking-wider text-ink-3">
            Cuentas de demostración
          </p>
          <p className="mb-2.5 text-[12px] leading-relaxed text-ink-3">
            Entran sin contraseña, solo para probar la aplicación.
          </p>
          <ul className="space-y-2">
            {demoAccounts.map((account) => {
              const seed = seedUsers.find((entry) => entry.id === account.id);
              if (!seed) return null;

              return (
                <li key={account.id}>
                  <button
                    type="button"
                    onClick={() => void run(() => signInAsDemo(seed.id))}
                    disabled={submitting}
                    className="w-full text-left"
                  >
                    <Card className="flex items-center gap-3 transition hover:border-line-strong">
                      <Avatar name={seed.name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-semibold text-ink">
                          {ROLE_LABEL[seed.role]}
                        </span>
                        <span className="block truncate text-[11.5px] text-ink-3">
                          {account.description}
                        </span>
                      </span>
                      <KeyRound size={15} className="shrink-0 text-ink-3" />
                    </Card>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </AuthLayout>
  );
}
