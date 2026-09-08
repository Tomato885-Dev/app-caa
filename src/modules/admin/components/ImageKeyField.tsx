import { useRef, useState } from 'react';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { images, esImagenSubida } from '@/content/images';
import { usingServer } from '@/core/data';
import { pesoLegible, subirFoto } from '@/core/images/subir';
import { AppImage, Button, Field, SelectField, cn } from '@/ui';

/* ============================================================================
   IMAGEN DE UNA PUBLICACIÓN
   ----------------------------------------------------------------------------
   Dos formas de poner una foto, y la primera es la que se usa siempre:

     · SUBIRLA — arrastrándola o eligiéndola de la fototeca. La foto se reduce
       en el propio teléfono y se guarda en el servidor. Es lo que hace falta
       para publicar el día a día sin tocar el código.

     · UNA DEL MANIFIESTO — las imágenes que vienen dentro de la aplicación
       (logotipos de colaboradores, portadas). No se suben porque conviene que
       viajen en el paquete y no se descarguen aparte.

   La segunda queda plegada: es la excepción, y ofrecerla al mismo nivel hacía
   que quien solo quiere poner una foto tuviera que entender la diferencia.
   ========================================================================== */

export function ImageKeyField({
  value,
  onChange,
  prefix,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Muestra primero las claves de este módulo, p. ej. "news." */
  prefix?: string;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [encima, setEncima] = useState(false);
  const [error, setError] = useState('');
  const [nota, setNota] = useState('');
  const [verManifiesto, setVerManifiesto] = useState(!esImagenSubida(value) && Boolean(value));

  const recibir = async (archivo: File | undefined) => {
    if (!archivo) return;
    setError('');
    setNota('');
    setSubiendo(true);
    try {
      const foto = await subirFoto(archivo);
      onChange(foto.url);
      setNota(
        `Subida: de ${pesoLegible(foto.bytesOriginal)} a ${pesoLegible(foto.bytesFinal)}.`,
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo subir la imagen.');
    } finally {
      setSubiendo(false);
    }
  };

  const claves = Object.keys(images).sort((a, b) => {
    if (!prefix) return a.localeCompare(b);
    const aCoincide = a.startsWith(prefix) ? 0 : 1;
    const bCoincide = b.startsWith(prefix) ? 0 : 1;
    return aCoincide - bCoincide || a.localeCompare(b);
  });

  return (
    <Field label="Imagen" htmlFor="imagen-archivo">
      <div className="space-y-2.5">
        {value ? (
          <div className="space-y-2">
            <AppImage imageKey={value} ratio="16/9" fit="natural" />
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={() => {
                onChange('');
                setNota('');
                setError('');
              }}
              className="w-full"
            >
              Quitar la imagen
            </Button>
          </div>
        ) : null}

        {usingServer ? (
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setEncima(true);
            }}
            onDragLeave={() => setEncima(false)}
            onDrop={(event) => {
              event.preventDefault();
              setEncima(false);
              void recibir(event.dataTransfer.files?.[0]);
            }}
            className={cn(
              'rounded-field border-2 border-dashed p-4 text-center transition',
              encima ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-line bg-surface-2',
            )}
          >
            <ImagePlus size={20} className="mx-auto text-ink-3" />
            <p className="mt-1.5 text-[12.5px] font-medium text-ink-2">
              Arrastra una foto aquí
            </p>
            <p className="mt-0.5 text-[11.5px] text-ink-3">o elígela de tu galería</p>

            <input
              ref={entrada}
              id="imagen-archivo"
              type="file"
              /* En el teléfono, esto abre la fototeca directamente. Sin
                 `capture`, para que también deje elegir una foto existente y
                 no fuerce a sacar una nueva. */
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                void recibir(event.target.files?.[0]);
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
              {subiendo ? 'Subiendo…' : 'Elegir una foto'}
            </Button>
          </div>
        ) : (
          <p className="rounded-field border border-line bg-surface-2 px-3 py-2.5 text-[12px] leading-relaxed text-ink-2">
            Subir fotos necesita el servidor conectado. En la versión de
            demostración solo se pueden usar las imágenes del manifiesto.
          </p>
        )}

        {error ? (
          <p role="alert" className="text-[12px] font-medium text-danger-500">
            {error}
          </p>
        ) : null}
        {nota ? <p className="text-[12px] text-ink-3">{nota}</p> : null}

        {/* La opción de siempre, plegada porque ya casi no se usa. */}
        <button
          type="button"
          onClick={() => setVerManifiesto((abierto) => !abierto)}
          className="text-[12px] font-semibold text-ink-3 underline-offset-2 hover:underline"
        >
          {verManifiesto ? 'Ocultar' : 'Usar una imagen que ya viene en la app'}
        </button>

        {verManifiesto ? (
          <SelectField
            label="Imagen del manifiesto"
            value={esImagenSubida(value) ? '' : value}
            onChange={(event) => onChange(event.target.value)}
            hint="Se definen en src/content/images.ts. Si el archivo aún no existe, se ve un marcador."
            options={[
              { value: '', label: 'Ninguna' },
              ...claves.map((clave) => ({
                value: clave,
                label: `${clave}${images[clave].src ? '' : '  ·  pendiente'}`,
              })),
            ]}
          />
        ) : null}
      </div>
    </Field>
  );
}
