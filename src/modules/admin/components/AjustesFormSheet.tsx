import { useEffect, useState } from 'react';
import { usingServer } from '@/core/data';
import { Button, Sheet, useToast } from '@/ui';
import { useAjustes, useGuardarAjustes, type Interruptores } from '../ajustes';

/* ============================================================================
   INTERRUPTORES DE LA APP
   ----------------------------------------------------------------------------
   Lo que el equipo enciende y apaga sin esperar una versión nueva en la
   tienda. Cada uno se explica en una línea: qué hace y qué se ve.
   ========================================================================== */

export function AjustesFormSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const notify = useToast();
  const { valores, documento } = useAjustes();
  const guardar = useGuardarAjustes();
  const [form, setForm] = useState<Interruptores>(valores);

  useEffect(() => {
    if (open) setForm(valores);
    // Solo al abrir: mientras se toca, no se pisa lo que va eligiendo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const enviar = () =>
    guardar.mutate(
      { id: documento?.id, valores: form },
      {
        onSuccess: () => {
          notify('Ajustes guardados.');
          onClose();
        },
      },
    );

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Ajustes de la app"
      description="Cambian para todos al tiro, sin actualizar la app en la tienda."
      footer={
        <Button size="lg" onClick={enviar} loading={guardar.isPending} className="w-full">
          Guardar
        </Button>
      }
    >
      <div className="space-y-3">
        <Interruptor
          titulo="Mostrar cuántos están conectados"
          ayuda="Arriba, al lado del Instagram, aparece un punto verde con el número de personas que tienen la app abierta ahora. No se muestra quiénes son: solo cuántos."
          valor={form.mostrarConectados}
          onChange={(mostrarConectados) => setForm((actual) => ({ ...actual, mostrarConectados }))}
        />

        {!usingServer ? (
          <p className="rounded-field border border-line bg-surface-2 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-2">
            En la versión de demostración no hay servidor, así que el número de conectados no
            aparece aunque se encienda.
          </p>
        ) : null}
      </div>
    </Sheet>
  );
}

function Interruptor({
  titulo,
  ayuda,
  valor,
  onChange,
}: {
  titulo: string;
  ayuda: string;
  valor: boolean;
  onChange: (valor: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-field border border-line p-3.5">
      <input
        type="checkbox"
        checked={valor}
        onChange={(evento) => onChange(evento.target.checked)}
        className="mt-0.5 size-[18px] shrink-0 accent-brand-500"
      />
      <span className="min-w-0">
        <span className="block text-[13.5px] font-bold text-ink">{titulo}</span>
        <span className="mt-1 block text-[12.5px] leading-relaxed text-ink-2">{ayuda}</span>
      </span>
    </label>
  );
}
