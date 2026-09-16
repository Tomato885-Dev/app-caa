import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { appConfig } from '@/config/app.config';
import { useAuth } from '@/core/auth/AuthContext';
import { approvedOnly } from '@/core/moderation/visibility';
import { getVisibleModules } from '@/core/modules/registry';
import { faltaPara, formatDayMonth } from '@/core/utils/date';
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
import { HoyEnElCasino } from '@/modules/casino/components/HoyEnElCasino';
import { NewsFeatureCard, NewsRowCard } from '@/modules/news/components/NewsCard';
import { sortNews, useNewsList } from '@/modules/news/api';
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

  // Accesos directos: todos los módulos navegables menos Inicio y el perfil.
  const shortcuts = getVisibleModules(role).filter(
    (mod) => mod.id !== 'home' && mod.id !== 'profile' && mod.nav.section !== 'hidden',
  );

  const [lead, ...restNews] = featuredNews;

  return (
    <Page>
      {/* El saludo, en el verde del colegio, con lo que viene: el próximo evento
          y cuánto falta. Es lo primero que se ve al abrir la app, y responde
          la pregunta con que casi todos la abren.

          La decoración es verde y amarilla plana, sin transparencias: dos
          círculos, un aro amarillo y una grilla de puntos, para que la portada
          se sienta viva sin competir con el texto. */}
      <header className="animate-in-up relative mb-6 overflow-hidden rounded-[1.5rem] bg-brand-500 p-5 pb-4 text-white shadow-raised">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-14 -top-16 size-44 rounded-full bg-brand-600"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-14 right-20 size-28 rounded-full bg-brand-400"
        />
        <span
          aria-hidden
          className="aro-flotante pointer-events-none absolute right-6 top-5 size-14 rounded-full border-[6px] border-accent-500"
        />
        <svg
          aria-hidden
          className="pointer-events-none absolute right-5 top-[5.5rem] text-brand-300"
          width="54"
          height="30"
          viewBox="0 0 54 30"
        >
          {[0, 1, 2].map((fila) =>
            [0, 1, 2, 3, 4].map((col) => (
              <circle key={`${fila}-${col}`} cx={3 + col * 12} cy={3 + fila * 12} r="2" fill="currentColor" />
            )),
          )}
        </svg>

        <div className="relative">
          <p className="inline-flex rounded-full bg-brand-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-500">
            {hoyEnPalabras()}
          </p>
          <p className="mt-3 text-[14px] font-medium text-brand-100">{greeting()},</p>
          <h1 className="flex items-center gap-2 text-[30px] font-extrabold leading-tight tracking-tight text-white">
            {user ? nombreDePila(user.name, user.email) : appConfig.organization.shortName}
            <span aria-hidden className="saludo-mano inline-block origin-[70%_70%] text-[26px]">
              👋
            </span>
          </h1>

          {proximo ? (
            <Link
              to={`/eventos/${proximo.id}`}
              className="mt-4 flex items-center gap-3 rounded-xl bg-brand-700 p-3 transition active:scale-[0.98]"
            >
              <span className="shrink-0 rounded-lg bg-accent-500 px-2.5 py-1.5 text-[12px] font-extrabold leading-none text-on-accent">
                {faltaPara(proximo.startsAt, proximo.endsAt) ?? formatDayMonth(proximo.startsAt)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10.5px] font-bold uppercase tracking-wider text-brand-200">
                  Próximo evento
                </span>
                <span className="block truncate text-[14px] font-bold text-white">
                  {proximo.title}
                </span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-brand-200" />
            </Link>
          ) : (
            <p className="mt-1 text-[13.5px] text-brand-100">
              Esto es lo que está pasando en la comunidad.
            </p>
          )}
        </div>
      </header>

      {/* Accesos directos a las funcionalidades principales (§6.1). */}
      <nav aria-label="Accesos directos" className="mb-8">
        <ul className="lista-animada grid grid-cols-4 gap-x-2 gap-y-4">
          {shortcuts.map((mod) => (
            <li key={mod.id}>
              {/* Íconos en color pleno, como los de una pantalla de inicio de
                  teléfono: se reconocen de lejos y hacen que la portada invite
                  a tocar. */}
              <Link
                to={mod.path}
                className="group flex flex-col items-center gap-1.5 transition active:scale-90"
              >
                <span
                  className={cn(
                    'flex size-14 items-center justify-center rounded-[1.1rem] shadow-card transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-raised',
                    toneVivid[mod.tone],
                  )}
                >
                  <mod.icon size={24} strokeWidth={2.1} />
                </span>
                <span className="text-center text-[11px] font-semibold leading-tight text-ink">
                  {mod.nav.shortLabel ?? mod.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Lo que se come hoy: lo que más gente mira cada día. */}
      <HoyEnElCasino />

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
