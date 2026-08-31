import { Store } from 'lucide-react';
import { db } from '@/core/data';
import type { AppModule, ModerationSource } from '@/core/modules/types';
import { excerpt } from '@/core/utils/text';
import { MarketplaceDetailPage } from './MarketplaceDetailPage';
import { MarketplaceListPage } from './MarketplaceListPage';

/* Marketplace estudiantil (§6.7). Solo difusión: sin pagos ni transacciones
   dentro de la plataforma. Toda publicación pasa por moderación (§7.2). */

const marketplaceModeration: ModerationSource = {
  kind: 'marketplaceListing',
  label: 'Publicación del marketplace',
  pluralLabel: 'Marketplace',
  fetchAll: async () =>
    (await db.marketplaceListings.list()).map((listing) => ({
      id: listing.id,
      kind: 'marketplaceListing' as const,
      title: listing.title,
      excerpt: `${listing.priceLabel} · ${excerpt(listing.description, 150)}`,
      author: listing.seller,
      createdAt: listing.createdAt,
      status: listing.status,
      href: `/marketplace/${listing.id}`,
    })),
  decide: async ({ id, status, note, moderatorId }) => {
    await db.marketplaceListings.update(id, {
      status,
      moderatedBy: moderatorId,
      moderatedAt: new Date().toISOString(),
      ...(note?.trim() ? { moderationNote: note.trim() } : {}),
    });
  },
};

export const marketplaceModule: AppModule = {
  id: 'marketplace',
  title: 'Marketplace',
  description: 'Emprendimientos y servicios de estudiantes.',
  icon: Store,
  tone: 'brand',
  path: '/marketplace',
  nav: { section: 'secondary', order: 70 },
  routes: [
    { index: true, element: <MarketplaceListPage /> },
    { path: ':id', element: <MarketplaceDetailPage /> },
  ],
  moderationSources: [marketplaceModeration],
};
