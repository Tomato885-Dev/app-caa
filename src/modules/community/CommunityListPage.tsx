import { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { communityCategories } from '@/content/taxonomies';
import { approvedOnly } from '@/core/moderation/visibility';
import { AppImage, CardLink, CardListSkeleton, EmptyState, FilterChips, Page, PageHeader } from '@/ui';
import { useGroupList } from './api';

const ALL = 'todas';

export function CommunityListPage() {
  const { data, isLoading } = useGroupList();
  const [category, setCategory] = useState(ALL);

  const groups = useMemo(() => approvedOnly(data ?? []), [data]);
  const filtered = useMemo(
    () => groups.filter((group) => category === ALL || group.category === category),
    [groups, category],
  );

  const options = useMemo(
    () => [
      { value: ALL, label: 'Todas', count: groups.length },
      ...communityCategories
        .map((name) => ({
          value: name,
          label: name,
          count: groups.filter((group) => group.category === name).length,
        }))
        .filter((option) => option.count > 0),
    ],
    [groups],
  );

  return (
    <Page>
      <PageHeader
        title="Comunidad"
        description="Organizaciones, proyectos y actividades permanentes de la comunidad escolar."
      />

      <FilterChips options={options} value={category} onChange={setCategory} className="mb-5" />

      {isLoading ? (
        <CardListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin organizaciones publicadas"
          description="Los espacios de la comunidad aparecerán aquí a medida que se publiquen."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((group) => (
            <CardLink key={group.id} to={`/comunidad/${group.id}`} flush>
              <AppImage imageKey={group.coverImageKey} ratio="16/9" rounded={false} />

              <div className="p-4">
                <div className="mb-2 flex items-center gap-2.5">
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                    <AppImage imageKey={group.logoImageKey} ratio="1/1" compact rounded={false} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-bold leading-tight text-ink">
                      {group.name}
                    </h3>
                    <p className="truncate text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">
                      {group.category}
                    </p>
                  </div>
                </div>

                <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-2">
                  {group.shortDescription}
                </p>
              </div>
            </CardLink>
          ))}
        </div>
      )}
    </Page>
  );
}
