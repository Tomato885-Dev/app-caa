import { db } from '@/core/data';
import type { CreateInput } from '@/core/data';
import { useCollection, useDataMutation, useEntity } from '@/core/hooks/useData';
import type { Announcement, ID } from '@/core/types';

export function useAnnouncementList() {
  return useCollection('announcements', db.announcements);
}

export function useAnnouncement(id: ID | undefined) {
  return useEntity('announcements', db.announcements, id);
}

/** Fijados primero; dentro de cada grupo, del más reciente al más antiguo. */
export function sortAnnouncements(items: Announcement[]): Announcement[] {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export function useCreateAnnouncement() {
  return useDataMutation(
    (input: CreateInput<Announcement>) => db.announcements.create(input),
    ['announcements'],
  );
}

export function useUpdateAnnouncement() {
  return useDataMutation(
    ({ id, patch }: { id: ID; patch: Partial<Announcement> }) => db.announcements.update(id, patch),
    ['announcements'],
  );
}

export function useDeleteAnnouncement() {
  return useDataMutation((id: ID) => db.announcements.remove(id), ['announcements']);
}
