import { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { appConfig } from '@/config/app.config';
import { marketplaceCategories } from '@/content/taxonomies';
import { useAuth } from '@/core/auth/AuthContext';
import { initialStatusFor, submissionMessage } from '@/core/moderation/visibility';
import { Button, Field, Select, Sheet, TextField, useToast } from '@/ui';
import { useCreateListing } from '../api';

/** Publicación de un emprendimiento o servicio estudiantil (§6.7). */
export function NewListingSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const notify = useToast();
  const createListing = useCreateListing();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: marketplaceCategories[0] as string,
    type: 'producto' as 'producto' | 'servicio',
    priceLabel: '',
    contactUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const handleSubmit = () => {
    if (!user) return;

    const nextErrors: Record<string, string> = {};
    if (form.title.trim().length < 5) nextErrors.title = 'Escribe un título más descriptivo.';
    if (form.description.trim().length < 20)
      nextErrors.description = 'Explica con más detalle qué ofreces.';
    if (!form.priceLabel.trim())
      nextErrors.priceLabel = 'Indica un precio referencial o escribe "A convenir".';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Sin contacto propio se usa el correo institucional de la cuenta.
    const contactUrl = form.contactUrl.trim() || `mailto:${user.email}`;

    createListing.mutate(
      {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        type: form.type,
        priceLabel: form.priceLabel.trim(),
        contact: { label: 'Contactar', url: contactUrl },
        user,
      },
      {
        onSuccess: () => {
          notify(submissionMessage(initialStatusFor(user)));
          setForm({
            title: '',
            description: '',
            category: marketplaceCategories[0],
            type: 'producto',
            priceLabel: '',
            contactUrl: '',
          });
          onClose();
        },
      },
    );
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Publicar en el marketplace"
      description="La plataforma solo difunde. Los acuerdos y pagos se realizan fuera de la aplicación."
      footer={
        <Button size="lg" onClick={handleSubmit} loading={createListing.isPending} className="w-full">
          Enviar a revisión
        </Button>
      }
    >
      <div className="space-y-4">
        <Field label="Tipo de publicación" required>
          <Select value={form.type} onChange={(event) => set('type', event.target.value)}>
            <option value="producto">Producto</option>
            <option value="servicio">Servicio</option>
          </Select>
        </Field>

        <TextField
          label="Título"
          required
          error={errors.title}
          value={form.title}
          onChange={(event) => set('title', event.target.value)}
          placeholder="Ej: Clases particulares de biología"
          maxLength={80}
        />

        <Field label="Categoría" required>
          <Select value={form.category} onChange={(event) => set('category', event.target.value)}>
            {marketplaceCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Field>

        <TextField
          label="Descripción"
          required
          multiline
          rows={5}
          error={errors.description}
          value={form.description}
          onChange={(event) => set('description', event.target.value)}
          placeholder="Explica qué ofreces, plazos de entrega y cualquier detalle útil."
        />

        <TextField
          label="Precio referencial"
          required
          error={errors.priceLabel}
          value={form.priceLabel}
          onChange={(event) => set('priceLabel', event.target.value)}
          placeholder='Ej: "$3.000" o "A convenir"'
          hint="Referencial. La plataforma no procesa pagos ni transacciones."
        />

        <TextField
          label="Medio de contacto (opcional)"
          value={form.contactUrl}
          onChange={(event) => set('contactUrl', event.target.value)}
          placeholder={`mailto:${user?.email ?? `tu.correo@${appConfig.auth.allowedEmailDomains[0]}`}`}
          hint="Si lo dejas vacío se usará tu correo institucional."
        />

        {/* Las fotos se cargan por el manifiesto de contenido, no por subida directa. */}
        <div className="flex gap-3 rounded-field border border-dashed border-line-strong p-3.5">
          <ImagePlus size={18} className="mt-0.5 shrink-0 text-ink-3" />
          <p className="text-[12.5px] leading-relaxed text-ink-2">
            Las fotografías de la publicación las agrega el equipo de administración al aprobarla.
            Puedes enviarlas por el mismo medio de contacto que indiques.
          </p>
        </div>
      </div>
    </Sheet>
  );
}
