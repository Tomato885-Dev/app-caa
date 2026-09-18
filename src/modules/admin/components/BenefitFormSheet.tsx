import { useEffect, useRef, useState } from 'react';
import { Globe, KeyRound, ListChecks, QrCode, Trash2, Upload, type LucideIcon } from 'lucide-react';
import { benefitCategories } from '@/content/taxonomies';
import { usingServer } from '@/core/data';
import { subirFoto } from '@/core/images/subir';
import type { Benefit, RedeemMethod } from '@/core/types';
import { useCreateBenefit, useUpdateBenefit } from '@/modules/benefits/api';
import {
  FORMAS_DE_CANJE,
  aCampoDeFecha,
  erroresDelCanje,
  finDelDia,
  limpiarCanje,
} from '@/modules/benefits/canje';
import { AppImage, Button, Field, SelectField, Sheet, TextField, cn, useToast } from '@/ui';
import { ImageKeyField } from './ImageKeyField';

/* ============================================================================
   CARGA Y EDICION DE LOS CONVENIOS
   ----------------------------------------------------------------------------
   Cada convenio dice COMO se canjea, con la forma que definio el local: un
   codigo, un QR, una tienda en linea o unos pasos. Ya no existe el "codigo de
   canje" que inventaba la app: al guardar un convenio antiguo, se borra.

   Lo que se pide depende de la forma elegida, y solo se guarda eso: si se
   cambia de QR a codigo, la imagen del QR no queda dando vueltas.
   ========================================================================== */

const ICONO: Record<RedeemMethod, LucideIcon> = {
  codigo: KeyRound,
  qr: QrCode,
  enlace: Globe,
  indicaciones: ListChecks,
};

const VACIO = {
  name: '',
  partner: '',
  summary: '',
  description: '',
  terms: '',
  category: benefitCategories[0] as string,
  logoImageKey: '',
  logoFondoBlanco: true,
  method: '' as RedeemMethod | '',
  redeemCode: '',
  qrImage: '',
  qrValue: '',
  url: '',
  steps: '',
  validUntil: '',
  active: true,
};

