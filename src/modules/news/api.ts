import { db } from '@/core/data';
import { useCollection, useDataMutation, useEntity } from '@/core/hooks/useData';
import type { CreateInput } from '@/core/data';
import type { ID, NewsPost } from '@/core/types';

export function useNewsList() {
  return useCollection('news', db.news);
}

export function useNewsItem(id: ID | undefined) {
  return useEntity('news', db.news, id);
}

/** Ordena por destacadas primero y luego por fecha de publicación. */
export function sortNews(items: NewsPost[]): NewsPost[] {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export function useCreateNews() {
  return useDataMutation(
    (input: CreateInput<NewsPost>) => db.news.create(input),
    ['news'],
  );
}

export function useUpdateNews() {
  return useDataMutation(
    ({ id, patch }: { id: ID; patch: Partial<NewsPost> }) => db.news.update(id, patch),
    ['news'],
  );
}

export function useDeleteNews() {
  return useDataMutation((id: ID) => db.news.remove(id), ['news']);
}
