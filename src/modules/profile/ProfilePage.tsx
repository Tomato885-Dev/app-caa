import { useState } from 'react';
import {
  Check,
  KeyRound,
  LogOut,
  Phone,
  Moon,
  RotateCcw,
  Sun,
  SunMoon,
} from 'lucide-react';
import { appConfig } from '@/config/app.config';
import { useAuth } from '@/core/auth/AuthContext';
import { db } from '@/core/data';
import { ROLE_LABEL } from '@/core/types';
import { useTheme, type ThemePreference } from '@/app/theme/ThemeContext';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Page,
  SectionHeader,
  SegmentedTabs,
  useToast,
} from '@/ui';
import { ChangePasswordSheet } from './components/ChangePasswordSheet';

/* Perfil de usuario (§6.8): identidad de la cuenta, teléfono de contacto,
   apariencia y seguridad. El nombre, el curso y el correo los define la
   nómina del establecimiento y no se editan desde aquí. */

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const { preference, setPreference } = useTheme();
  const notify = useToast();
  const [passwordOpen, setPasswordOpen] = useState(false);


  if (!user) return null;

  /* Borra todo lo publicado desde la app y vuelve al contenido inicial. Con
     trabajo real cargado esto es destructivo, así que se confirma y se avisa
     dónde está el respaldo. */
  const handleReset = async () => {
    const confirmed = window.confirm(
      '¿Restaurar el contenido inicial?\n\n' +
        'Se borrará TODO lo que hayas publicado o editado desde la app en este navegador ' +
        'y no se puede deshacer.\n\n' +
        'Si no lo has exportado, cancela y usa antes "Exportar contenido" en Administración.',
    );
    if (!confirmed) return;

    await db.reset();
    notify('Contenido inicial restaurado. Recarga la página para verlo.', 'info');
  };

  return (
    <Page>
      {/* Identidad de la cuenta: nombre real y curso (§7). */}
      <Card className="mb-5">
        <div className="flex items-start gap-4">
          <Avatar name={user.name} avatarKey={user.avatarKey} size="xl" />

          <div className="min-w-0 flex-1 pt-1">
            <h1 className="truncate text-[20px] font-extrabold leading-tight text-ink">
              {user.name}
            </h1>
            <p className="mt-0.5 text-[13.5px] text-ink-2">{user.grade}</p>
            <p className="truncate text-[12.5px] text-ink-3">{user.email}</p>
            <Badge tone={user.role === 'student' ? 'neutral' : 'brand'} className="mt-2">
              {ROLE_LABEL[user.role]}
            </Badge>
          </div>
        </div>

        {user.bio ? (
          <p className="mt-4 text-[13.5px] leading-relaxed text-ink-2">{user.bio}</p>
        ) : null}
      </Card>

      {/* Teléfono de contacto */}
      <PhoneSection phone={user.phone} />

      {/* Preferencias */}
      <section className="mb-6">
        <SectionHeader title="Apariencia" />
        <SegmentedTabs
          value={preference}
          onChange={(value) => setPreference(value as ThemePreference)}
          options={[
            { value: 'light', label: 'Claro' },
            { value: 'dark', label: 'Oscuro' },
            { value: 'system', label: 'Automático' },
          ]}
        />
        <div className="mt-2 flex items-center gap-1.5 text-[12px] text-ink-3">
          {preference === 'light' ? <Sun size={13} /> : null}
          {preference === 'dark' ? <Moon size={13} /> : null}
          {preference === 'system' ? <SunMoon size={13} /> : null}
          <span>
            {preference === 'system'
              ? 'Sigue la configuración de tu dispositivo.'
              : 'Preferencia guardada en este dispositivo.'}
          </span>
        </div>
      </section>

      {/* Seguridad de la cuenta */}
      <section className="mb-6">
        <SectionHeader title="Seguridad" />
        <Card>
          <p className="text-[13px] leading-relaxed text-ink-2">
            Tu contraseña se guarda cifrada en este dispositivo. Si la olvidas, el Centro de
            Alumnos puede restablecerla desde el panel de cuentas.
          </p>
          <Button
            variant="secondary"
            size="sm"
            icon={KeyRound}
            onClick={() => setPasswordOpen(true)}
            className="mt-3 w-full"
          >
            Cambiar contraseña
          </Button>
        </Card>
      </section>

      {/* Acerca de */}
      <Card className="mb-4">
        <h2 className="text-[14.5px] font-bold text-ink">
          {appConfig.organization.fullName}
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
          {appConfig.organization.institution} · {appConfig.organization.term}
        </p>
        <p className="mt-3 text-[12.5px] leading-relaxed text-ink-3">
          Plataforma administrada en conjunto por el Centro de Alumnos y los equipos designados por
          la institución. El acceso está restringido a cuentas institucionales y toda publicación de
          estudiantes pasa por revisión previa.
        </p>
      </Card>

      <div className="space-y-2">
        <Button variant="secondary" icon={RotateCcw} onClick={handleReset} className="w-full">
          Restaurar contenido de ejemplo
        </Button>
        <Button variant="ghost" icon={LogOut} onClick={signOut} className="w-full">
          Cerrar sesión
        </Button>
      </div>

      <ChangePasswordSheet
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        user={user}
      />
    </Page>
  );
}

/* ----------------------------------------------------------------------------
   TELÉFONO DE CONTACTO
   Único dato del perfil que decide el propio estudiante. Es opcional, se puede
   borrar en cualquier momento, y el texto dice sin rodeos dónde va a aparecer:
   quien lo escribe tiene que saber que lo verá toda la comunidad.
   -------------------------------------------------------------------------- */

function PhoneSection({ phone }: { phone?: string }) {
  const { updateProfile } = useAuth();
  const notify = useToast();

  const [value, setValue] = useState(phone ?? '');
  const [saving, setSaving] = useState(false);

  const guardado = (phone ?? '').trim();
  const cambiado = value.trim() !== guardado;

  const handleSave = async () => {
    setSaving(true);
    try {
      const limpio = value.trim();
      await updateProfile({ phone: limpio || undefined });
      notify(limpio ? 'Teléfono guardado.' : 'Teléfono eliminado.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mb-6">
      <SectionHeader title="Teléfono" />
      <Card>
        <div className="flex items-center gap-2">
          <Phone size={17} className="shrink-0 text-ink-3" />
          <Input
            type="tel"
            inputMode="tel"
            aria-label="Tu teléfono de contacto"
            placeholder="+56 9 1234 5678"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="flex-1"
          />
        </div>

        <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-2">
          Es opcional. Si lo dejas, aparecerá junto a tu nombre en la{' '}
          <span className="font-semibold text-ink">base de contactos</span>, donde puede verlo
          cualquier persona de la comunidad. Puedes borrarlo cuando quieras.
        </p>

        <Button
          variant="secondary"
          size="sm"
          icon={Check}
          onClick={() => void handleSave()}
          loading={saving}
          disabled={!cambiado}
          className="mt-3 w-full"
        >
          {value.trim() ? 'Guardar teléfono' : guardado ? 'Quitar mi teléfono' : 'Guardar teléfono'}
        </Button>
      </Card>
    </section>
  );
}
