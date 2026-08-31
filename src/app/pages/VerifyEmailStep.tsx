import { useEffect, useState } from 'react';
import { MailCheck, RefreshCw, ShieldCheck, TriangleAlert } from 'lucide-react';
import { AuthError, useAuth, type PendingVerification } from '@/core/auth/AuthContext';
import { normalizeCode, secondsUntilResend } from '@/core/auth/verification';
import { Button, Field } from '@/ui';

/* ============================================================================
   PASO DE VERIFICACIÓN DEL CORREO
   ----------------------------------------------------------------------------
   Se muestra cuando hay una cuenta esperando su código: al terminar el registro
   y también al iniciar sesión con una cuenta que nunca llegó a verificarse.

   Lo usan las DOS pantallas de acceso, así que la experiencia es idéntica
   llegue por donde llegue el estudiante.

   MODO DESARROLLO
   Si no hay servicio de correo configurado, el código se muestra en un recuadro
   bien visible con su advertencia. Es la única forma de probar el flujo
   completo antes de tener servidor, y se apaga solo al configurar el envío.
   ========================================================================== */

export function VerifyEmailStep({ pending }: { pending: PendingVerification }) {
  const { confirmVerification, resendVerification, cancelVerification } = useAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [wait, setWait] = useState(() => secondsUntilResend(pending.id));

  // Cuenta atrás del reenvío. Se reinicia con cada código nuevo.
  useEffect(() => {
    setWait(secondsUntilResend(pending.id));
    const timer = window.setInterval(() => setWait(secondsUntilResend(pending.id)), 1000);
    return () => window.clearInterval(timer);
  }, [pending.id, pending.devCode, pending.sent]);

  const handleSubmit = async () => {
    if (code.length < 6) {
      setError('El código tiene 6 dígitos.');
      return;
    }
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      await confirmVerification(code);
      // Al acertar, la sesión queda iniciada y la pantalla se reemplaza sola.
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : 'No fue posible comprobar el código.');
      setCode('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setNotice('');
    setResending(true);
    try {
      const next = await resendVerification();
      setNotice(
        next.sent
          ? 'Te enviamos un código nuevo. Revisa tu correo.'
          : 'Generamos un código nuevo.',
      );
      setCode('');
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : 'No fue posible enviar otro código.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-4">
      {error ? (
        <p
          role="alert"
          className="rounded-field border border-danger-500 bg-surface-2 px-3.5 py-3 text-[13px] font-medium leading-relaxed text-danger-500"
        >
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="rounded-field border border-brand-200 bg-brand-50 px-3.5 py-3 text-[13px] font-medium leading-relaxed text-brand-700 dark:border-brand-500 dark:bg-brand-950 dark:text-brand-300">
          {notice}
        </p>
      ) : null}

      <div className="flex gap-3 rounded-field border border-line bg-surface-2 p-3.5">
        <MailCheck size={18} className="mt-0.5 shrink-0 text-ink-3" />
        <p className="text-[13px] leading-relaxed text-ink-2">
          {pending.sent ? 'Enviamos un código de 6 dígitos a' : 'El código de 6 dígitos es para'}{' '}
          <span className="font-bold text-ink">{pending.email}</span>. Vence en{' '}
          {pending.expiresInMinutes} minutos.
        </p>
      </div>

      {/* Modo desarrollo: sin servicio de correo, el código se muestra aquí. */}
      {pending.devCode ? (
        <div className="rounded-field border border-accent-500 bg-accent-100 p-3.5 dark:bg-accent-950">
          <div className="flex items-center gap-2">
            <TriangleAlert size={16} className="shrink-0 text-accent-700 dark:text-accent-300" />
            <p className="text-[12px] font-bold uppercase tracking-wider text-accent-700 dark:text-accent-300">
              Modo de prueba
            </p>
          </div>
          <p className="mt-2 text-center text-[30px] font-extrabold tracking-[0.2em] text-ink">
            {pending.devCode}
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-accent-700 dark:text-accent-300">
            Todavía no hay servicio de correo configurado, así que el código se muestra aquí en vez
            de enviarse. Al conectarlo, este recuadro desaparece solo.
          </p>
        </div>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
        className="space-y-4"
        noValidate
      >
        <Field label="Código de verificación" htmlFor="verify-code" required>
          {/* Campo propio en vez de `Input`: necesita tipografía grande y
              espaciada, y así no compite con los tamaños del componente base. */}
          <input
            id="verify-code"
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

        <Button
          type="submit"
          size="lg"
          icon={ShieldCheck}
          loading={submitting}
          disabled={code.length < 6}
          className="w-full"
        >
          Verificar y entrar
        </Button>
      </form>

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon={RefreshCw}
          loading={resending}
          disabled={wait > 0}
          onClick={() => void handleResend()}
        >
          {wait > 0 ? `Reenviar en ${wait}s` : 'Enviar otro código'}
        </Button>

        <button
          type="button"
          onClick={cancelVerification}
          className="text-[13px] font-semibold text-ink-2 underline-offset-2 hover:underline"
        >
          Cancelar
        </button>
      </div>

      <p className="text-[12px] leading-relaxed text-ink-3">
        ¿No te llega? Revisa la carpeta de spam. Si sigue sin aparecer, avísale al Centro de
        Alumnos.
      </p>
    </div>
  );
}
