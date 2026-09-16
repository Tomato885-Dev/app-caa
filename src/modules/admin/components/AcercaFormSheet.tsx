import { useEffect, useState } from 'react';
import { ACERCA_POR_DEFECTO, useAcercaDe, useGuardarAcercaDe, type TextosAcercaDe } from '@/modules/profile/acerca';
import { Button, Sheet, TextField, useToast } from '@/ui';

/* ============================================================================
   EDITAR "ACERCA DE"
   ----------------------------------------------------------------------------
   Los cuatro textos del recuadro final de Mi perfil. Sin mínimos ni topes: el
   equipo escribe lo que quiera. Un campo vacío vuelve al texto de siempre.
   ========================================================================== */

export function AcercaFormSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const notify = useToast();
  const { textos, documento } = useAcercaDe();
  const guardar = useGuardarAcercaDe();
  const [form, setForm] = useState<TextosAcercaDe>(textos);

  useEffect(() => {
    if (open) setForm(textos);
    // Solo al abrir: mientras se escribe no se pisa lo que va tecleando.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const cambiar = (campo: keyof TextosAcercaDe, valor: string) =>
    setForm((actual) => ({ ...actual, [campo]: valor }));

  const enviar = () => {
    const limpio = Object.fromEntries(
      (Object.keys(ACERCA_POR_DEFECTO) as (keyof TextosAcercaDe)[]).map((campo) => [
        campo,
        form[campo].trim() || ACERCA_POR_DEFECTO[campo],
      ]),
    ) as TextosAcercaDe;

    guardar.mutate(
      { id: documento?.id, textos: limpio },
      {
        onSuccess: () => {
          notify('"Acerca de" actualizado.');
          onClose();
        },
      },
    );
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      size="lg"
      title='Editar "Acerca de"'
      description="Es el recuadro del final de Mi perfil. Los cambios se ven al tiro, sin actualizar la app."
      footer={
        <Button size="lg" onClick={enviar} loading={guardar.isPending} className="w-full">
          Guardar cambios
        </Button>
      }
    >
      <div className="space-y-4">
        <TextField label="Título" value={form.titulo} onChange={(e) => cambiar('titulo', e.target.value)} />
        <TextField
          label="Bajada"
          value={form.subtitulo}
          onChange={(e) => cambiar('subtitulo', e.target.value)}
          hint="Por ejemplo, el colegio y el periodo de la directiva."
        />
        <TextField
          label="Descripción"
          multiline
          rows={4}
          value={form.descripcion}
          onChange={(e) => cambiar('descripcion', e.target.value)}
        />
        <TextField
          label="Crédito del desarrollo"
          multiline
          rows={2}
          value={form.credito}
          onChange={(e) => cambiar('credito', e.target.value)}
          hint="Se muestra destacado, en grande."
        />
        <p className="rounded-field border border-line bg-surface-2 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-2">
          El enlace a la <span className="font-semibold text-ink">Política de privacidad</span> no se
          edita aquí: las tiendas exigen que esté siempre, así que queda fijo.
        </p>
      </div>
    </Sheet>
  );
}
