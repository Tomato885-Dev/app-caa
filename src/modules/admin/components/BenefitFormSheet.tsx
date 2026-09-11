import { useEffect, useState } from 'react';
import { benefitCategories } from '@/content/taxonomies';
import type { Benefit } from '@/core/types';
import { useCreateBenefit, useUpdateBenefit } from '@/modules/benefits/api';
import { Button, Field, SelectField, Sheet, TextField, useToast } from '@/ui';
import { ImageKeyField } from './ImageKeyField';

function toDateInput(iso: string | undefined): string {
  return iso ? new Date(iso).toISOString().slice(0, 10) : '';
}

/* ============================================================================
   CARGA Y EDICION DE LOS CONVENIOS
   ----------------------------------------------------------------------------
   Aqui habia un campo obligatorio con el contenido de un codigo QR. Se quito:
   ningun local escaneaba nada, y exigirlo obligaba a inventar un dato que no
   servia para cerrar un convenio.

   Queda el codigo de canje, que ahora es opcional. Hay convenios que se
   canjean solo diciendo que uno es del colegio, y antes no se podian cargar.
   ========================================================================== */
export function BenefitFormSheet({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: Benefit | null;
}) {
  const notify = useToast();
  const create = useCreateBenefit();
  const update = useUpdateBenefit();

  const empty = {
    name: '',
    partner: '',
    summary: '',
    description: '',
    terms: '',
    category: benefitCategories[0] as string,
    logoImageKey: '',
    code: '',
    validUntil: '',
    active: true,
  };

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      editing
        ? {
            name: editing.name,
            partner: editing.partner,
            summary: editing.summary,
            description: editing.description,
            terms: editing.terms ?? '',
            category: editing.category,
            logoImageKey: editing.logoImageKey ?? '',
            code: editing.code ?? '',
            validUntil: toDateInput(editing.validUntil),
            active: editing.active,
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
    if (form.name.trim().length < 2) nextErrors.name = 'Escribe el nombre del beneficio.';
    if (form.partner.trim().length < 2) nextErrors.partner = 'Indica quién otorga el beneficio.';
    if (form.summary.trim().length < 10) nextErrors.summary = 'Resume el beneficio en una línea.';
    if (form.description.trim().length < 30)
      nextErrors.description = 'Explica de qué se trata el beneficio.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      name: form.name.trim(),
      partner: form.partner.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      terms: form.terms.trim() || undefined,
      category: form.category,
      logoImageKey: form.logoImageKey || undefined,
      code: form.code.trim() || undefined,
      validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
      active: form.active,
    };

    const onSuccess = () => {
      notify(editing ? 'Beneficio actualizado.' : 'Beneficio publicado.');
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
      title={editing ? 'Editar beneficio' : 'Nuevo beneficio'}
      description="Queda disponible de inmediato para toda la comunidad."
      footer={
        <Button
          size="lg"
          onClick={handleSubmit}
          loading={create.isPending || update.isPending}
          className="w-full"
        >
          {editing ? 'Guardar cambios' : 'Publicar beneficio'}
        </Button>
      }
    >
      <div className="space-y-4">
        <TextField
          label="Nombre del beneficio"
          required
          error={errors.name}
          value={form.name}
          onChange={(event) => set('name', event.target.value)}
          placeholder="2x1 en combos"
          maxLength={80}
        />

        <TextField
          label="Comercio o institución"
          required
          error={errors.partner}
          value={form.partner}
          onChange={(event) => set('partner', event.target.value)}
          placeholder="Nombre del local en convenio"
          maxLength={80}
        />

        <TextField
          label="Resumen"
          required
          error={errors.summary}
          value={form.summary}
          onChange={(event) => set('summary', event.target.value)}
          hint="Una línea. Es lo que se lee en el listado."
          maxLength={120}
        />

        <TextField
          label="De qué se trata"
          required
          multiline
          rows={5}
          error={errors.description}
          value={form.description}
          onChange={(event) => set('description', event.target.value)}
          hint="Explicación completa del convenio. Separa los párrafos con un salto de línea."
        />

        <TextField
          label="Condiciones de uso (opcional)"
          multiline
          rows={3}
          value={form.terms}
          onChange={(event) => set('terms', event.target.value)}
          hint="Topes, restricciones, si se acumula con otras promociones."
        />

        <SelectField
          label="Categoría"
          required
          value={form.category}
          onChange={(event) => set('category', event.target.value)}
          options={benefitCategories.map((name) => ({ value: name, label: name }))}
        />

        <TextField
          label="Código de canje (opcional)"
          value={form.code}
          onChange={(event) => set('code', event.target.value)}
          placeholder="CAA2027-COMBO-2X1"
          hint="Lo que el estudiante muestra o dicta en caja. Tiene que ser el mismo que se acordó con el local. Si el convenio no usa código, déjalo vacío."
        />

        <TextField
          label="Vigente hasta (opcional)"
          type="date"
          value={form.validUntil}
          onChange={(event) => set('validUntil', event.target.value)}
          hint="Al vencer, el beneficio deja de poder canjearse pero se mantiene en el listado."
        />

        <ImageKeyField
          value={form.logoImageKey}
          onChange={(value) => set('logoImageKey', value)}
          prefix="benefit."
        />

        <Field label="Disponibilidad">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-field border border-line p-3">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => set('active', event.target.checked)}
              className="h-4 w-4 accent-[var(--color-brand-500)]"
            />
            <span className="text-[13.5px] text-ink-2">
              El beneficio se puede canjear ahora mismo.
            </span>
          </label>
        </Field>
      </div>
    </Sheet>
  );
}
