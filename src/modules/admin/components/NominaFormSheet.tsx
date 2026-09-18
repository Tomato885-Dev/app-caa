import { useEffect, useState } from 'react';
import { appConfig } from '@/config/app.config';
import { db, supabase } from '@/core/data';
import { useDataMutation } from '@/core/hooks/useData';
import { Button, Sheet, TextField, useToast } from '@/ui';

/* ============================================================================
   AGREGAR UNA PERSONA A LA NÓMINA
   ----------------------------------------------------------------------------
   La nómina la entregó Secretaría con los alumnos, pero hacen falta más
   correos: profesores, dirección, cualquier autoridad que tenga que entrar.
   Antes eso significaba escribir SQL a mano en Supabase cada vez.

   NO LE CREA LA CUENTA
   Le da permiso para crearla. Después esa persona entra, toca "Activar mi
   cuenta", recibe su código y elige su contraseña, igual que todos. Se explica
   en pantalla porque es la duda que aparece siempre.

   El "curso" en una autoridad no es un curso: es lo que se lee bajo su nombre
   en Contactos. "Profesor de Historia" sirve igual que "III Medio B".

   Necesita `supabase/11-agregar-a-la-nomina.sql` ejecutado.
   ========================================================================== */

const DOMINIO = appConfig.auth.allowedEmailDomains[0] ?? 'verbo.cl';

export function NominaFormSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const notify = useToast();
  const [correo, setCorreo] = useState('');
  const [nombre, setNombre] = useState('');
  const [curso, setCurso] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setCorreo('');
    setNombre('');
    setCurso('');
    setErrores({});
  }, [open]);

  const agregar = useDataMutation(
    async (datos: { correo: string; nombre: string; curso: string }) => {
      if (supabase) {
        const { data, error } = await supabase.rpc('agregar_a_la_nomina', {
          p_correo: datos.correo,
          p_nombre: datos.nombre,
          p_curso: datos.curso,
        });
        if (error) throw new Error(error.message);
        return data as string;
      }

      /* Sin servidor —el modo de demostración— no hay nómina: se crea la
         cuenta directamente para poder probar la pantalla. */
      await db.users.create({
        name: datos.nombre,
        email: datos.correo,
        grade: datos.curso,
        role: 'student',
        active: true,
      });
      return 'agregada';
    },
    ['users'],
  );

  const enviar = () => {
    const limpio = {
      correo: correo.trim().toLowerCase(),
      nombre: nombre.trim().replace(/\s+/g, ' '),
      curso: curso.trim().replace(/\s+/g, ' '),
    };

    const nuevos: Record<string, string> = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(limpio.correo)) {
      nuevos.correo = 'Escribe el correo completo.';
    } else if (limpio.correo.split('@')[1] !== DOMINIO) {
      nuevos.correo = `Tiene que ser un correo @${DOMINIO}.`;
    }
    if (!limpio.nombre) nuevos.nombre = 'Escribe el nombre completo.';
    if (!limpio.curso) nuevos.curso = 'Escribe el curso o el cargo.';

    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    agregar.mutate(limpio, {
      onSuccess: (resultado) => {
        notify(
          resultado === 'actualizada'
            ? `${limpio.nombre} ya estaba en la nómina: se actualizaron sus datos.`
            : `${limpio.nombre} ya puede activar su cuenta.`,
        );
        onClose();
      },
      onError: (fallo) =>
        setErrores({
          correo: /agregar_a_la_nomina/.test(fallo.message)
            ? 'Falta ejecutar supabase/11-agregar-a-la-nomina.sql en Supabase.'
            : fallo.message,
        }),
    });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Agregar a la nómina"
      description="Para profesores, dirección o cualquier persona del colegio que tenga que entrar."
      footer={
        <Button size="lg" onClick={enviar} loading={agregar.isPending} className="w-full">
          Agregar
        </Button>
      }
    >
      <div className="space-y-4">
        <TextField
          label="Correo del colegio"
          type="email"
          value={correo}
          onChange={(event) => setCorreo(event.target.value)}
          error={errores.correo}
          placeholder={`nombre.apellido@${DOMINIO}`}
          hint={`Solo correos @${DOMINIO}: son los únicos que pueden entrar.`}
          autoComplete="off"
          autoCapitalize="none"
        />
        <TextField
          label="Nombre completo"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          error={errores.nombre}
          hint="Como en las listas del colegio: apellidos primero y después los nombres."
          autoCapitalize="words"
          autoComplete="off"
        />
        <TextField
          label="Curso o cargo"
          value={curso}
          onChange={(event) => setCurso(event.target.value)}
          error={errores.curso}
          placeholder="Profesor de Historia"
          hint="Es lo que se lee bajo su nombre en Contactos."
          autoCapitalize="sentences"
          autoComplete="off"
        />

        <div className="rounded-field border border-line bg-surface-2 px-3.5 py-3">
          <p className="text-[12.5px] font-semibold text-ink">Esto no le crea la cuenta.</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">
            Le da permiso para crearla. Después esta persona entra a la app, toca{' '}
            <span className="font-semibold text-ink">Activar mi cuenta</span>, recibe su código por
            correo y elige su contraseña. Hasta que lo haga, no aparece en esta lista.
          </p>
        </div>
      </div>
    </Sheet>
  );
}
