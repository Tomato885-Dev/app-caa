import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { appConfig } from '@/config/app.config';
import { useAuth } from '@/core/auth/AuthContext';
import { approvedOnly } from '@/core/moderation/visibility';
import { getVisibleModules } from '@/core/modules/registry';
import { nombreDePila } from '@/core/utils/nombres';
import { AnnouncementCard } from '@/modules/announcements/components/AnnouncementCard';
import {
  isClosed,
  sortAnnouncements,
  sortInscriptions,
  useAnnouncementList,
} from '@/modules/announcements/api';
import { EventHighlightCard } from '@/modules/events/components/EventCard';
import { upcoming, useEventList } from '@/modules/events/api';
import { useMenuDeHoy } from '@/modules/casino/components/HoyEnElCasino';
import { useBenefitList, esVisible, sortBenefits } from '@/modules/benefits/api';
import { Bento } from './components/Bento';
import { NewsFeatureCard, NewsRowCard } from '@/modules/news/components/NewsCard';
import { sortNews, useNewsList } from '@/modules/news/api';
import { useNovedadesDe } from '@/app/novedades/NovedadesContext';
import {
  Card,
  CardListSkeleton,
  Page,
  SectionHeader,
  Skeleton,
  cn,
  toneVivid,
} from '@/ui';

/* ============================================================================
   INICIO (§6.1)
   ----------------------------------------------------------------------------
   Vista rápida de la actividad escolar: noticias destacadas, próximos eventos,
   convocatorias abiertas y accesos directos al resto de la plataforma.

   Los accesos directos se generan desde el registro de módulos, de modo que un
   módulo nuevo aparece aquí sin editar esta pantalla.
   ========================================================================== */

