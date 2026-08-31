import { useId, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Field, Input } from './Form';

/* ============================================================================
   CAMPO DE CONTRASEÑA
   ----------------------------------------------------------------------------
   Campo de texto oculto con un botón para mostrar lo escrito. En el teléfono
   esto evita el error más frecuente al registrarse: escribir mal la clave sin
   poder verla.

   El botón se anuncia a los lectores de pantalla y no entra en el orden de
   tabulación del formulario, para que la tecla Tab siga yendo de un campo al
   siguiente.
   ========================================================================== */

export function PasswordField({
  label,
  hint,
  error,
  required,
  ...rest
}: {
  label: string;
  hint?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={id}>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          className="pr-12"
          {...rest}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-field text-ink-3 transition hover:bg-surface-2 hover:text-ink"
        >
          <Icon size={17} />
        </button>
      </div>
    </Field>
  );
}
