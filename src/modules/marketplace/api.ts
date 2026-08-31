import { toAuthorRef } from '@/content/seed/users';
import { db } from '@/core/data';
import { useCollection, useDataMutation, useEntity } from '@/core/hooks/useData';
import { initialStatusFor } from '@/core/moderation/visibility';
import type { ContactLink, ID, MarketplaceListing, User } from '@/core/types';

export function useListingList() {
  return useCollection('marketplaceListings', db.marketplaceListings);
}

export function useListing(id: ID | undefined) {
  return useEntity('marketplaceListings', db.marketplaceListings, id);
}

export interface NewListingInput {
  title: string;
  description: string;
  category: string;
  type: MarketplaceListing['type'];
  priceLabel: string;
  contact: ContactLink;
  user: User;
}

export function useCreateListing() {
  return useDataMutation(
    ({ user, ...input }: NewListingInput) =>
      db.marketplaceListings.create({
        ...input,
        // Las imágenes se agregan luego desde el manifiesto de contenido.
        imageKeys: [],
        seller: toAuthorRef(user),
        available: true,
        status: initialStatusFor(user),
      }),
    ['marketplaceListings', 'moderationQueue'],
  );
}

export function useUpdateListing() {
  return useDataMutation(
    ({ id, patch }: { id: ID; patch: Partial<MarketplaceListing> }) =>
      db.marketplaceListings.update(id, patch),
    ['marketplaceListings', 'moderationQueue'],
  );
}

export function useDeleteListing() {
  return useDataMutation((id: ID) => db.marketplaceListings.remove(id), [
    'marketplaceListings',
    'moderationQueue',
  ]);
}
