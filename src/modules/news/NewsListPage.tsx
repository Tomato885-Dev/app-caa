import { useMemo, useState } from 'react';
import { Newspaper, Search } from 'lucide-react';
import { newsCategories } from '@/content/taxonomies';
import { approvedOnly } from '@/core/moderation/visibility';
import { matchesSearch } from '@/core/utils/text';
import { CardListSkeleton, EmptyState, FilterChips, Input, Page, PageHeader } from '@/ui';
import { sortNews, useNewsList } from './api';
import { NewsFeatureCard, NewsRowCard } from './components/NewsCard';

const ALL = 'todas';

export function NewsListPage() {
  const { data, isLoading } = useNewsList();
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState('');

  const posts = useMemo(() => sortNews(approvedOnly(data ?? [])), [data]);

  const filtered = useMemo(
    () =>
      posts.filter(
        (post) =>
          (category === ALL || post.category === category) &&
          matchesSearch(query, post.title, post.summary, post.body),
      ),
    [posts, category, query],
  );

  const options = useMemo(
    () => [
      { value: ALL, label: 'Todas', count: posts.length },
      ...newsCategories
        .map((name) => ({
          value: name,
          label: name,
          count: posts.filter((post) => post.category === name).length,
        }))
        .filter((option) => option.count > 0),
    ],
    [posts],
  );

  const [lead, ...rest] = filtered;

  return (
    <Page>
      <PageHeader
        title="Noticias"
        description="Comunicados oficiales e información verificada de la comunidad estudiantil."
      />

      <div className="relative mb-3">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar en noticias"
          aria-label="Buscar en noticias"
          className="pl-10"
        />
      </div>

      <FilterChips options={options} value={category} onChange={setCategory} className="mb-5" />

      {isLoading ? (
        <CardListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="Sin noticias por ahora"
          description="No hay publicaciones que coincidan con tu búsqueda o filtro."
        />
      ) : (
        <div className="space-y-3">
          {lead ? <NewsFeatureCard post={lead} /> : null}
          {rest.map((post) => (
            <NewsRowCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </Page>
  );
}
