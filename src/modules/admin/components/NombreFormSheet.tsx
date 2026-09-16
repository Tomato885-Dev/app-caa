import { useEffect, useState } from 'react';
import { supabase, db } from '@/core/data';
import { useDataMutation } from '@/core/hooks/useData';
import type { ID, User } from '@/core/types';
import { Button, Sheet, TextField, useToast } from '@/ui';

/* ============================================================================
   CORREGIR UN NOMBRE MAL ESCRITO
   ----------------------------------------------------------------------------
   Los nombres llegan de la nómina de Secretaría, y a veces llegan mal: un
   apellido que no es, una tilde que falta. Como la base de contactos busca
   por nombre, a esa persona no se la encuentra.

   Con servidor se corrige con la función `corregir_nombre`, que cambia a la
   vez el perfil y la nómina. Si solo se cambiara el perfil, el error volvería
   el día que esa persona se registre de nuevo.

   Se mantiene el orden de la lista del colegio, apellidos primero, para que
   el buscador siga coincidiendo con las listas de los profesores.
   ========================================================================== */

export function limpiarNombre(valor: string): string {
  return valor.trim().replace(/\s+/g, ' ');
}

export function errorDelNombre(valor: string): string {
  const limpio = limpiarNombre(valor);
  if (!limpio) return 'Escribe el nombre.';
  return '';
}

export function NombreFormSheet({ user, onClose }: { user: User | null; onClose: () => void }) {
  const notify = useToast();
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setNombre(user.name);
    setError('');
  }, [user]);

  const corregir = useDataMutation(
    async ({ id, name }: { id: ID; name: string }) => {
      if (supabase) {
        const { error: fallo } = await supabase.rpc('corregir_nombre', {
          p_perfil: id,
          p_nombre: name,
        });
        if (fallo) throw new Error(fallo.message);
        return;
      }
      await db.users.update(id, { name });
    },
    ['users'],
  );

  const guardar = () => {
    if (!user) return;
    const problema = errorDelNombre(nombre);
    if (problema) {
      setError(problema);
      return;
    }
    const limpio = limpiarNombre(nombre);
    if (limpio === user.name) {
      onClose();
      return;
    }
    corregir.mutate(
      { id: user.id, name: limpio },
      {
        onSuccess: () => {
          notify(`Nombre corregido: ${limpio}.`);
          onClose();
        },
        onError: (fallo) =>
          setError(
            /corregir_nombre/.test(fallo.message)
              ? 'Falta ejecutar supabase/10-corregir-nombres.sql en Supabase.'
              : fallo.message,
          ),
      },
    );
  };

  return (
    <Sheet
      open={Boolean(user)}
      onClose={onClose}
      title="Corregir nombre"
      description={user ? `${user.grade} · ${user.email}` : undefined}
      footer={
        <Button size="lg" onClick={guardar} loading={corregir.isPending} className="w-full">
          Guardar nombre
        </Button>
      }
    >
      <div className="space-y-3">
        <TextField
          label="Nombre completo"
          value={nombre}
          onChange={(event) => {
            setNombre(event.target.value);
            setError('');
          }}
          error={error}
          hint="Como en las listas del colegio: apellidos primero y después los nombres."
          autoCapitalize="words"
          autoComplete="off"
        />
        <p className="text-[12.5px] leading-relaxed text-ink-3">
          Se corrige en la base de contactos y en la nómina, así que también queda bien si esta
          persona vuelve a registrarse.
        </p>
      </div>
    </Sheet>
  );
}
