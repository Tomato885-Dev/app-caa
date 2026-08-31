import { useMemo } from 'react';
import { db } from '@/core/data';
import type { CreateInput } from '@/core/data';
import { useCollection, useDataMutation, useEntity } from '@/core/hooks/useData';
import type { ID, Registration, SignupActivity, User } from '@/core/types';
import { isPast } from '@/core/utils/date';
import { toAuthorRef } from '@/content/seed/users';

export function useActivityList() {
  return useCollection('signupActivities', db.signupActivities);
}

export function useActivity(id: ID | undefined) {
  return useEntity('signupActivities', db.signupActivities, id);
}

export function useRegistrations() {
  return useCollection('registrations', db.registrations);
}

/** ¿La actividad admite nuevas inscripciones ahora mismo? */
export function isOpen(activity: SignupActivity): boolean {
  return activity.open && !isPast(activity.closesAt);
}

export interface ActivityCapacity {
  taken: number;
  capacity: number | null;
  remaining: number | null;
  full: boolean;
}

export function capacityOf(activity: SignupActivity, registrations: Registration[]): ActivityCapacity {
  const taken = registrations.filter(
    (registration) => registration.activityId === activity.id && registration.state !== 'cancelled',
  ).length;

  if (activity.capacity === null) {
    return { taken, capacity: null, remaining: null, full: false };
  }

  const remaining = Math.max(0, activity.capacity - taken);
  return { taken, capacity: activity.capacity, remaining, full: remaining === 0 };
}

/** Inscripción activa del usuario en una actividad, si existe. */
export function findRegistration(
  registrations: Registration[],
  activityId: ID,
  userId: ID,
): Registration | undefined {
  return registrations.find(
    (registration) =>
      registration.activityId === activityId &&
      registration.user.id === userId &&
      registration.state !== 'cancelled',
  );
}

/** Inscripciones vigentes del usuario, para su perfil (§6.8). */
export function useMyRegistrations(userId: ID | undefined) {
  const { data, isLoading } = useRegistrations();
  const registrations = useMemo(
    () =>
      (data ?? []).filter(
        (registration) => registration.user.id === userId && registration.state !== 'cancelled',
      ),
    [data, userId],
  );
  return { registrations, isLoading };
}

export function useRegister() {
  return useDataMutation(
    ({
      activity,
      user,
      answers,
      state,
    }: {
      activity: SignupActivity;
      user: User;
      answers: Record<string, string>;
      state: Registration['state'];
    }) =>
      db.registrations.create({
        activityId: activity.id,
        user: toAuthorRef(user),
        answers,
        state,
      }),
    ['registrations'],
  );
}

export function useCancelRegistration() {
  return useDataMutation(
    (id: ID) => db.registrations.update(id, { state: 'cancelled' }),
    ['registrations'],
  );
}

export function useCreateActivity() {
  return useDataMutation(
    (input: CreateInput<SignupActivity>) => db.signupActivities.create(input),
    ['signupActivities', 'calendarEntries'],
  );
}

export function useUpdateActivity() {
  return useDataMutation(
    ({ id, patch }: { id: ID; patch: Partial<SignupActivity> }) =>
      db.signupActivities.update(id, patch),
    ['signupActivities', 'calendarEntries'],
  );
}

export function useDeleteActivity() {
  return useDataMutation((id: ID) => db.signupActivities.remove(id), ['signupActivities', 'calendarEntries']);
}
