import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, MailCheck, ShieldCheck, X } from 'lucide-react';
import { appConfig } from '@/config/app.config';
import { AuthError, useAuth } from '@/core/auth/AuthContext';
import { checkPassword, passwordStrength } from '@/core/auth/passwordPolicy';
import { CODE_MIN_LENGTH, normalizeCode } from '@/core/auth/verification';
import { Button, Field, Input, PasswordField, SplashScreen } from '@/ui';
import { AuthLayout } from './AuthLayout';

/* ============================================================================
   RECUPERAR LA CONTRASEÑA
   ----------------------------------------------------------------------------
   Tres pasos, iguales a los de activar la cuenta para que no haya que aprender
   nada nuevo: correo → código → contraseña nueva.

   POR QUÉ EXISTE ESTA PANTALLA
   Antes decía "escríbele al Centro de Alumnos para que restablezca tu cuenta",
   y con servidor eso ya no lleva a ninguna parte: la contraseña la guarda
   Supabase cifrada y la administración no puede borrarla ni verla. Quien la
   olvidara quedaba fuera de la aplicación sin salida.

   NO DICE SI EL CORREO EXISTE
   Se responde igual haya cuenta o no. Si dijera "ese correo no está
   registrado", cualquiera podría usar esta pantalla para averiguar quién tiene
   cuenta, que es justo lo que la nómina evita en todo el resto de la app.
   ========================================================================== */

export function RecoverPasswordPage() {
  const { user, loading, canRecoverPassword, requestPasswordReset, confirmPasswordReset } =
    useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const check = useMemo(() => checkPassword(password, email), [password, email]);
  const strength = useMemo(() => passwordStrength(password), [password]);
  const mismatch = repeat.length > 0 && repeat !== password;

  if (loading) return <SplashScreen />;
  if (user) return <Navigate to="/" replace />;

  const handleRequest = async () => {
    setError('');
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setStep(2);
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : 'No fue posible enviar el código.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    setError('');
    if (code.length < CODE_MIN_LENGTH) {
      setError(`El código tiene al menos ${CODE_MIN_LENGTH} dígitos.`);
      return;
    }
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
      await confirmPasswordReset(email, code, password);
      navigate('/', { replace: true });
    } catch (caught) {
      setError(
        caught instanceof AuthError ? caught.message : 'No fue posible cambiar la contraseña.',
      );
      setCode('');
    } finally {
      setSubmitting(false);
    }
  };

  const alert = error ? (
    <p
      role="alert"
      className="rounded-field border border-danger-500 bg-surface-2 px-3.5 py-3 text-[13px] font-medium leading-relaxed text-danger-500"
    >
      {error}
    </p>
  ) : null;

  const volverAlAcceso = (
    <div className="mt-6 rounded-field border border-line bg-surface-2 p-4 text-center">
      <p className="text-[13px] font-semibold text-ink">¿Te acordaste?</p>
      <Link
        to="/acceso"
        className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-field border border-line bg-surface px-4 text-sm font-semibold text-ink transition hover:bg-surface-3"
      >
        Volver a iniciar sesión
      </Link>
    </div>
  );

  /* Sin servidor no hay a dónde mandar el código. Se dice, en vez de ofrecer un
     formulario que fallaría después de escribirlo todo. */
  if (!canRecoverPassword) {
    return (
      <AuthLayout
        title="Recuperar mi contraseña"
        description="Esta versión de la aplicación no envía correos."
      >
        <p className="rounded-field border border-line bg-surface-2 px-3.5 py-3 text-[13px] leading-relaxed text-ink-2">
          Estás en la versión de demostración, que guarda todo en este navegador y no manda
          correos. Para entrar, usa una de las cuentas de prueba de la pantalla de acceso.
        </p>
        {volverAlAcceso}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recuperar mi contraseña"
      description={
        step === 1
          ? 'Te mandamos un código a tu correo institucional.'
          : 'Escribe el código y elige tu contraseña nueva.'
      }
    >
      {step === 1 ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleRequest();
          }}
          className="space-y-4"
          noValidate
        >
          {alert}

          <Field label="Correo institucional" htmlFor="recover-email" hint={appConfig.auth.emailHint}>
            <Input
              id="recover-email"
              type="email"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
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
            disabled={email.trim().length === 0}
            className="w-full"
          >
            Enviarme el código
          </Button>
        </form>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleConfirm();
          }}
          className="space-y-4"
          noValidate
        >
          {alert}

          <div className="flex gap-3 rounded-field border border-line bg-surface-2 p-3.5">
            <MailCheck size={18} className="mt-0.5 shrink-0 text-ink-3" />
            <p className="text-[13px] leading-relaxed text-ink-2">
              Si <span className="font-bold text-ink">{email}</span> tiene cuenta, le acaba de
              llegar un código. Revisa también la carpeta de spam.
            </p>
          </div>

          <Field label="Código del correo" htmlFor="recover-code" required>
            <input
              id="recover-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              placeholder="000000"
              value={code}
              onChange={(event) => setCode(normalizeCode(event.target.value))}
              aria-invalid={Boolean(error)}
              className="h-14 w-full rounded-field border border-line bg-surface text-center text-[24px] font-extrabold tracking-[0.35em] text-ink outline-none transition placeholder:font-normal placeholder:tracking-[0.35em] placeholder:text-ink-3 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
            />
          </Field>

          <PasswordField
            label="Contraseña nueva"
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
            disabled={code.length < CODE_MIN_LENGTH || !check.valid || mismatch || repeat.length === 0}
            className="w-full"
          >
            Guardar y entrar
          </Button>

          <button
            type="button"
            onClick={() => {
              setStep(1);
              setCode('');
              setError('');
            }}
            className="w-full text-center text-[13px] font-semibold text-ink-2 underline-offset-2 hover:underline"
          >
            Escribí mal el correo
          </button>
        </form>
      )}

      {volverAlAcceso}
    </AuthLayout>
  );
}
