import { useEffect, useState } from 'react';
import { announcementAudiences, announcementPriorities } from '@/content/taxonomies';
import { toAuthorRef } from '@/content/seed/users';
import type {
  Announcement,
  AnnouncementKind,
  AnnouncementPriority,
  User,
} from '@/core/types';
import { useCreateAnnouncement, useUpdateAnnouncement } from '@/modules/announcements/api';
import { Button, Field, SelectField, Sheet, TextField, useToast } from '@/ui';

/* ============================================================================
   COMUNICADOS
   ----------------------------------------------------------------------------
   Un solo formulario para las dos clases de aviso. Al elegir "Inscripción"
   aparece la fecha de cierre; en un comunicado corriente esa casilla no tiene
   sentido y no se muestra.

   No hay cupos ni botón para inscribirse: el colegio no autoriza gestionar
   inscripciones desde la aplicación. El comunicado avisa de la convocatoria y
   explica en su texto cómo participar.
   ========================================================================== */
export function AnnouncementFormSheet({
  open,
  onClose,
  editing,
  user,
}: {
  open: boolean;
  onClose: () => void;
  editing: Announcement | null;
  user: User;
}) {
  const notify = useToast();
  const create = useCreateAnnouncement();
  const update = useUpdateAnnouncement();

  const empty = {
    title: '',
    body: '',
    kind: 'general' as AnnouncementKind,
    deadline: '',
    priority: 'normal' as AnnouncementPriority,
    audience: announcementAudiences[0] as string,
    pinned: false,
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
            body: editing.body,
            kind: editing.kind,
            deadline: editing.deadline ? editing.deadline.slice(0, 10) : '',
            priority: editing.priority,
            audience: editing.audience,
            pinned: editing.pinned,
          }
        : empty,
    );
    // `empty` es una constante literal; no necesita entrar en las dependencias.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const set = (key: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    if (form.title.trim().length < 6) nextErrors.title = 'El título es demasiado corto.';
    if (form.body.trim().length < 20) nextErrors.body = 'Escribe el contenido del aviso.';
    if (form.kind === 'inscripcion' && form.deadline) {
      const cierre = new Date(`${form.deadline}T12:00:00`);
      if (Number.isNaN(cierre.getTime())) nextErrors.deadline = 'La fecha no es válida.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      kind: form.kind,
      // Mediodía: evita que la fecha se corra un día por la zona horaria.
      // Un comunicado corriente nunca guarda fecha de cierre.
      deadline:
        form.kind === 'inscripcion' && form.deadline
          ? new Date(`${form.deadline}T12:00:00`).toISOString()
          : undefined,
      priority: form.priority,
      audience: form.audience,
      pinned: form.pinned,
    };

    const onSuccess = () => {
      notify(editing ? 'Comunicado actualizado.' : 'Comunicado publicado.');
      onClose();
    };

    if (editing) {
      update.mutate({ id: editing.id, patch: payload }, { onSuccess });
    } else {
      create.mutate(
        {
          ...payload,
          author: toAuthorRef(user),
          publishedAt: new Date().toISOString(),
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
      title={editing ? 'Editar comunicado' : 'Nuevo comunicado'}
      description="Los comunicados se publican de inmediato y quedan visibles para la comunidad."
      footer={
        <Button
          size="lg"
          onClick={handleSubmit}
          loading={create.isPending || update.isPending}
          className="w-full"
        >
          {editing ? 'Guardar cambios' : 'Publicar comunicado'}
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Lo primero, porque decide qué más se pide más abajo. */}
        <SelectField
          label="Tipo"
          required
          value={form.kind}
          onChange={(event) => set('kind', event.target.value)}
          options={[
            { value: 'general', label: 'Comunicado' },
            { value: 'inscripcion', label: 'Inscripción' },
          ]}
          hint={
            form.kind === 'inscripcion'
              ? 'Aparece en la pestaña Inscripciones. Explica en el texto a quién hay que hablarle para participar.'
              : 'Un aviso corriente del día a día.'
          }
        />

        <TextField
          label="Título"
          required
          error={errors.title}
          value={form.title}
          onChange={(event) => set('title', event.target.value)}
          maxLength={120}
          hint="Directo y concreto: se lee de una pasada en el listado."
        />

        <TextField
          label="Contenido"
          required
          multiline
          rows={6}
          error={errors.body}
          value={form.body}
          onChange={(event) => set('body', event.target.value)}
          hint="Separa los párrafos con un salto de línea."
        />

        {form.kind === 'inscripcion' ? (
          <TextField
            label="Hasta cuándo se puede postular (opcional)"
            type="date"
            error={errors.deadline}
            value={form.deadline}
            onChange={(event) => set('deadline', event.target.value)}
            hint="Se muestra en la tarjeta y hace que la convocatoria aparezca sola en el calendario."
          />
        ) : null}

        <SelectField
          label="Prioridad"
          required
          value={form.priority}
          onChange={(event) => set('priority', event.target.value)}
          options={announcementPriorities.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          hint="Reserva «Urgente» para lo que de verdad no puede esperar."
        />

        <SelectField
          label="Dirigido a"
          required
          value={form.audience}
          onChange={(event) => set('audience', event.target.value)}
          options={announcementAudiences.map((name) => ({ value: name, label: name }))}
        />

        <Field label="Fijar">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-field border border-line p-3">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(event) => set('pinned', event.target.checked)}
              className="h-4 w-4 accent-[var(--color-brand-500)]"
            />
            <span className="text-[13.5px] text-ink-2">
              Mantener este comunicado al inicio del listado.
            </span>
          </label>
        </Field>
      </div>
    </Sheet>
  );
}
