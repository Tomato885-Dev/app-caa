import { useEffect, useState } from 'react';
import { signupKinds } from '@/content/taxonomies';
import { toAuthorRef } from '@/content/seed/users';
import type { SignupActivity, SignupActivityKind, User } from '@/core/types';
import { useCreateActivity, useUpdateActivity } from '@/modules/signups/api';
import { Button, Field, SelectField, Sheet, TextField, useToast } from '@/ui';
import { ImageKeyField } from './ImageKeyField';

function toDateInput(iso: string | undefined): string {
  return iso ? new Date(iso).toISOString().slice(0, 10) : '';
}

/** Creación y edición de convocatorias con inscripción (§8.1). */
export function ActivityFormSheet({
  open,
  onClose,
  editing,
  user,
}: {
  open: boolean;
  onClose: () => void;
  editing: SignupActivity | null;
  user: User;
}) {
  const notify = useToast();
  const create = useCreateActivity();
  const update = useUpdateActivity();

  const empty = {
    title: '',
    description: '',
    kind: 'otro' as SignupActivityKind,
    imageKey: '',
    closesAt: '',
    capacity: '',
    location: '',
    requirements: '',
    open: true,
  };

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      editing
        ? {
            title: editing.title,
            description: editing.description,
            kind: editing.kind,
            imageKey: editing.imageKey ?? '',
            closesAt: toDateInput(editing.closesAt),
            capacity: editing.capacity === null ? '' : String(editing.capacity),
            location: editing.location ?? '',
            requirements: editing.requirements ?? '',
            open: editing.open,
          }
        : empty,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const set = (key: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    if (form.title.trim().length < 5) nextErrors.title = 'El título es demasiado corto.';
    if (!form.closesAt) nextErrors.closesAt = 'Indica hasta cuándo se reciben inscripciones.';
    if (form.description.trim().length < 20)
      nextErrors.description = 'Describe la convocatoria con más detalle.';
    if (form.capacity && (!/^\d+$/.test(form.capacity) || Number(form.capacity) < 1)) {
      nextErrors.capacity = 'Ingresa un número de cupos válido, o déjalo vacío.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      kind: form.kind,
      imageKey: form.imageKey || undefined,
      // Cierre al final del día indicado.
      closesAt: new Date(`${form.closesAt}T23:59:00`).toISOString(),
      capacity: form.capacity ? Number(form.capacity) : null,
      location: form.location.trim() || undefined,
      requirements: form.requirements.trim() || undefined,
      open: form.open,
    };

    const onSuccess = () => {
      notify(editing ? 'Convocatoria actualizada.' : 'Convocatoria publicada.');
      onClose();
    };

    if (editing) {
      update.mutate({ id: editing.id, patch: payload }, { onSuccess });
    } else {
      create.mutate(
        {
          ...payload,
          organizer: toAuthorRef(user),
          // Las preguntas adicionales se configuran editando el contenido semilla.
          questions: [],
          status: 'approved',
        },
        { onSuccess },
      );
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? 'Editar convocatoria' : 'Nueva convocatoria'}
      footer={
        <Button
          size="lg"
          onClick={handleSubmit}
          loading={create.isPending || update.isPending}
          className="w-full"
        >
          {editing ? 'Guardar cambios' : 'Publicar convocatoria'}
        </Button>
      }
    >
      <div className="space-y-4">
        <TextField
          label="Título"
          required
          error={errors.title}
          value={form.title}
          onChange={(event) => set('title', event.target.value)}
        />

        <SelectField
          label="Tipo de actividad"
          required
          value={form.kind}
          onChange={(event) => set('kind', event.target.value)}
          options={signupKinds.map((kind) => ({ value: kind.value, label: kind.label }))}
        />

        <TextField
          label="Descripción"
          required
          multiline
          rows={5}
          error={errors.description}
          value={form.description}
          onChange={(event) => set('description', event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Cierre de inscripciones"
            required
            type="date"
            error={errors.closesAt}
            value={form.closesAt}
            onChange={(event) => set('closesAt', event.target.value)}
          />
          <TextField
            label="Cupos"
            inputMode="numeric"
            error={errors.capacity}
            value={form.capacity}
            onChange={(event) => set('capacity', event.target.value)}
            placeholder="Sin límite"
            hint="Déjalo vacío para no limitar los cupos."
          />
        </div>

        <TextField
          label="Lugar (opcional)"
          value={form.location}
          onChange={(event) => set('location', event.target.value)}
        />

        <TextField
          label="Requisitos (opcional)"
          multiline
          rows={2}
          value={form.requirements}
          onChange={(event) => set('requirements', event.target.value)}
        />

        <ImageKeyField
          value={form.imageKey}
          onChange={(value) => set('imageKey', value)}
          prefix="signup."
        />

        <Field label="Estado">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-field border border-line p-3">
            <input
              type="checkbox"
              checked={form.open}
              onChange={(event) => set('open', event.target.checked)}
              className="h-4 w-4 accent-[var(--color-brand-500)]"
            />
            <span className="text-[13.5px] text-ink-2">Recibir inscripciones.</span>
          </label>
        </Field>
      </div>
    </Sheet>
  );
}
