import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { appConfig } from '@/config/app.config';
import { useAuth } from '@/core/auth/AuthContext';
import { usePendingCount } from '@/core/moderation/useModerationQueue';
import { approvedOnly, canModerate } from '@/core/moderation/visibility';
import { getVisibleModules } from '@/core/modules/registry';
import { AnnouncementCard } from '@/modules/announcements/components/AnnouncementCard';
import { sortAnnouncements, useAnnouncementList } from '@/modules/announcements/api';
import { EventHighlightCard } from '@/modules/events/components/EventCard';
import { upcoming, useEventList } from '@/modules/events/api';
import { NewsFeatureCard, NewsRowCard } from '@/modules/news/components/NewsCard';
import { sortNews, useNewsList } from '@/modules/news/api';
import { ActivityCard } from '@/modules/signups/components/ActivityCard';
import { isOpen, useActivityList, useRegistrations } from '@/modules/signups/api';
import {
  Card,
  CardListSkeleton,
  Page,
  SectionHeader,
  Skeleton,
  cn,
  toneSoft,
} from '@/ui';

/* ============================================================================
   INICIO (§6.1)
   ----------------------------------------------------------------------------
   Vista rápida de la actividad escolar: noticias destacadas, próximos eventos,
   convocatorias abiertas y accesos directos al resto de la plataforma.

   Los accesos directos se generan desde el registro de módulos, de modo que un
   módulo nuevo aparece aquí sin editar esta pantalla.
   ========================================================================== */

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export function HomePage() {
  const { user, role } = useAuth();
  const pending = usePendingCount(canModerate(role));

  const announcements = useAnnouncementList();
  const news = useNewsList();
  const events = useEventList();
  const activities = useActivityList();
  const { data: registrationData } = useRegistrations();

  // Los comunicados fijados van primero: son los avisos vigentes del día.
  const latestAnnouncements = useMemo(
    () => sortAnnouncements(announcements.data ?? []).slice(0, 2),
    [announcements.data],
  );
  const featuredNews = useMemo(() => sortNews(approvedOnly(news.data ?? [])).slice(0, 4), [news.data]);
  const nextEvents = useMemo(() => upcoming(approvedOnly(events.data ?? [])).slice(0, 6), [events.data]);
  const openActivities = useMemo(
    () => approvedOnly(activities.data ?? []).filter(isOpen).slice(0, 3),
    [activities.data],
  );

  // Accesos directos: todos los módulos navegables menos Inicio y el perfil.
  const shortcuts = getVisibleModules(role).filter(
    (mod) => mod.id !== 'home' && mod.id !== 'profile' && mod.nav.section !== 'hidden',
  );

  const [lead, ...restNews] = featuredNews;

  return (
    <Page>
      <header className="mb-5">
        <p className="text-[13px] font-medium text-ink-3">{greeting()},</p>
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink">
          {user?.name.split(' ')[0] ?? appConfig.organization.shortName}
        </h1>
        <p className="mt-1 text-[13.5px] text-ink-2">
          Esto es lo que está pasando en la comunidad.
        </p>
      </header>

      {/* Aviso operativo para el equipo de moderación (§8.2). */}
      {canModerate(role) && pending > 0 ? (
        <Link to="/admin/moderacion" className="mb-5 block">
          <Card className="flex items-center gap-3 border-warning-500 bg-warning-100 dark:border-warning-700 dark:bg-warning-950">
            <ShieldCheck size={20} className="shrink-0 text-warning-700 dark:text-warning-300" />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-bold text-ink">
                {pending === 1
                  ? '1 publicación esperando revisión'
                  : `${pending} publicaciones esperando revisión`}
              </p>
              <p className="text-[12px] text-ink-2">Toca para ir a la cola de moderación.</p>
            </div>
            <ArrowRight size={17} className="shrink-0 text-ink-3" />
          </Card>
        </Link>
      ) : null}

      {/* Accesos directos a las funcionalidades principales (§6.1). */}
      <nav aria-label="Accesos directos" className="mb-7">
        <ul className="grid grid-cols-4 gap-2.5">
          {shortcuts.map((mod) => (
            <li key={mod.id}>
              <Link
                to={mod.path}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-surface p-2.5 transition hover:border-line-strong active:scale-[0.97]"
              >
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    toneSoft[mod.tone],
                  )}
                >
                  <mod.icon size={19} />
                </span>
                <span className="text-center text-[10.5px] font-semibold leading-tight text-ink-2">
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
          <div className="space-y-2.5">
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
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {nextEvents.map((event) => (
              <EventHighlightCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Convocatorias con inscripción abierta */}
      <section>
        <SectionHeader
          title="Inscripciones abiertas"
          description="Participa en las actividades disponibles."
          to="/inscripciones"
        />
        {activities.isLoading ? (
          <CardListSkeleton count={2} />
        ) : openActivities.length === 0 ? (
          <Card>
            <p className="text-[13.5px] text-ink-2">No hay convocatorias abiertas en este momento.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {openActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                registrations={registrationData ?? []}
              />
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}
