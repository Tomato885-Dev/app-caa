import { db } from '@/core/data';
import type { CreateInput } from '@/core/data';
import { useCollection, useDataMutation, useEntity } from '@/core/hooks/useData';
import type { CommunityGroup, ID } from '@/core/types';

export function useGroupList() {
  return useCollection('communityGroups', db.communityGroups);
}

export function useGroup(id: ID | undefined) {
  return useEntity('communityGroups', db.communityGroups, id);
}

export function useCreateGroup() {
  return useDataMutation(
    (input: CreateInput<CommunityGroup>) => db.communityGroups.create(input),
    ['communityGroups'],
  );
}

export function useUpdateGroup() {
  return useDataMutation(
    ({ id, patch }: { id: ID; patch: Partial<CommunityGroup> }) =>
      db.communityGroups.update(id, patch),
    ['communityGroups'],
  );
}

export function useDeleteGroup() {
  return useDataMutation((id: ID) => db.communityGroups.remove(id), ['communityGroups']);
}
