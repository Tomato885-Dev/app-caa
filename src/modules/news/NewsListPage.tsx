import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Newspaper, Search } from 'lucide-react';
import { newsCategories } from '@/content/taxonomies';
import { approvedOnly } from '@/core/moderation/visibility';
import { matchesSearch } from '@/core/utils/text';
import {
  Button,
  CardListSkeleton,
  EmptyState,
  FilterChips,
  Input,
  Page,
  PageHeader,
} from '@/ui';
import { sortNews, useNewsList } from './api';
import { NewsFeatureCard, NewsRowCard } from './components/NewsCard';

/* ============================================================================
   NOTICIAS
   ----------------------------------------------------------------------------
   El listado crece sin techo: en un año se acumulan decenas de publicaciones.
   Por eso no se pintan todas de golpe, sino de tanda en tanda con un botón
   "Mostrar más".

   Se prefiere el botón al desplazamiento infinito: en un teléfono con datos
   móviles, cargar solo cuando alguien lo pide es más rápido y deja llegar al
   final de la página, donde el desplazamiento infinito nunca termina.
   ========================================================================== */

const ALL = 'todas';

/** Cuántas se muestran de entrada y cuántas suma cada "Mostrar más". */
const PAGE_SIZE = 8;

export function NewsListPage() {
  const { data, isLoading } = useNewsList();
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Al filtrar o buscar se vuelve a empezar: seguir en la tanda 4 de una lista
  // que acaba de cambiar dejaría al lector en un punto que ya no existe.
  useEffect(() => setVisible(PAGE_SIZE), [category, query]);

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

  const shown = filtered.slice(0, visible);
  const [lead, ...rest] = shown;
  const restantes = filtered.length - shown.length;

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

      <FilterChips options={options} value={category} onChange={setCategory} className="mb-3" />

      {/* Cuántas hay en total: sitúa antes de empezar a bajar. */}
      {!isLoading && filtered.length > 0 ? (
        <p className="mb-4 text-[12.5px] text-ink-3">
          {filtered.length === 1 ? '1 noticia' : `${filtered.length} noticias`}
          {filtered.length > shown.length ? ` · mostrando ${shown.length}` : ''}
        </p>
      ) : null}

      {isLoading ? (
        <CardListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="Sin noticias por ahora"
          description="No hay publicaciones que coincidan con tu búsqueda o filtro."
        />
      ) : (
        <>
          <div className="space-y-3">
            {lead ? <NewsFeatureCard post={lead} /> : null}
            {rest.map((post) => (
              <NewsRowCard key={post.id} post={post} />
            ))}
          </div>

          {restantes > 0 ? (
            <Button
              variant="secondary"
              icon={ChevronDown}
              onClick={() => setVisible((current) => current + PAGE_SIZE)}
              className="mt-4 w-full"
            >
              Mostrar {Math.min(PAGE_SIZE, restantes)} más
            </Button>
          ) : null}
        </>
      )}
    </Page>
  );
}
