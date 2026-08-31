import { useEffect, useState } from 'react';
import { newsCategories } from '@/content/taxonomies';
import { toAuthorRef } from '@/content/seed/users';
import type { NewsPost, User } from '@/core/types';
import { useCreateNews, useUpdateNews } from '@/modules/news/api';
import { Button, Field, SelectField, Sheet, TextField, useToast } from '@/ui';
import { ImageKeyField } from './ImageKeyField';

/** Publicación y edición de noticias oficiales (§8.1). */
export function NewsFormSheet({
  open,
  onClose,
  editing,
  user,
}: {
  open: boolean;
  onClose: () => void;
  editing: NewsPost | null;
  user: User;
}) {
  const notify = useToast();
  const create = useCreateNews();
  const update = useUpdateNews();

  const [form, setForm] = useState({
    title: '',
    summary: '',
    body: '',
    category: newsCategories[0] as string,
    imageKey: '',
    featured: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Al abrir en modo edición, precargar los valores existentes.
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      editing
        ? {
            title: editing.title,
            summary: editing.summary,
            body: editing.body,
            category: editing.category,
            imageKey: editing.imageKey ?? '',
            featured: editing.featured,
          }
        : {
            title: '',
            summary: '',
            body: '',
            category: newsCategories[0],
            imageKey: '',
            featured: false,
          },
    );
  }, [open, editing]);

  const set = (key: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    if (form.title.trim().length < 8) nextErrors.title = 'El título es demasiado corto.';
    if (form.summary.trim().length < 20) nextErrors.summary = 'Escribe una bajada más informativa.';
    if (form.body.trim().length < 40) nextErrors.body = 'Desarrolla el cuerpo de la noticia.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      body: form.body.trim(),
      category: form.category,
      imageKey: form.imageKey || undefined,
      featured: form.featured,
    };

    const onSuccess = () => {
      notify(editing ? 'Noticia actualizada.' : 'Noticia publicada.');
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
          // Publicación oficial: no requiere revisión de terceros (§6.2).
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
      title={editing ? 'Editar noticia' : 'Nueva noticia'}
      description="Las noticias se publican directamente y quedan visibles para toda la comunidad."
      footer={
        <Button
          size="lg"
          onClick={handleSubmit}
          loading={create.isPending || update.isPending}
          className="w-full"
        >
          {editing ? 'Guardar cambios' : 'Publicar noticia'}
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
          maxLength={120}
        />

        <TextField
          label="Bajada"
          required
          multiline
          rows={2}
          error={errors.summary}
          value={form.summary}
          onChange={(event) => set('summary', event.target.value)}
          hint="Resumen de una o dos líneas que aparece en los listados."
        />

        <SelectField
          label="Categoría"
          required
          value={form.category}
          onChange={(event) => set('category', event.target.value)}
          options={newsCategories.map((name) => ({ value: name, label: name }))}
        />

        <TextField
          label="Cuerpo"
          required
          multiline
          rows={8}
          error={errors.body}
          value={form.body}
          onChange={(event) => set('body', event.target.value)}
          hint="Separa los párrafos con un salto de línea."
        />

        <ImageKeyField
          value={form.imageKey}
          onChange={(value) => set('imageKey', value)}
          prefix="news."
        />

        <Field label="Destacar">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-field border border-line p-3">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => set('featured', event.target.checked)}
              className="h-4 w-4 accent-[var(--color-brand-500)]"
            />
            <span className="text-[13.5px] text-ink-2">
              Mostrar esta noticia al inicio de la aplicación.
            </span>
          </label>
        </Field>
      </div>
    </Sheet>
  );
}
