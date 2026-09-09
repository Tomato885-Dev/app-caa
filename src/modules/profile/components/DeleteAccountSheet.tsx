import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthContext';
import type { User } from '@/core/types';
import { Button, Sheet, TextField, useToast } from '@/ui';

/* ============================================================================
   BORRAR LA PROPIA CUENTA
   ----------------------------------------------------------------------------
   Existe porque Apple exige que quien puede crearse una cuenta pueda borrarla
   desde adentro de la aplicación, y Google pide lo mismo en su formulario de
   seguridad de los datos. Sin esto la aplicación no entra a ninguna tienda.

   PERO NO ES UN TRÁMITE
   La pantalla dice, antes de cualquier botón, QUÉ se borra y QUÉ NO. Que el
   nombre siga en la nómina del colegio, o que un comunicado publicado siga
   ahí, no puede ser una sorpresa que alguien descubre después.

   DOS CANDADOS, Y CADA UNO ATAJA UNA COSA DISTINTA
     · La contraseña ataja a quien encontró el teléfono desbloqueado.
     · Escribir BORRAR ataja al dueño distraído. Es lento a propósito: si
       bastara con pulsar dos veces, se borraría alguna cuenta sin querer.
   ========================================================================== */

const PALABRA = 'BORRAR';

export function DeleteAccountSheet({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: User;
}) {
  const { deleteAccount } = useAuth();
  const notify = useToast();

  const [password, setPassword] = useState('');
  const [palabra, setPalabra] = useState('');
  const [error, setError] = useState('');
  const [borrando, setBorrando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPassword('');
    setPalabra('');
    setError('');
  }, [open]);

  const listo = password.length > 0 && palabra.trim().toUpperCase() === PALABRA;

  const handleDelete = async () => {
    if (!listo) return;
    setError('');
    setBorrando(true);
    try {
      await deleteAccount(password);
      /* No se cierra la hoja ni se navega: `deleteAccount` cierra la sesión, y
         la aplicación entera vuelve sola a la pantalla de acceso. */
      notify('Tu cuenta fue eliminada.', 'info');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo borrar la cuenta.');
      setBorrando(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      size="lg"
      title="Eliminar mi cuenta"
      description="Esta acción no se puede deshacer."
      footer={
        <Button
          size="lg"
          variant="danger"
          icon={Trash2}
          onClick={() => void handleDelete()}
          loading={borrando}
          disabled={!listo}
          className="w-full"
        >
          Eliminar mi cuenta definitivamente
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="rounded-field border border-line bg-surface-2 p-3.5">
          <p className="text-[13px] font-bold text-ink">Se borra</p>
          <ul className="mt-1.5 space-y-1 text-[13px] leading-relaxed text-ink-2">
            <li>· Tu acceso: no vas a poder entrar con esta contraseña.</li>
            <li>· Tu perfil y tu teléfono, si lo habías puesto.</li>
            <li>· Tu presencia en la base de contactos.</li>
            <li>· Las notificaciones que tuvieras activadas.</li>
          </ul>

          <p className="mt-3.5 text-[13px] font-bold text-ink">No se borra</p>
          <ul className="mt-1.5 space-y-1 text-[13px] leading-relaxed text-ink-2">
            <li>
              · Tu nombre y tu curso en la nómina del colegio: esa lista es del
              establecimiento, no del Centro de Alumnos.
            </li>
            <li>
              · Lo que hayas publicado, si tenías permisos. Si quieres que también se
              retire, pídelo al Centro de Alumnos.
            </li>
          </ul>
        </div>

        <p className="text-[13px] leading-relaxed text-ink-2">
          Como sigues en la nómina, más adelante puedes volver a activar tu cuenta desde{' '}
          <span className="font-semibold text-ink">Activar mi cuenta</span>, con este mismo
          correo. Empezarías de cero, sin lo que tenías antes.
        </p>

        <TextField
          label="Tu contraseña"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint={`Para confirmar que eres tú, ${user.email}.`}
        />

        <TextField
          label={`Escribe ${PALABRA} para confirmar`}
          required
          value={palabra}
          autoCapitalize="characters"
          onChange={(event) => setPalabra(event.target.value)}
          placeholder={PALABRA}
        />

        {error ? (
          <p role="alert" className="text-[12.5px] font-medium text-danger-500">
            {error}
          </p>
        ) : null}
      </div>
    </Sheet>
  );
}