type FormState = typeof VACIO;

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

  const [form, setForm] = useState<FormState>(VACIO);
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
            /* Los convenios cargados antes de que existiera la opcion no la
               traen: se asume el fondo blanco, que es lo que deja la lista
               pareja. */
            logoFondoBlanco: editing.logoFondoBlanco !== false,
            method: editing.redeem?.method ?? '',
            redeemCode: editing.redeem?.code ?? '',
            qrImage: editing.redeem?.qrImage ?? '',
            qrValue: editing.redeem?.qrValue ?? '',
            url: editing.redeem?.url ?? '',
            steps: editing.redeem?.steps ?? '',
            validUntil: aCampoDeFecha(editing.validUntil),
            active: editing.active,
          }
        : VACIO,
    );
  }, [open, editing]);

  const set = (key: keyof FormState | 'qr', value: string | boolean) => {
    if (key !== 'qr') setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Ponle un nombre al beneficio.';
    if (!form.partner.trim()) nextErrors.partner = 'Indica quién otorga el beneficio.';

    const canje = form.method
      ? limpiarCanje({
          method: form.method,
          code: form.redeemCode,
          qrImage: form.qrImage,
          qrValue: form.qrValue,
          url: form.url,
          steps: form.steps,
        })
      : null;

    if (!canje) {
      nextErrors.method = 'Elige cómo se canjea este beneficio.';
    } else {
      const delCanje = erroresDelCanje(canje);
      if (delCanje.code) nextErrors.redeemCode = delCanje.code;
      if (delCanje.qr) nextErrors.qr = delCanje.qr;
      if (delCanje.url) nextErrors.url = delCanje.url;
      if (delCanje.steps) nextErrors.steps = delCanje.steps;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !canje) return;

    const payload = {
      name: form.name.trim(),
      partner: form.partner.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      terms: form.terms.trim() || undefined,
      category: form.category,
      logoImageKey: form.logoImageKey || undefined,
      logoFondoBlanco: form.logoFondoBlanco,
      redeem: canje,
      // El código inventado de antes se borra al guardar.
      code: undefined,
      validUntil: form.validUntil ? finDelDia(form.validUntil) : undefined,
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
        />

        <TextField
          label="Comercio o institución"
          required
          error={errors.partner}
          value={form.partner}
          onChange={(event) => set('partner', event.target.value)}
          placeholder="Nombre del local en convenio"
        />

        <TextField
          label="Resumen"
          error={errors.summary}
          value={form.summary}
          onChange={(event) => set('summary', event.target.value)}
          hint="Es lo que se lee en el listado."
        />

        <TextField
          label="De qué se trata"
          multiline
          rows={5}
          error={errors.description}
          value={form.description}
          onChange={(event) => set('description', event.target.value)}
          hint="Explicación completa del convenio. Separa los párrafos con un salto de línea."
        />

        <FormaDeCanje
          form={form}
          errors={errors}
          set={set}
          legacy={Boolean(editing?.code && !editing.redeem)}
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
          label="Vigente hasta (opcional)"
          type="date"
          value={form.validUntil}
          onChange={(event) => set('validUntil', event.target.value)}
          hint="Vale hasta el final de ese día. Faltando dos semanas, los alumnos ven cuántos días quedan; al vencer, deja de poder canjearse."
        />

        <ImageKeyField
          value={form.logoImageKey}
          onChange={(value) => set('logoImageKey', value)}
          prefix="benefit."
        />

        {/* La pregunta aparece sola al haber logo: los locales lo mandan como
            les llega, y sin esto la lista queda despareja. */}
        {form.logoImageKey ? (
          <FondoDelLogo
            imageKey={form.logoImageKey}
            valor={form.logoFondoBlanco}
            onChange={(valor) => set('logoFondoBlanco', valor)}
          />
        ) : null}

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

/* ----------------------------------------------------------------------------
   COMO SE CANJEA
   Primero se elige la forma, y recien ahi aparecen sus campos. Para el QR
   manda la imagen que mando el local; si lo mando como enlace o texto, se
   pega y la app lo dibuja.
   -------------------------------------------------------------------------- */

function FormaDeCanje({
  form,
  errors,
  set,
  legacy,
}: {
  form: FormState;
  errors: Record<string, string>;
  set: (key: keyof FormState | 'qr', value: string | boolean) => void;
  legacy: boolean;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState('');

  const subirQr = async (archivo: File | undefined) => {
    if (!archivo) return;
    setErrorSubida('');
    setSubiendo(true);
    try {
      const foto = await subirFoto(archivo);
      set('qrImage', foto.url);
      set('qr', '');
    } catch (caught) {
      setErrorSubida(caught instanceof Error ? caught.message : 'No se pudo subir la imagen.');
    } finally {
      setSubiendo(false);
    }
  };

  const soloPasos = form.method === 'indicaciones';

  return (
    <Field label="Cómo se canjea" required error={errors.method}>
      <div className="space-y-3.5">
        {legacy ? (
          <p className="rounded-field border border-line bg-surface-2 px-3 py-2.5 text-[12.5px] leading-relaxed text-ink-2">
            Este convenio tenía un código inventado por la app, que ya no se muestra. Elige la forma
            que usa el local de verdad.
          </p>
        ) : null}

        <div role="radiogroup" aria-label="Forma de canje" className="grid grid-cols-2 gap-2">
          {FORMAS_DE_CANJE.map((opcion) => {
            const Icono = ICONO[opcion.value];
            const elegida = form.method === opcion.value;
            return (
              <button
                key={opcion.value}
                type="button"
                role="radio"
                aria-checked={elegida}
                onClick={() => set('method', opcion.value)}
                className={cn(
                  'rounded-field border p-3 text-left transition active:scale-[0.98]',
                  elegida
                    ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500 dark:bg-brand-950'
                    : 'border-line hover:bg-surface-2',
                )}
              >
                <Icono
                  size={18}
                  className={elegida ? 'text-brand-600 dark:text-brand-300' : 'text-ink-3'}
                />
                <p className="mt-1.5 text-[13.5px] font-semibold text-ink">{opcion.label}</p>
                <p className="mt-0.5 text-[11.5px] leading-snug text-ink-3">{opcion.description}</p>
              </button>
            );
          })}
        </div>

        {form.method === 'codigo' ? (
          <TextField
            label="Código"
            required
            value={form.redeemCode}
            error={errors.redeemCode}
            onChange={(event) => set('redeemCode', event.target.value)}
            placeholder="VERBO15"
            hint="Exactamente el que te dio el local."
            autoCapitalize="characters"
            autoComplete="off"
          />
        ) : null}

        {form.method === 'qr' ? (
          <div className="space-y-3">
            {form.qrImage ? (
              <div className="flex items-center gap-3 rounded-field border border-line p-3">
                <img
                  src={form.qrImage}
                  alt="QR del convenio"
                  className="size-20 shrink-0 rounded-lg bg-white object-contain p-1"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-ink">QR subido</p>
                  <p className="text-[12px] text-ink-3">Los alumnos lo verán así, sobre blanco.</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => set('qrImage', '')}
                  aria-label="Quitar el QR"
                />
              </div>
            ) : usingServer ? (
              <div className="rounded-field border-2 border-dashed border-line bg-surface-2 p-4 text-center">
                <QrCode size={20} className="mx-auto text-ink-3" />
                <p className="mt-1.5 text-[12.5px] font-medium text-ink-2">
                  Sube la imagen del QR que te mandó el local
                </p>
                <p className="mt-0.5 text-[11.5px] text-ink-3">
                  Una captura sirve, si se ve el QR entero y nítido.
                </p>
                <input
                  ref={entrada}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    void subirQr(event.target.files?.[0]);
                    event.target.value = '';
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Upload}
                  loading={subiendo}
                  onClick={() => entrada.current?.click()}
                  className="mt-2.5"
                >
                  {subiendo ? 'Subiendo…' : 'Elegir imagen'}
                </Button>
                {errorSubida ? (
                  <p className="mt-2 text-[12px] font-medium text-danger-500">{errorSubida}</p>
                ) : null}
              </div>
            ) : null}

            {!form.qrImage ? (
              <TextField
                label={usingServer ? 'O pega lo que contiene el QR' : 'Contenido del QR'}
                value={form.qrValue}
                onChange={(event) => {
                  set('qrValue', event.target.value);
                  set('qr', '');
                }}
                placeholder="https://… o el texto que te dieron"
                hint="Si el local te lo mandó como enlace o texto, la app dibuja el QR."
                autoComplete="off"
              />
            ) : null}

            {errors.qr ? (
              <p className="text-[12.5px] font-medium text-danger-500">{errors.qr}</p>
            ) : null}
          </div>
        ) : null}

        {form.method === 'enlace' ? (
          <>
            <TextField
              label="Enlace de la tienda"
              required
              type="url"
              inputMode="url"
              value={form.url}
              error={errors.url}
              onChange={(event) => set('url', event.target.value)}
              placeholder="https://tienda.cl/verbo"
              autoComplete="off"
            />
            <TextField
              label="Cupón (opcional)"
              value={form.redeemCode}
              onChange={(event) => set('redeemCode', event.target.value)}
              placeholder="VERBO15"
              hint="El código de descuento que se pega al pagar, si lo hay."
              autoCapitalize="characters"
              autoComplete="off"
            />
          </>
        ) : null}

        {form.method ? (
          <TextField
            label={soloPasos ? 'Pasos para canjearlo' : 'Indicaciones extra (opcional)'}
            required={soloPasos}
            multiline
            rows={soloPasos ? 4 : 3}
            value={form.steps}
            error={errors.steps}
            onChange={(event) => set('steps', event.target.value)}
            placeholder={
              soloPasos
                ? 'Muestra tu credencial del colegio en caja.\nPide el descuento antes de pagar.'
                : 'Pídelo antes de pagar.'
            }
            hint="Un paso por línea. La app los numera sola."
          />
        ) : null}
      </div>
    </Field>
  );
}

/* ============================================================================
   ¿EL LOGO VA SOBRE BLANCO?
   ----------------------------------------------------------------------------
   Se pregunta siempre que haya logo, y se ve el resultado antes de guardar.
   El motivo es que los locales mandan el logo como les llega: unos con el
   fondo blanco pegado a la imagen y otros en PNG transparente. Puestos uno al
   lado del otro parecían de dos apps distintas —Açaí junto a Starbucks era el
   caso—, y el fondo blanco los deja parejos.

   Se deja apagar porque hay logos claros o blancos que sobre blanco
   desaparecen.
   ========================================================================== */

function FondoDelLogo({
  imageKey,
  valor,
  onChange,
}: {
  imageKey: string;
  valor: boolean;
  onChange: (valor: boolean) => void;
}) {
  const opciones = [
    { blanco: true, titulo: 'Con fondo blanco', ayuda: 'Lo normal. Todos quedan parejos.' },
    { blanco: false, titulo: 'Tal como viene', ayuda: 'Para un logo claro o ya con fondo.' },
  ];

  return (
    <Field label="¿Cómo se ve el logo?" hint="Toca el que se vea mejor. Así queda en la app.">
      <div role="radiogroup" aria-label="Fondo del logo" className="grid grid-cols-2 gap-2.5">
        {opciones.map((opcion) => {
          const elegida = valor === opcion.blanco;
          return (
            <button
              key={String(opcion.blanco)}
              type="button"
              role="radio"
              aria-checked={elegida}
              onClick={() => onChange(opcion.blanco)}
              className={cn(
                'rounded-field border p-3 text-left transition',
                elegida
                  ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500 dark:bg-brand-950'
                  : 'border-line hover:border-line-strong',
              )}
            >
              <div
                className={cn(
                  'mx-auto mb-2.5 w-20 overflow-hidden rounded-2xl',
                  opcion.blanco
                    ? 'bg-white p-2 ring-1 ring-black/10'
                    : 'bg-surface-2 p-1.5 ring-1 ring-line',
                )}
              >
                <AppImage imageKey={imageKey} ratio="1/1" compact fit="contain" rounded={false} />
              </div>
              <p className="text-[12.5px] font-bold text-ink">{opcion.titulo}</p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-3">{opcion.ayuda}</p>
            </button>
          );
        })}
      </div>
    </Field>
  );
}
