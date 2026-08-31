import { images } from '@/content/images';
import { AppImage, SelectField } from '@/ui';

/* ============================================================================
   SELECTOR DE IMAGEN
   ----------------------------------------------------------------------------
   El contenido no sube archivos: referencia una clave del manifiesto
   `src/content/images.ts`. Así, cambiar una foto es editar una línea de ese
   archivo y no requiere volver a publicar el contenido.
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
  const keys = Object.keys(images).sort((a, b) => {
    if (!prefix) return a.localeCompare(b);
    const aMatch = a.startsWith(prefix) ? 0 : 1;
    const bMatch = b.startsWith(prefix) ? 0 : 1;
    return aMatch - bMatch || a.localeCompare(b);
  });

  return (
    <div className="space-y-2">
      <SelectField
        label="Imagen"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        hint="Las claves se definen en src/content/images.ts. Si la imagen aún no existe, se mostrará un marcador."
        options={[
          { value: '', label: 'Sin imagen' },
          ...keys.map((key) => ({
            value: key,
            label: `${key}${images[key].src ? '' : '  ·  pendiente'}`,
          })),
        ]}
      />

      {value ? <AppImage imageKey={value} ratio="16/9" /> : null}
    </div>
  );
}
