import { useParams } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { formatDate } from '@/core/utils/date';
import { AppImage, Avatar, Badge, ButtonLink, EmptyState, Page, Prose, Skeleton } from '@/ui';
import { useNewsItem } from './api';

export function NewsDetailPage() {
  const { id } = useParams();
  const { data: post, isLoading } = useNewsItem(id);

  if (isLoading) {
    return (
      <Page>
        <Skeleton className="mb-4 aspect-[16/9] w-full" />
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </Page>
    );
  }

  if (!post) {
    return (
      <Page>
        <EmptyState
          icon={FileQuestion}
          title="Noticia no encontrada"
          description="Es posible que haya sido retirada o que el enlace no sea válido."
          action={<ButtonLink to="/noticias">Volver a noticias</ButtonLink>}
        />
      </Page>
    );
  }

  return (
    <Page>
      <article>
        <AppImage imageKey={post.imageKey} ratio="16/9" className="mb-5" />

        <Badge tone="brand" className="mb-3">
          {post.category}
        </Badge>

        <h1 className="text-[25px] font-extrabold leading-[1.2] tracking-tight text-ink">
          {post.title}
        </h1>

        <p className="mt-3 text-[16px] font-medium leading-relaxed text-ink-2">{post.summary}</p>

        <div className="my-5 flex items-center gap-3 border-y border-line py-3.5">
          <Avatar name={post.author.name} avatarKey={post.author.avatarKey} size="md" />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold text-ink">{post.author.name}</p>
            <p className="text-[12px] text-ink-3">Publicado el {formatDate(post.publishedAt)}</p>
          </div>
        </div>

        <Prose text={post.body} />
      </article>
    </Page>
  );
}
