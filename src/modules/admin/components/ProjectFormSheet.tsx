import { useEffect, useState } from 'react';
import { projectAreas } from '@/content/taxonomies';
import type { Project, ProjectStatus } from '@/core/types';
import { useCreateProject, useUpdateProject } from '@/modules/projects/api';
import { Button, Field, SelectField, Sheet, TextField, useToast } from '@/ui';
import { ImageKeyField } from './ImageKeyField';

/* Publicación y edición de los proyectos del colegio.
   El año de término se pide solo cuando el proyecto ya terminó, para no
   preguntar por un dato que no corresponde. */

const CURRENT_YEAR = new Date().getFullYear();
/* El colegio no tiene proyectos anteriores a esto; acota errores de tipeo. */
const MIN_YEAR = 1950;

export function ProjectFormSheet({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: Project | null;
}) {
  const notify = useToast();
  const create = useCreateProject();
  const update = useUpdateProject();

  const empty = {
    title: '',
    summary: '',
    description: '',
    area: projectAreas[0] as string,
    status: 'activo' as ProjectStatus,
    startYear: String(CURRENT_YEAR),
    endYear: '',
    imageKey: '',
    ledBy: '',
    howToJoin: '',
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
            summary: editing.summary,
            description: editing.description,
            area: editing.area,
            status: editing.status,
            startYear: String(editing.startYear),
            endYear: editing.endYear === null ? '' : String(editing.endYear),
            imageKey: editing.imageKey ?? '',
            ledBy: editing.ledBy ?? '',
            howToJoin: editing.howToJoin ?? '',
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

  const terminado = form.status === 'historico';

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    const startYear = Number(form.startYear);
    const endYear = form.endYear ? Number(form.endYear) : null;

    if (form.title.trim().length < 4) nextErrors.title = 'Escribe el nombre del proyecto.';
    if (form.summary.trim().length < 10) {
      nextErrors.summary = 'Resume el proyecto en una frase.';
    }
    if (form.description.trim().length < 30) {
      nextErrors.description = 'Cuenta de qué se trata, con al menos un par de líneas.';
    }
    if (!Number.isInteger(startYear) || startYear < MIN_YEAR || startYear > CURRENT_YEAR) {
      nextErrors.startYear = `Escribe un año entre ${MIN_YEAR} y ${CURRENT_YEAR}.`;
    }
    if (terminado) {
      if (endYear === null) {
        nextErrors.endYear = 'Indica en qué año terminó.';
      } else if (endYear < startYear || endYear > CURRENT_YEAR) {
        nextErrors.endYear = `Debe estar entre ${form.startYear} y ${CURRENT_YEAR}.`;
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      area: form.area,
      status: form.status,
      startYear,
      // Un proyecto en marcha no tiene año de término, aunque quedara escrito.
      endYear: terminado ? endYear : null,
      imageKey: form.imageKey || undefined,
      ledBy: form.ledBy.trim() || undefined,
      howToJoin: form.howToJoin.trim() || undefined,
    };

    const onSuccess = () => {
      notify(editing ? 'Proyecto actualizado.' : 'Proyecto publicado.');
      onClose();
    };

    if (editing) {
      update.mutate({ id: editing.id, patch: payload }, { onSuccess });
    } else {
      create.mutate(payload, { onSuccess });
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? 'Editar proyecto' : 'Nuevo proyecto'}
      description="Los proyectos los leen sobre todo los cursos más pequeños: escribe simple y directo."
      footer={
        <Button
          size="lg"
          onClick={handleSubmit}
          loading={create.isPending || update.isPending}
          className="w-full"
        >
          {editing ? 'Guardar cambios' : 'Publicar proyecto'}
        </Button>
      }
    >
      <div className="space-y-4">
        <TextField
          label="Nombre del proyecto"
          required
          error={errors.title}
          value={form.title}
          onChange={(event) => set('title', event.target.value)}
          maxLength={80}
          hint="Como lo conoce todo el mundo en el colegio."
        />

        <TextField
          label="En una frase"
          required
          error={errors.summary}
          value={form.summary}
          onChange={(event) => set('summary', event.target.value)}
          maxLength={140}
          hint="Es lo que se lee en el listado. Que se entienda sin saber nada del tema."
        />

        <TextField
          label="De qué se trata"
          required
          multiline
          rows={6}
          error={errors.description}
          value={form.description}
          onChange={(event) => set('description', event.target.value)}
          hint="Cómo partió, qué hace y qué ha logrado. Separa los párrafos con un salto de línea."
        />

        <SelectField
          label="Área"
          required
          value={form.area}
          onChange={(event) => set('area', event.target.value)}
          options={projectAreas.map((value) => ({ value, label: value }))}
        />

        <SelectField
          label="Estado"
          required
          value={form.status}
          onChange={(event) => set('status', event.target.value)}
          options={[
            { value: 'activo', label: 'En marcha' },
            { value: 'historico', label: 'Ya terminó' },
          ]}
          hint="Los que están en marcha aparecen primero en el listado."
        />

        <div className="flex gap-3">
          <div className="flex-1">
            <TextField
              label="Año de inicio"
              required
              inputMode="numeric"
              error={errors.startYear}
              value={form.startYear}
              onChange={(event) => set('startYear', event.target.value.replace(/\D/g, ''))}
              maxLength={4}
            />
          </div>
          {terminado ? (
            <div className="flex-1">
              <TextField
                label="Año de término"
                required
                inputMode="numeric"
                error={errors.endYear}
                value={form.endYear}
                onChange={(event) => set('endYear', event.target.value.replace(/\D/g, ''))}
                maxLength={4}
              />
            </div>
          ) : null}
        </div>

        <TextField
          label="A cargo de (opcional)"
          value={form.ledBy}
          onChange={(event) => set('ledBy', event.target.value)}
          maxLength={80}
          placeholder="Academia de Ciencias, Pastoral, un curso…"
        />

        {/* Solo tiene sentido en proyectos vigentes: a uno terminado no hay
            a qué sumarse. */}
        {form.status === 'activo' ? (
          <TextField
            label="Cómo participar (opcional)"
            multiline
            rows={3}
            value={form.howToJoin}
            onChange={(event) => set('howToJoin', event.target.value)}
            hint="A quién hay que hablarle y cuándo. Es lo que más buscan los alumnos de básica."
          />
        ) : (
          <Field label="Cómo participar">
            <p className="rounded-field border border-line bg-surface-2 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-2">
              No se pide en proyectos terminados: ya no hay a qué sumarse.
            </p>
          </Field>
        )}

        <ImageKeyField
          value={form.imageKey}
          onChange={(value) => set('imageKey', value)}
          prefix="projects."
        />
      </div>
    </Sheet>
  );
}
