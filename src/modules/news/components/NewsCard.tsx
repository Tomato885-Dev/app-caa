import { Star } from 'lucide-react';
import { formatRelative } from '@/core/utils/date';
import type { NewsPost } from '@/core/types';
import { AppImage, CardLink } from '@/ui';

/* ============================================================================
   TARJETA DESTACADA
   ----------------------------------------------------------------------------
   La portada de Noticias y el bloque de noticias de Inicio. La foto se
   respeta entera, con su forma: las etiquetas se posan sobre una esquina y no
   la tapan ni la recortan.

   La estrella de "Destacada" es un sello amarillo sobre la foto, no una
   insignia mas en la fila: si va con las otras, deja de destacar.
   ========================================================================== */
export function NewsFeatureCard({ post }: { post: NewsPost }) {
  return (
    <CardLink to={`/noticias/${post.id}`} flush>
      <div className="relative">
        <AppImage imageKey={post.imageKey} ratio="16/9" rounded={false} fit="full" />
        {post.featured ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-accent-500 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-on-accent shadow-raised">
            <Star size={12} />
            Destacada
          </span>
        ) : null}
      </div>

      <div className="p-4">
        <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-bold uppercase tracking-[0.08em]">
          <span className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-300">
            <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />
            {post.category}
          </span>
          <span className="font-medium normal-case tracking-normal text-ink-3">
            {formatRelative(post.publishedAt)}
          </span>
        </div>

        <h3 className="text-[19px] font-extrabold leading-[1.2] tracking-tight text-ink">
          {post.title}
        </h3>
        {post.summary ? (
          <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink-2">
            {post.summary}
          </p>
        ) : null}
      </div>
    </CardLink>
  );
}

/** Tarjeta compacta en fila: miniatura + texto. Para listados largos. */
export function NewsRowCard({ post }: { post: NewsPost }) {
  return (
    <CardLink to={`/noticias/${post.id}`}>
      <div className="flex gap-3.5">
        <div className="w-24 shrink-0 sm:w-28">
          <AppImage imageKey={post.imageKey} ratio="4/3" compact />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="truncate text-[11.5px] font-bold uppercase tracking-wide text-brand-600 dark:text-brand-300">
              {post.category}
            </span>
            <span className="shrink-0 text-[11.5px] text-ink-3">
              {formatRelative(post.publishedAt)}
            </span>
          </div>

          <h3 className="line-clamp-2 text-[14.5px] font-bold leading-snug text-ink">
            {post.title}
          </h3>
          {post.summary ? (
            <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-2">
              {post.summary}
            </p>
          ) : null}
        </div>
      </div>
    </CardLink>
  );
}
