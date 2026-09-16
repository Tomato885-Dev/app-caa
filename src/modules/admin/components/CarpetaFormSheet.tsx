import { useEffect, useState } from 'react';
import type { CarpetaApuntes } from '@/core/types';
import { useCreateCarpeta, useUpdateCarpeta } from '@/modules/apuntes/api';
import {
  cursoDeGeneracion,
  esEnlaceSeguro,
  generacionesVigentes,
} from '@/modules/apuntes/generacion';
import { Button, SelectField, Sheet, TextField, useToast } from '@/ui';

/* ============================================================================
   CARPETAS DE LA CENTRAL DE APUNTES
   ----------------------------------------------------------------------------
   Una carpeta es un enlace a Drive con su generación. Se elige la generación
   por AÑO de egreso, y el selector dice en qué curso está hoy cada una, para
   no tener que hacer la cuenta: "Generación 2027 · hoy en III Medio".

   La app no toca los permisos de Drive. Si la carpeta no está compartida con
   los alumnos, el enlace abre pero Drive no los deja entrar; por eso se avisa
   junto al campo del enlace.
   ========================================================================== */

const TODAS = '';

export function CarpetaFormSheet({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: CarpetaApuntes | null;
}) {
  const notify = useToast();
  const create = useCreateCarpeta();
  const update = useUpdateCarpeta();

  const [titulo, setTitulo] = useState('');
  const [generacion, setGeneracion] = useState(TODAS);
  const [url, setUrl] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrores({});
    setTitulo(editing?.titulo ?? '');
    setGeneracion(editing?.generacion ? String(editing.generacion) : TODAS);
    setUrl(editing?.url ?? '');
    setDescripcion(editing?.descripcion ?? '');
  }, [open, editing]);

  /* Las generaciones que hoy están en el colegio. Si se edita la carpeta de una
     que ya egresó, se agrega igual, para no perder su año al guardar. */
  const vigentes = generacionesVigentes();
  const años =
    editing?.generacion && !vigentes.includes(editing.generacion)
      ? [editing.generacion, ...vigentes]
      : vigentes;

  const opciones = [
    { value: TODAS, label: 'Todas las generaciones' },
    ...años.map((año) => {
      const curso = cursoDeGeneracion(año);
      return { value: String(año), label: `Generación ${año} · ${curso ? `hoy en ${curso}` : 'ya egresó'}` };
    }),
  ];

  const guardar = () => {
    const nuevos: Record<string, string> = {};
    if (titulo.trim().length < 2) nuevos.titulo = 'Escribe el nombre de la carpeta.';
    if (!esEnlaceSeguro(url)) nuevos.url = 'Pega el enlace completo, que empiece con https://';
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;

    const payload = {
      titulo: titulo.trim(),
      url: url.trim(),
      generacion: generacion === TODAS ? undefined : Number(generacion),
      descripcion: descripcion.trim() || undefined,
    };
    const listo = () => {
      notify(editing ? 'Carpeta actualizada.' : 'Carpeta agregada.');
      onClose();
    };

    if (editing) update.mutate({ id: editing.id, patch: payload }, { onSuccess: listo });
    else create.mutate(payload, { onSuccess: listo });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? 'Editar carpeta' : 'Nueva carpeta de apuntes'}
      description="Queda disponible de inmediato para la generación que elijas."
      footer={
        <Button size="lg" onClick={guardar} loading={create.isPending || update.isPending} className="w-full">
          {editing ? 'Guardar cambios' : 'Agregar carpeta'}
        </Button>
      }
    >
      <div className="space-y-4">
        <TextField
          label="Nombre"
          required
          value={titulo}
          onChange={(event) => {
            setTitulo(event.target.value);
            setErrores((e) => ({ ...e, titulo: '' }));
          }}
          error={errores.titulo}
          placeholder="Central de apuntes · Generación 2027"
          maxLength={80}
        />

        <SelectField
          label="Generación"
          value={generacion}
          onChange={(event) => setGeneracion(event.target.value)}
          options={opciones}
          hint="Se guarda el año de egreso, así la carpeta sigue sirviendo cuando la generación pase de curso."
        />

        <TextField
          label="Enlace de la carpeta"
          required
          type="url"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setErrores((e) => ({ ...e, url: '' }));
          }}
          error={errores.url}
          placeholder="https://drive.google.com/drive/folders/…"
          hint="En Drive: Compartir → Copiar enlace. La app no cambia los permisos: la carpeta tiene que estar compartida con esa generación."
        />

        <TextField
          label="Descripción (opcional)"
          multiline
          rows={3}
          value={descripcion}
          onChange={(event) => setDescripcion(event.target.value)}
          placeholder="Guías, resúmenes y pruebas anteriores, ordenados por asignatura."
          maxLength={200}
        />
      </div>
    </Sheet>
  );
}
