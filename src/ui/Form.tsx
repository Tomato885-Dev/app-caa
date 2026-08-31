import { forwardRef, useId } from 'react';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cn } from './cn';

/* ============================================================================
   CONTROLES DE FORMULARIO
   ----------------------------------------------------------------------------
   Altura mínima de 44px en móvil (área táctil cómoda) y etiquetas siempre
   asociadas al control mediante `id`/`htmlFor`.
   ========================================================================== */

const fieldBase =
  'w-full rounded-field border border-line bg-surface px-3.5 text-[15px] text-ink ' +
  'placeholder:text-ink-3 transition outline-none ' +
  'focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 ' +
  'disabled:bg-surface-2 disabled:text-ink-3';

export function Field({
  label,
  hint,
  error,
  required,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-ink">
        {label}
        {required ? <span className="ml-0.5 text-danger-500">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-[12.5px] font-medium text-danger-500">{error}</p>
      ) : hint ? (
        <p className="text-[12.5px] leading-relaxed text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn(fieldBase, 'h-11', className)} {...rest} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, rows = 4, ...rest }, ref) {
    return <textarea ref={ref} rows={rows} className={cn(fieldBase, 'py-2.5', className)} {...rest} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select ref={ref} className={cn(fieldBase, 'h-11 pr-9 appearance-none', className)} {...rest}>
        {children}
      </select>
    );
  },
);

/** Campo de texto con etiqueta, en un solo componente. */
export function TextField({
  label,
  hint,
  error,
  required,
  multiline,
  ...rest
}: {
  label: string;
  hint?: string;
  error?: string;
  multiline?: boolean;
} & InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={id}>
      {multiline ? (
        <Textarea id={id} aria-invalid={!!error} {...rest} />
      ) : (
        <Input id={id} aria-invalid={!!error} {...rest} />
      )}
    </Field>
  );
}

/** Selector con etiqueta. */
export function SelectField({
  label,
  hint,
  error,
  required,
  options,
  ...rest
}: {
  label: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
} & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={id}>
      <Select id={id} aria-invalid={!!error} {...rest}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}
