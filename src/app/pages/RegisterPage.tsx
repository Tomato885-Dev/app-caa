import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ShieldCheck, UserCheck, X } from 'lucide-react';
import { appConfig } from '@/config/app.config';
import { AuthError, useAuth, type AccountPreview } from '@/core/auth/AuthContext';
import { checkPassword, passwordStrength } from '@/core/auth/passwordPolicy';
import { Avatar, Button, Field, Input, PasswordField, SplashScreen } from '@/ui';
import { AuthLayout } from './AuthLayout';
import { VerifyEmailStep } from './VerifyEmailStep';

/* ============================================================================
   ACTIVAR MI CUENTA (registro)
   ----------------------------------------------------------------------------
   No crea cuentas: le pone contraseña a una cuenta que YA existe en la nómina
   oficial del colegio. Quien no esté en esa lista no puede registrarse.

   Va en tres pasos:
     1. Correo  → la app confirma en voz alta a quién pertenece ("¿Eres tú?").
     2. Clave   → recién ahí se pide la contraseña.
     3. Código  → se comprueba que el correo es suyo de verdad.

   El segundo paso evita el error clásico de activar la cuenta de otra persona
   por una letra mal escrita; el tercero lo vuelve imposible, porque el código
   llega a la bandeja del dueño del correo.
   ========================================================================== */

