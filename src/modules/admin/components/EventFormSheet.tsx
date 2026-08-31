import { useEffect, useState } from 'react';
import { eventCategories } from '@/content/taxonomies';
import { toAuthorRef } from '@/content/seed/users';
import type { EventItem, User } from '@/core/types';
import { useCreateEvent, useUpdateEvent } from '@/modules/events/api';
import { Button, SelectField, Sheet, TextField, useToast } from '@/ui';
import { ImageKeyField } from './ImageKeyField';

/** Convierte ISO ↔ valor de un input datetime-local. */
function toLocalInput(iso: string | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromLocalInput(value: string): string {
  return new Date(value).toISOString();
}

/** Creación y edición de eventos del calendario (§8.1). */
export function EventFormSheet({
  open,
  onClose,
  editing,
  user,
}: {
  open: boolean;
  onClose: () => void;
  editing: EventItem | null;
  user: User;
}) {
  const notify = useToast();
  const create = useCreateEvent();
  const update = useUpdateEvent();

  const empty = {
    title: '',
    description: '',
    category: eventCategories[0] as string,
    imageKey: '',
    startsAt: '',
    endsAt: '',
    location: '',
    requirements: '',
    contactName: '',
    contactEmail: '',
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
            category: editing.category,
            imageKey: editing.imageKey ?? '',
            startsAt: toLocalInput(editing.startsAt),
            endsAt: toLocalInput(editing.endsAt),
            location: editing.location,
            requirements: editing.requirements ?? '',
            contactName: editing.contactName ?? '',
            contactEmail: editing.contactEmail ?? '',
          }
        : empty,
    );
    // `empty` es una constante literal; no necesita entrar en las dependencias.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const set = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    if (form.title.trim().length < 5) nextErrors.title = 'El título es demasiado corto.';
    if (!form.startsAt) nextErrors.startsAt = 'Indica la fecha y hora de inicio.';
    if (form.endsAt && form.startsAt && new Date(form.endsAt) < new Date(form.startsAt)) {
      nextErrors.endsAt = 'El término no puede ser anterior al inicio.';
    }
    if (!form.location.trim()) nextErrors.location = 'Indica dónde se realiza.';
    if (form.description.trim().length < 20)
      nextErrors.description = 'Describe la actividad con más detalle.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      imageKey: form.imageKey || undefined,
      startsAt: fromLocalInput(form.startsAt),
      endsAt: form.endsAt ? fromLocalInput(form.endsAt) : undefined,
      location: form.location.trim(),
      requirements: form.requirements.trim() || undefined,
      contactName: form.contactName.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
    };

    const onSuccess = () => {
      notify(editing ? 'Evento actualizado.' : 'Evento publicado.');
      onClose();
    };

    if (editing) {
      update.mutate({ id: editing.id, patch: payload }, { onSuccess });
    } else {
      create.mutate({ ...payload, organizer: toAuthorRef(user), status: 'approved' }, { onSuccess });
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? 'Editar evento' : 'Nuevo evento'}
      footer={
        <Button
          size="lg"
          onClick={handleSubmit}
          loading={create.isPending || update.isPending}
          className="w-full"
        >
          {editing ? 'Guardar cambios' : 'Publicar evento'}
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
          label="Categoría"
          required
          value={form.category}
          onChange={(event) => set('category', event.target.value)}
          options={eventCategories.map((name) => ({ value: name, label: name }))}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Inicio"
            required
            type="datetime-local"
            error={errors.startsAt}
            value={form.startsAt}
            onChange={(event) => set('startsAt', event.target.value)}
          />
          <TextField
            label="Término (opcional)"
            type="datetime-local"
            error={errors.endsAt}
            value={form.endsAt}
            onChange={(event) => set('endsAt', event.target.value)}
          />
        </div>

        <TextField
          label="Ubicación"
          required
          error={errors.location}
          value={form.location}
          onChange={(event) => set('location', event.target.value)}
          placeholder="Ej: Gimnasio techado"
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

        <TextField
          label="Requisitos de participación (opcional)"
          multiline
          rows={2}
          value={form.requirements}
          onChange={(event) => set('requirements', event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Contacto (nombre)"
            value={form.contactName}
            onChange={(event) => set('contactName', event.target.value)}
          />
          <TextField
            label="Contacto (correo)"
            type="email"
            value={form.contactEmail}
            onChange={(event) => set('contactEmail', event.target.value)}
          />
        </div>

        <ImageKeyField
          value={form.imageKey}
          onChange={(value) => set('imageKey', value)}
          prefix="event."
        />
      </div>
    </Sheet>
  );
}
