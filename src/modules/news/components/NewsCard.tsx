import { Star } from 'lucide-react';
import { formatRelative } from '@/core/utils/date';
import type { NewsPost } from '@/core/types';
import { AppImage, Badge, CardLink } from '@/ui';

/** Tarjeta destacada: imagen grande. Se usa en Inicio y al tope de Noticias. */
export function NewsFeatureCard({ post }: { post: NewsPost }) {
  return (
    <CardLink to={`/noticias/${post.id}`} flush>
      <AppImage imageKey={post.imageKey} ratio="16/9" rounded={false} />
      <div className="p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="brand">{post.category}</Badge>
          {post.featured ? (
            <Badge tone="accent" icon={Star}>
              Destacada
            </Badge>
          ) : null}
          <span className="text-[12px] text-ink-3">{formatRelative(post.publishedAt)}</span>
        </div>

        <h3 className="text-[17px] font-bold leading-snug text-ink">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink-2">
          {post.summary}
        </p>
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
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-2">
            {post.summary}
          </p>
        </div>
      </div>
    </CardLink>
  );
}