/** "Martes 16 de septiembre": ubica el día sin tener que mirar el reloj. */
function hoyEnPalabras(): string {
  const texto = new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  return texto.charAt(0).toUpperCase() + texto.slice(1).replace(',', '');
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export function HomePage() {
  const { user, role } = useAuth();

  const announcements = useAnnouncementList();
  const news = useNewsList();
  const events = useEventList();

  // Los comunicados fijados van primero: son los avisos vigentes del día.
  const latestAnnouncements = useMemo(
    () =>
      sortAnnouncements(
        (announcements.data ?? []).filter((item) => item.kind !== 'inscripcion'),
      ).slice(0, 2),
    [announcements.data],
  );

  /* ...y abajo las convocatorias que siguen abiertas, primero las que cierran
     antes. Una convocatoria vencida ya no sirve de nada en la portada. */
  const openInscriptions = useMemo(
    () =>
      sortInscriptions(
        (announcements.data ?? []).filter(
          (item) => item.kind === 'inscripcion' && !isClosed(item),
        ),
      ).slice(0, 3),
    [announcements.data],
  );
  const featuredNews = useMemo(() => sortNews(approvedOnly(news.data ?? [])).slice(0, 4), [news.data]);
  const nextEvents = useMemo(() => upcoming(approvedOnly(events.data ?? [])).slice(0, 6), [events.data]);
  const proximo = nextEvents[0];
  const casino = useMenuDeHoy();
  const beneficios = useBenefitList();
  const colaboradores = useMemo(
    () => sortBenefits((beneficios.data ?? []).filter(esVisible)),
    [beneficios.data],
  );

  /* Para el bloque de avisos: cuántos salieron en los últimos 7 días, y el más
     reciente. Contar da una razón para abrir la app: "hay 3 nuevos". */
  const { ultimoAviso, avisosDeLaSemana } = useMemo(() => {
    const todos = [...(announcements.data ?? [])].sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt),
    );
    const haceUnaSemana = Date.now() - 7 * 86_400_000;
    return {
      ultimoAviso: todos[0],
      avisosDeLaSemana: todos.filter((item) => new Date(item.publishedAt).getTime() >= haceUnaSemana)
        .length,
    };
  }, [announcements.data]);

  // Accesos directos: todos los módulos navegables menos Inicio y el perfil.
  const shortcuts = getVisibleModules(role).filter(
    (mod) => mod.id !== 'home' && mod.id !== 'profile' && mod.nav.section !== 'hidden',
  );

  const [lead, ...restNews] = featuredNews;

  return (
    <Page>
      {/* EL SALUDO. Sin tarjeta: el nombre va grande directo sobre el fondo vivo
          de la app, como la portada de una revista. La fecha en una cinta
          amarilla y la mano que saluda le dan el tono. */}
      <header className="animate-in-up relative mb-5 pt-1">
        <p className="inline-flex -rotate-2 rounded-lg bg-accent-500 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-on-accent shadow-card">
          {hoyEnPalabras()}
        </p>
        <p className="mt-3 text-[15px] font-semibold text-ink-2">{greeting()},</p>
        <h1 className="flex items-center gap-2 text-[40px] font-black leading-[0.95] tracking-tighter text-ink">
          <span className="texto-degradado">
            {user ? nombreDePila(user.name, user.email) : appConfig.organization.shortName}
          </span>
          <span aria-hidden className="saludo-mano inline-block origin-[70%_70%] text-[32px]">
            👋
          </span>
        </h1>
      </header>

      <Bento
        casino={casino}
        proximo={proximo}
        ultimoAviso={ultimoAviso}
        avisosDeLaSemana={avisosDeLaSemana}
        colaboradores={colaboradores}
      />

      {/* El resto de las secciones, en una tira que se desliza. Íconos en
          color pleno, como una pantalla de inicio de teléfono. */}
      <nav aria-label="Todas las secciones" className="mb-8">
        <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-3">
          Todo en la app
        </p>
        <ul className="no-scrollbar lista-animada -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
          {shortcuts.map((mod) => (
            <li key={mod.id} className="shrink-0">
              <Link
                to={mod.path}
                className="group flex w-[4.25rem] flex-col items-center gap-1.5 transition active:scale-90"
              >
                <span
                  className={cn(
                    'relative flex size-[3.75rem] items-center justify-center rounded-[1.3rem] shadow-card transition duration-200 group-hover:-translate-y-1 group-hover:rotate-[-4deg] group-hover:shadow-raised',
                    toneVivid[mod.tone],
                  )}
                >
                  <mod.icon size={25} strokeWidth={2.1} />
                  <Novedades modulo={mod.id} />
                </span>
                <span className="text-center text-[11px] font-semibold leading-tight text-ink">
                  {mod.nav.shortLabel ?? mod.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Comunicados del día a día (lo más operativo va primero). */}
      <section className="mb-7">
        <SectionHeader
          title="Comunicados"
          description="Avisos oficiales del Centro de Alumnos."
          to="/comunicados"
        />
        {announcements.isLoading ? (
          <CardListSkeleton count={2} />
        ) : latestAnnouncements.length === 0 ? (
          <Card>
            <p className="text-[13.5px] text-ink-2">No hay comunicados publicados por ahora.</p>
          </Card>
        ) : (
          <div className="lista-animada space-y-2.5">
            {latestAnnouncements.map((item) => (
              <AnnouncementCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Noticias destacadas */}
      <section className="mb-7">
        <SectionHeader title="Noticias" description="Lo más relevante para la comunidad." to="/noticias" />
        {news.isLoading ? (
          <CardListSkeleton count={2} />
        ) : featuredNews.length === 0 ? (
          <Card>
            <p className="text-[13.5px] text-ink-2">Todavía no hay noticias publicadas.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {lead ? <NewsFeatureCard post={lead} /> : null}
            {restNews.slice(0, 2).map((post) => (
              <NewsRowCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Próximos eventos, en carrusel horizontal */}
      <section className="mb-7">
        <SectionHeader title="Próximos eventos" to="/eventos" />
        {events.isLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : nextEvents.length === 0 ? (
          <Card>
            <p className="text-[13.5px] text-ink-2">No hay eventos programados por ahora.</p>
          </Card>
        ) : (
          /* `items-start`: cada tarjeta mide lo que mide su foto. Sin esto se
             estiran todas hasta la mas alta, y la de foto baja queda con un
             hueco vacio debajo del texto. */
          <div className="no-scrollbar -mx-4 flex items-start gap-3 overflow-x-auto px-4 pb-1">
            {nextEvents.map((event) => (
              <EventHighlightCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Convocatorias abiertas: son comunicados de tipo inscripción */}
      <section>
        <SectionHeader
          title="Inscripciones abiertas"
          description="Convocatorias vigentes del Centro de Alumnos."
          to="/comunicados"
        />
        {announcements.isLoading ? (
          <CardListSkeleton count={2} />
        ) : openInscriptions.length === 0 ? (
          <Card>
            <p className="text-[13.5px] text-ink-2">
              No hay convocatorias abiertas en este momento.
            </p>
          </Card>
        ) : (
          <div className="lista-animada space-y-2.5">
            {openInscriptions.map((item) => (
              <AnnouncementCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}

/**
 * El punto de "hay algo nuevo aqui" sobre el icono de una seccion. Es el mismo
 * dato que la barra de abajo; aqui se muestra sin numero, porque el icono ya
 * es chico y el numero exacto se ve al tocar.
 */
function Novedades({ modulo }: { modulo: string }) {
  const cuantas = useNovedadesDe(modulo);
  if (cuantas < 1) return null;

  return (
    <span
      aria-label="hay algo nuevo"
      className="absolute -right-1 -top-1 flex h-[21px] min-w-[21px] items-center justify-center rounded-full bg-accent-500 px-1 text-[11.5px] font-extrabold tabular-nums text-on-accent ring-[3px] ring-canvas"
    >
      {cuantas > 8 ? '+9' : cuantas}
    </span>
  );
}
