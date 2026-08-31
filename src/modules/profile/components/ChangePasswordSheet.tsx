import { useMemo, useState } from 'react';
import { AuthError, useAuth } from '@/core/auth/AuthContext';
import { hasPassword } from '@/core/auth/credentials';
import { checkPassword } from '@/core/auth/passwordPolicy';
import type { User } from '@/core/types';
import { Button, PasswordField, Sheet, useToast } from '@/ui';

/* Cambio de contraseña de la sesión activa. Pide la clave anterior salvo que
   la cuenta se haya abierto con el acceso de demostración, que no tiene. */

export function ChangePasswordSheet({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: User;
}) {
  const { changePassword } = useAuth();
  const notify = useToast();
  const needsCurrent = hasPassword(user.id);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const check = useMemo(() => checkPassword(next, user.email), [next, user.email]);
  const mismatch = repeat.length > 0 && repeat !== next;

  const close = () => {
    setCurrent('');
    setNext('');
    setRepeat('');
    setError('');
    onClose();
  };

  const handleSave = async () => {
    setError('');
    if (!check.valid) {
      setError(check.error);
      return;
    }
    if (next !== repeat) {
      setError('Las dos contraseñas no coinciden.');
      return;
    }

    setSaving(true);
    try {
      await changePassword(current, next);
      notify('Contraseña actualizada.');
      close();
    } catch (caught) {
      setError(
        caught instanceof AuthError ? caught.message : 'No fue posible cambiar la contraseña.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Cambiar contraseña"
      footer={
        <Button
          size="lg"
          onClick={handleSave}
          loading={saving}
          disabled={!check.valid || mismatch || repeat.length === 0}
          className="w-full"
        >
          Guardar contraseña
        </Button>
      }
    >
      <div className="space-y-4">
        {error ? (
          <p
            role="alert"
            className="rounded-field border border-danger-500 bg-surface-2 px-3.5 py-3 text-[13px] font-medium leading-relaxed text-danger-500"
          >
            {error}
          </p>
        ) : null}

        {needsCurrent ? (
          <PasswordField
            label="Contraseña actual"
            required
            autoComplete="current-password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
          />
        ) : (
          <p className="rounded-field border border-line bg-surface-2 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-2">
            Esta sesión se abrió con una cuenta de demostración, que no tiene contraseña. La que
            crees aquí será la primera.
          </p>
        )}

        <PasswordField
          label="Nueva contraseña"
          required
          autoComplete="new-password"
          value={next}
          onChange={(event) => setNext(event.target.value)}
          placeholder="Mínimo 8 caracteres"
          hint={next && check.valid ? 'Cumple todos los requisitos.' : undefined}
          error={next && !check.valid ? check.error : undefined}
        />

        <PasswordField
          label="Repite la nueva contraseña"
          required
          autoComplete="new-password"
          value={repeat}
          onChange={(event) => setRepeat(event.target.value)}
          error={mismatch ? 'Las dos contraseñas no coinciden.' : undefined}
        />
      </div>
    </Sheet>
  );
}
