import { useMemo, useState } from 'react';
import { Plus, Search, Store } from 'lucide-react';
import { marketplaceCategories } from '@/content/taxonomies';
import { useAuth } from '@/core/auth/AuthContext';
import { visibleTo } from '@/core/moderation/visibility';
import { matchesSearch } from '@/core/utils/text';
import {
  AppImage,
  Badge,
  Button,
  CardLink,
  CardListSkeleton,
  EmptyState,
  FilterChips,
  Input,
  Page,
  PageHeader,
  StatusBadge,
} from '@/ui';
import { useListingList } from './api';
import { NewListingSheet } from './components/NewListingSheet';

const ALL = 'todas';

export function MarketplaceListPage() {
  const { user } = useAuth();
  const { data, isLoading } = useListingList();
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);

  const listings = useMemo(
    () => visibleTo(data ?? [], user).filter((listing) => listing.available),
    [data, user],
  );

  const filtered = useMemo(
    () =>
      listings.filter(
        (listing) =>
          (category === ALL || listing.category === category) &&
          matchesSearch(query, listing.title, listing.description, listing.seller.name),
      ),
    [listings, category, query],
  );

  const options = useMemo(
    () => [
      { value: ALL, label: 'Todas', count: listings.length },
      ...marketplaceCategories
        .map((name) => ({
          value: name,
          label: name,
          count: listings.filter((listing) => listing.category === name).length,
        }))
        .filter((option) => option.count > 0),
    ],
    [listings],
  );

  return (
    <Page>
      <PageHeader
        title="Marketplace"
        description="Emprendimientos, productos y servicios de estudiantes."
        action={
          <Button icon={Plus} size="sm" onClick={() => setComposerOpen(true)}>
            Publicar
          </Button>
        }
      />

      {/* La plataforma solo difunde: se declara antes de ver las publicaciones (§7.2). */}
      <div className="mb-4 rounded-field border border-line bg-surface-2 px-3.5 py-3">
        <p className="text-[12.5px] leading-relaxed text-ink-2">
          <span className="font-bold text-ink">Espacio de difusión.</span> La aplicación no procesa
          pagos ni intermedia acuerdos: el contacto y cualquier transacción ocurren fuera de la
          plataforma, respetando las normas del establecimiento.
        </p>
      </div>

      <div className="relative mb-3">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar productos o servicios"
          aria-label="Buscar en el marketplace"
          className="pl-10"
        />
      </div>

      <FilterChips options={options} value={category} onChange={setCategory} className="mb-5" />

      {isLoading ? (
        <CardListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Store}
          title="Sin publicaciones"
          description="No hay emprendimientos que coincidan con tu búsqueda."
          action={<Button onClick={() => setComposerOpen(true)}>Publicar el primero</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((listing) => (
            <CardLink key={listing.id} to={`/marketplace/${listing.id}`} flush>
              <AppImage imageKey={listing.imageKeys[0]} ratio="1/1" compact rounded={false} />

              <div className="p-3">
                <div className="mb-1.5 flex flex-wrap gap-1">
                  <Badge tone={listing.type === 'producto' ? 'brand' : 'info'}>
                    {listing.type === 'producto' ? 'Producto' : 'Servicio'}
                  </Badge>
                  {listing.status !== 'approved' ? <StatusBadge status={listing.status} /> : null}
                </div>

                <h3 className="line-clamp-2 text-[13.5px] font-bold leading-snug text-ink">
                  {listing.title}
                </h3>
                <p className="mt-1 text-[12.5px] font-bold text-brand-600 dark:text-brand-300">
                  {listing.priceLabel}
                </p>
                <p className="mt-0.5 truncate text-[11.5px] text-ink-3">{listing.seller.name}</p>
              </div>
            </CardLink>
          ))}
        </div>
      )}

      <NewListingSheet open={composerOpen} onClose={() => setComposerOpen(false)} />
    </Page>
  );
}
