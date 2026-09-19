import { ArrowRight, Star } from 'lucide-react';
import { getImage } from '@/content/images';
import { formatRelative } from '@/core/utils/date';
import type { NewsPost } from '@/core/types';
import { AppImage, CardLink, cn } from '@/ui';

/* ============================================================================
   TARJETA DESTACADA
   ----------------------------------------------------------------------------
   La portada de Noticias y el bloque de noticias de Inicio. Va como portada de
   revista: la foto entera y, sobre su parte de abajo, un velo oscuro con el
   titular encima. La foto no se recorta ni cambia de forma —eso se respeta—,
   solo se oscurece el pie para que el texto se lea.

   SIN FOTO NO SE FINGE UNA
   Si la noticia no tiene imagen, la portada se dibuja en verde con el titular
   en grande. Antes quedaba el recuadro punteado de "imagen pendiente" ocupando
   media pantalla, que es parte de lo que hacía ver pobre la sección.
   ========================================================================== */

export function NewsFeatureCard({ post }: { post: NewsPost }) {
  const hayFoto = Boolean(getImage(post.imageKey)?.src);

  return (
    <CardLink to={`/noticias/${post.id}`} flush className="group relative block">
      {hayFoto ? (
        <>
          <AppImage imageKey={post.imageKey} ratio="16/9" rounded={false} fit="full" />
          {/* El velo: de transparente arriba a oscuro abajo. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/45 to-transparent"
          />
        </>
      ) : (
        <span
          aria-hidden
          className="block aspect-[16/10] bg-gradient-to-br from-brand-500 to-brand-800"
        />
      )}

      {post.featured ? (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-accent-500 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-on-accent shadow-raised">
          <Star size={12} />
          Destacada
        </span>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white/75">
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-white">{post.category}</span>
          {formatRelative(post.publishedAt)}
        </p>

        <h3 className="text-[21px] font-extrabold leading-[1.15] tracking-tight text-white drop-shadow">
          {post.title}
        </h3>

        {post.summary ? (
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-white/85">
            {post.summary}
          </p>
        ) : null}
      </div>
    </CardLink>
  );
}

/* ============================================================================
   TARJETA EN FILA
   ----------------------------------------------------------------------------
   Para el resto del listado. La miniatura es cuadrada y grande: una foto de
   estampilla no ayuda a reconocer nada. Sin foto va la inicial sobre verde,
   para que la fila no quede coja.
   ========================================================================== */

export function NewsRowCard({ post }: { post: NewsPost }) {
  const hayFoto = Boolean(getImage(post.imageKey)?.src);

  return (
    <CardLink to={`/noticias/${post.id}`} flush className="group">
      <div className="flex items-stretch gap-3.5 p-3">
        <div className="w-[88px] shrink-0 overflow-hidden rounded-2xl">
          {hayFoto ? (
            <AppImage
              imageKey={post.imageKey}
              ratio="1/1"
              compact
              rounded={false}
              className="transition duration-200 group-hover:scale-[1.04]"
            />
          ) : (
            <span
              aria-hidden
              className={cn(
                'flex aspect-square items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700',
                'text-[26px] font-black text-white/90',
              )}
            >
              {post.title.trim().charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
          <p className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em]">
            <span className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-300">
              <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />
              {post.category}
            </span>
            <span className="font-medium normal-case tracking-normal text-ink-3">
              {formatRelative(post.publishedAt)}
            </span>
          </p>

          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-ink">{post.title}</h3>

          {post.summary ? (
            <p className="mt-1 line-clamp-1 text-[12.5px] leading-relaxed text-ink-2">
              {post.summary}
            </p>
          ) : null}
        </div>

        <ArrowRight
          size={16}
          className="shrink-0 self-center text-ink-3 transition group-hover:translate-x-0.5"
        />
      </div>
    </CardLink>
  );
}