export function RegisterPage() {
  const { user, loading, pending, lookupAccount, register } = useAuth();
  const navigate = useNavigate();

  const [account, setAccount] = useState<AccountPreview | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const check = useMemo(
    () => checkPassword(password, account?.email ?? email),
    [password, account, email],
  );
  const strength = useMemo(() => passwordStrength(password), [password]);
  const mismatch = repeat.length > 0 && repeat !== password;

  if (loading) return <SplashScreen />;
  if (user) return <Navigate to="/" replace />;

  const handleLookup = async () => {
    setError('');
    setSubmitting(true);
    try {
      setAccount(await lookupAccount(email));
    } catch (caught) {
      setError(
        caught instanceof AuthError ? caught.message : 'No fue posible verificar el correo.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!account) return;
    setError('');

    if (!check.valid) {
      setError(check.error);
      return;
    }
    if (password !== repeat) {
      setError('Las dos contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      // Con verificación activa devuelve `null`: falta escribir el código, y
      // `pending` hace que esta misma pantalla pase al paso 3.
      const signedIn = await register(account.email, password);
      if (signedIn) navigate('/', { replace: true });
    } catch (caught) {
      setError(
        caught instanceof AuthError ? caught.message : 'No fue posible activar la cuenta.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setAccount(null);
    setPassword('');
    setRepeat('');
    setError('');
  };

  const step = pending ? 3 : account ? 2 : 1;

  const alert = error ? (
    <p
      role="alert"
      className="rounded-field border border-danger-500 bg-surface-2 px-3.5 py-3 text-[13px] font-medium leading-relaxed text-danger-500"
    >
      {error}
    </p>
  ) : null;

  return (
    <AuthLayout
      title={step === 3 ? 'Verifica tu correo' : 'Activar mi cuenta'}
      description={
        step === 3
          ? 'Último paso: comprobamos que el correo es tuyo.'
          : step === 2
            ? 'Crea la contraseña con la que entrarás de ahora en adelante.'
            : 'Tu cuenta ya está creada por el colegio. Solo falta ponerle contraseña.'
      }
    >
      <ol className="mb-6 flex items-center gap-1.5" aria-label="Progreso del registro">
        <StepDot index={1} label="Correo" done={step > 1} current={step === 1} />
        <div className="h-px flex-1 bg-line-strong" aria-hidden />
        <StepDot index={2} label="Clave" done={step > 2} current={step === 2} />
        <div className="h-px flex-1 bg-line-strong" aria-hidden />
        <StepDot index={3} label="Código" done={false} current={step === 3} />
      </ol>

      {pending ? (
        <VerifyEmailStep pending={pending} />
      ) : account ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleRegister();
          }}
          className="space-y-4"
          noValidate
        >
          {alert}

          {/* Confirmación de identidad antes de pedir la clave. */}
          <div className="flex items-center gap-3 rounded-field border border-brand-200 bg-brand-50 p-3.5 dark:border-brand-500 dark:bg-brand-950">
            <Avatar name={account.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-bold text-brand-700 dark:text-brand-300">
                {account.name}
              </p>
              <p className="truncate text-[12px] text-brand-600 dark:text-brand-300">
                {account.grade} · {account.email}
              </p>
            </div>
            <UserCheck size={17} className="shrink-0 text-brand-600 dark:text-brand-300" />
          </div>

          <PasswordField
            label="Crea tu contraseña"
            required
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo 8 caracteres"
          />

          {password ? (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-ink-2">Seguridad</span>
                <span className="text-[12px] font-semibold text-ink-2">{strength.label}</span>
              </div>
              <div className="mt-1.5 flex gap-1" aria-hidden>
                {[0, 1, 2].map((slot) => (
                  <span
                    key={slot}
                    className={
                      'h-1.5 flex-1 rounded-full ' +
                      (slot < strength.score ? 'bg-brand-500 dark:bg-brand-300' : 'bg-line-strong')
                    }
                  />
                ))}
              </div>
              <ul className="mt-2.5 space-y-1">
                {check.results.map(({ rule, ok }) => (
                  <li key={rule.id} className="flex items-start gap-1.5 text-[12.5px] leading-snug">
                    {ok ? (
                      <Check size={14} className="mt-0.5 shrink-0 text-brand-500 dark:text-brand-300" />
                    ) : (
                      <X size={14} className="mt-0.5 shrink-0 text-ink-3" />
                    )}
                    <span className={ok ? 'text-ink-2' : 'text-ink-3'}>{rule.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <PasswordField
            label="Repite la contraseña"
            required
            autoComplete="new-password"
            value={repeat}
            onChange={(event) => setRepeat(event.target.value)}
            placeholder="La misma de arriba"
            error={mismatch ? 'Las dos contraseñas no coinciden.' : undefined}
          />

          <Button
            type="submit"
            size="lg"
            icon={ShieldCheck}
            loading={submitting}
            disabled={!check.valid || mismatch || repeat.length === 0}
            className="w-full"
          >
            Activar cuenta y entrar
          </Button>

          <button
            type="button"
            onClick={restart}
            className="w-full text-center text-[13px] font-semibold text-ink-2 underline-offset-2 hover:underline"
          >
            No soy yo, cambiar el correo
          </button>
        </form>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleLookup();
          }}
          className="space-y-4"
          noValidate
        >
          {alert}

          <Field
            label="Correo institucional"
            htmlFor="register-email"
            hint={appConfig.auth.emailHint}
          >
            <Input
              id="register-email"
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

          <Button
            type="submit"
            size="lg"
            iconRight={ArrowRight}
            loading={submitting}
            className="w-full"
          >
            Continuar
          </Button>
        </form>
      )}

      <div
        className={
          'mt-6 rounded-field border border-line bg-surface-2 p-4 text-center ' +
          (pending ? 'hidden' : '')
        }
      >
        <p className="text-[13px] font-semibold text-ink">¿Ya activaste tu cuenta?</p>
        <Link
          to="/acceso"
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-field border border-line bg-surface px-4 text-sm font-semibold text-ink transition hover:bg-surface-3"
        >
          Iniciar sesión
        </Link>
      </div>
    </AuthLayout>
  );
}

/** Indicador de paso del registro. */
function StepDot({
  index,
  label,
  done,
  current,
}: {
  index: number;
  label: string;
  done: boolean;
  current: boolean;
}) {
  const active = done || current;
  return (
    <li className="flex items-center gap-2">
      <span
        aria-hidden
        className={
          'flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold ' +
          (active ? 'bg-brand-500 text-white' : 'bg-surface-3 text-ink-3')
        }
      >
        {done ? <Check size={14} /> : index}
      </span>
      <span
        className={
          'text-[12.5px] font-semibold ' + (active ? 'text-ink' : 'text-ink-3')
        }
      >
        {label}
      </span>
      {current ? <span className="sr-only">(paso actual)</span> : null}
    </li>
  );
}
