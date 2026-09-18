import { CheckCircle2, Video } from 'lucide-react';
import { incrustarVideo } from '@/core/video/incrustar';
import { Field, Input, VideoIncrustado, cn } from '@/ui';

/* ============================================================================
   EL ENLACE DE UN VIDEO
   ----------------------------------------------------------------------------
   Se pega el enlace tal como se copia —de YouTube, de Vimeo o de un archivo de
   Drive— y debajo aparece el video, listo para mirar antes de publicar. Ver el
   resultado mientras se escribe evita el error clásico: pegar el enlace del
   canal en vez del video, o uno privado que nadie más puede abrir.

   No se exige nada: el campo vacío es lo normal.
   ========================================================================== */

export function CampoDeVideo({
  value,
  onChange,
  label = 'Video (opcional)',
}: {
  value: string;
  onChange: (valor: string) => void;
  label?: string;
}) {
  const limpio = value.trim();
  const video = incrustarVideo(limpio);
  const esEnlace = /^https:\/\/\S+$/i.test(limpio);
  const problema = limpio.length > 0 && !esEnlace;

  return (
    <Field
      label={label}
      htmlFor="video-url"
      error={problema ? 'El enlace tiene que empezar con https://' : undefined}
      hint="Pega el enlace del video de YouTube, Vimeo o Drive. También sirve para una transmisión en vivo."
    >
      <div className="space-y-2.5">
        <div className="relative">
          <Video size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
          <Input
            id="video-url"
            type="url"
            inputMode="url"
            value={value}
            onChange={(evento) => onChange(evento.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            autoComplete="off"
            autoCapitalize="none"
            className="pl-10"
          />
        </div>

        {video ? (
          <>
            <p
              className={cn(
                'inline-flex items-center gap-1.5 text-[12.5px] font-semibold',
                'text-brand-600 dark:text-brand-300',
              )}
            >
              <CheckCircle2 size={14} />
              Así se va a ver en la app:
            </p>
            <VideoIncrustado url={limpio} titulo="Vista previa del video" />
          </>
        ) : esEnlace ? (
          <p className="rounded-field border border-line bg-surface-2 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-2">
            Ese sitio no deja ver el video dentro de la app, así que va a aparecer un botón{' '}
            <span className="font-semibold text-ink">Ver el video</span> que lo abre aparte.
            Funciona, pero si lo tienes en YouTube o Drive, ese enlace se ve mejor.
          </p>
        ) : null}
      </div>
    </Field>
  );
}
