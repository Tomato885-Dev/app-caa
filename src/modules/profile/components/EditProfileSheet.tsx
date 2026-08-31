import { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { appConfig } from '@/config/app.config';
import { useAuth } from '@/core/auth/AuthContext';
import type { User } from '@/core/types';
import { Button, Field, SelectField, Sheet, TextField, useToast } from '@/ui';

/** Edición del perfil básico (§6.8). El correo institucional no es editable. */
export function EditProfileSheet({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: User;
}) {
  const { updateProfile } = useAuth();
  const notify = useToast();
  const [name, setName] = useState(user.name);
  const [grade, setGrade] = useState(user.grade);
  const [bio, setBio] = useState(user.bio ?? '');
  const [phone, setPhone] = useState(user.phone ?? '');
  const [listed, setListed] = useState(!user.hideFromDirectory);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (name.trim().length < 3) return;
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        grade,
        bio: bio.trim(),
        phone: phone.trim() || undefined,
        hideFromDirectory: !listed,
      });
      notify('Perfil actualizado.');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Editar perfil"
      footer={
        <Button size="lg" onClick={handleSave} loading={saving} className="w-full">
          Guardar cambios
        </Button>
      }
    >
      <div className="space-y-4">
        <TextField
          label="Nombre"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          hint="Debe corresponder a tu nombre real, según las normas de la plataforma."
        />

        <SelectField
          label="Curso"
          required
          value={grade}
          onChange={(event) => setGrade(event.target.value)}
          options={appConfig.grades.map((option) => ({ value: option, label: option }))}
        />

        <TextField
          label="Correo institucional"
          value={user.email}
          disabled
          hint="El correo identifica tu cuenta y no puede modificarse."
        />

        <TextField
          label="Teléfono (opcional)"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+56 9 1234 5678"
          hint="Solo se muestra en la base de contactos, y únicamente si eliges aparecer en ella."
        />

        {/* Control de privacidad: cada persona decide si figura en el buscador. */}
        <Field label="Base de contactos">
          <label className="flex cursor-pointer items-start gap-2.5 rounded-field border border-line p-3">
            <input
              type="checkbox"
              checked={listed}
              onChange={(event) => setListed(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--color-brand-500)]"
            />
            <span className="text-[13.5px] leading-relaxed text-ink-2">
              Quiero aparecer en el buscador de contactos de la comunidad.
              {listed ? null : (
                <span className="mt-1 block text-[12.5px] font-semibold text-ink">
                  Con esta opción desactivada nadie podrá encontrarte ahí.
                </span>
              )}
            </span>
          </label>
        </Field>

        <TextField
          label="Presentación (opcional)"
          multiline
          rows={3}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Cuenta en qué participas dentro de la comunidad."
          maxLength={200}
        />

        {/* Fotografía opcional (§6.8): se gestiona desde el manifiesto de imágenes. */}
        <div className="flex gap-3 rounded-field border border-dashed border-line-strong p-3.5">
          <ImagePlus size={18} className="mt-0.5 shrink-0 text-ink-3" />
          <p className="text-[12.5px] leading-relaxed text-ink-2">
            <span className="font-semibold text-ink">Fotografía de perfil.</span> Es opcional. Se
            habilitará junto con la carga de imágenes; mientras tanto se muestran tus iniciales.
          </p>
        </div>
      </div>
    </Sheet>
  );
}
