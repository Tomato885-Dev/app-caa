import { db } from '@/core/data';
import type { CreateInput } from '@/core/data';
import { useCollection, useDataMutation, useEntity } from '@/core/hooks/useData';
import type { EventItem, ID } from '@/core/types';
import { isPast } from '@/core/utils/date';

export function useEventList() {
  return useCollection('events', db.events);
}

export function useEventItem(id: ID | undefined) {
  return useEntity('events', db.events, id);
}

/** Eventos futuros, del más próximo al más lejano. */
export function upcoming(items: EventItem[]): EventItem[] {
  return items
    .filter((item) => !isPast(item.endsAt ?? item.startsAt))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

/** Eventos ya realizados, del más reciente al más antiguo. */
export function past(items: EventItem[]): EventItem[] {
  return items
    .filter((item) => isPast(item.endsAt ?? item.startsAt))
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
}

export function useCreateEvent() {
  return useDataMutation((input: CreateInput<EventItem>) => db.events.create(input), ['events', 'calendarEntries']);
}

export function useUpdateEvent() {
  return useDataMutation(
    ({ id, patch }: { id: ID; patch: Partial<EventItem> }) => db.events.update(id, patch),
    ['events', 'calendarEntries'],
  );
}

export function useDeleteEvent() {
  return useDataMutation((id: ID) => db.events.remove(id), ['events', 'calendarEntries']);
}
