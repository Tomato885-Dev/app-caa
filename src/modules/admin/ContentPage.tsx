import { useState } from 'react';
import { FileStack, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthContext';
import { sportDisciplineLabel, sportLevelLabel } from '@/content/taxonomies';
import {
  ANNOUNCEMENT_PRIORITY_LABEL,
  OUTCOME_LABEL,
  type Announcement,
  type Benefit,
  type EventItem,
  type NewsPost,
  type Project,
  type SportsResult,
} from '@/core/types';
import { formatDate } from '@/core/utils/date';
import {
  sortAnnouncements,
  useAnnouncementList,
  useDeleteAnnouncement,
} from '@/modules/announcements/api';
import { sortBenefits, useBenefitList, useDeleteBenefit } from '@/modules/benefits/api';
import { useDeleteEvent, useEventList } from '@/modules/events/api';
import { useDeleteNews, useNewsList, sortNews } from '@/modules/news/api';
import { sortProjects, useDeleteProject, useProjectList, projectYears } from '@/modules/projects/api';
import { sortResults, useDeleteSportsResult, useSportsResults } from '@/modules/sports/api';
import {
  Button,
  Card,
  CardListSkeleton,
  EmptyState,
  FilterChips,
  IconButton,
  Page,
  PageHeader,
  useToast,
} from '@/ui';
import { AnnouncementFormSheet } from './components/AnnouncementFormSheet';
import { BenefitFormSheet } from './components/BenefitFormSheet';
import { EventFormSheet } from './components/EventFormSheet';
import { NewsFormSheet } from './components/NewsFormSheet';
import { ProjectFormSheet } from './components/ProjectFormSheet';
import { SportsResultFormSheet } from './components/SportsResultFormSheet';

/* ============================================================================
   GESTIÓN DE CONTENIDOS (§8.1)
   ----------------------------------------------------------------------------
   Publicación de todo el contenido oficial desde la propia app. Cada pestaña
   reutiliza el `api.ts` de su módulo: la administración no duplica lógica de
   datos.

   Las pestañas se desplazan horizontalmente, de modo que sumar un tipo de
   contenido nuevo no obliga a rediseñar esta pantalla.
   ========================================================================== */

type Tab =
  | 'comunicados'
  | 'noticias'
  | 'eventos'
  | 'beneficios'
  | 'resultados'
  | 'proyectos';

export function ContentPage() {
  const { user } = useAuth();
  const notify = useToast();
  const [tab, setTab] = useState<Tab>('comunicados');

  const announcements = useAnnouncementList();
  const news = useNewsList();
  const events = useEventList();
  const benefits = useBenefitList();
  const results = useSportsResults();
  const projects = useProjectList();

  const deleteAnnouncement = useDeleteAnnouncement();
  const deleteNews = useDeleteNews();
  const deleteEvent = useDeleteEvent();
  const deleteBenefit = useDeleteBenefit();
  const deleteResult = useDeleteSportsResult();
  const deleteProject = useDeleteProject();

  const [announcementForm, setAnnouncementForm] = useState<{
    open: boolean;
    editing: Announcement | null;
  }>({ open: false, editing: null });
  const [newsForm, setNewsForm] = useState<{ open: boolean; editing: NewsPost | null }>({
    open: false,
    editing: null,
  });
  const [eventForm, setEventForm] = useState<{ open: boolean; editing: EventItem | null }>({
    open: false,
    editing: null,
  });
  const [benefitForm, setBenefitForm] = useState<{ open: boolean; editing: Benefit | null }>({
    open: false,
    editing: null,
  });
  const [resultForm, setResultForm] = useState<{ open: boolean; editing: SportsResult | null }>({
    open: false,
    editing: null,
  });
  const [projectForm, setProjectForm] = useState<{ open: boolean; editing: Project | null }>({
    open: false,
    editing: null,
  });

  if (!user) return null;

  const queries = {
    comunicados: announcements,
    noticias: news,
    eventos: events,
    beneficios: benefits,
    resultados: results,
    proyectos: projects,
  } as const;

  const current = queries[tab];
  const isEmpty = (current.data ?? []).length === 0;

  const handleCreate = () => {
    if (tab === 'comunicados') setAnnouncementForm({ open: true, editing: null });
    if (tab === 'noticias') setNewsForm({ open: true, editing: null });
    if (tab === 'eventos') setEventForm({ open: true, editing: null });
    if (tab === 'beneficios') setBenefitForm({ open: true, editing: null });
    if (tab === 'resultados') setResultForm({ open: true, editing: null });
    if (tab === 'proyectos') setProjectForm({ open: true, editing: null });
  };

  const confirmDelete = (title: string) =>
    window.confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`);

  return (
    <Page>
      <PageHeader
        title="Contenidos"
        description="Publica y mantiene al día la información oficial de la plataforma."
        action={
          <Button icon={Plus} size="sm" onClick={handleCreate}>
            Crear
          </Button>
        }
      />

      <FilterChips
        className="mb-5"
        value={tab}
        onChange={(value) => setTab(value as Tab)}
        options={[
          { value: 'comunicados', label: 'Comunicados', count: announcements.data?.length ?? 0 },
          { value: 'noticias', label: 'Noticias', count: news.data?.length ?? 0 },
          { value: 'eventos', label: 'Eventos', count: events.data?.length ?? 0 },
          { value: 'beneficios', label: 'Colaboradores', count: benefits.data?.length ?? 0 },
          { value: 'resultados', label: '365', count: results.data?.length ?? 0 },
          { value: 'proyectos', label: 'Proyectos', count: projects.data?.length ?? 0 },
        ]}
      />

      {current.isLoading ? (
        <CardListSkeleton count={3} />
      ) : isEmpty ? (
        <EmptyState
          icon={FileStack}
          title="Sin contenidos publicados"
          description="Crea el primero con el botón de arriba."
          action={<Button onClick={handleCreate}>Crear</Button>}
        />
      ) : (
        <div className="space-y-2.5">
          {tab === 'comunicados' &&
            sortAnnouncements(announcements.data ?? []).map((item) => (
              <ContentRow
                key={item.id}
                title={item.title}
                meta={`${ANNOUNCEMENT_PRIORITY_LABEL[item.priority]} · ${item.audience} · ${formatDate(
                  item.publishedAt,
                )}${item.pinned ? ' · Fijado' : ''}`}
                onEdit={() => setAnnouncementForm({ open: true, editing: item })}
                onDelete={() => {
                  if (!confirmDelete(item.title)) return;
                  deleteAnnouncement.mutate(item.id, {
                    onSuccess: () => notify('Comunicado eliminado.', 'info'),
                  });
                }}
              />
            ))}

          {tab === 'noticias' &&
            sortNews(news.data ?? []).map((post) => (
              <ContentRow
                key={post.id}
                title={post.title}
                meta={`${post.category} · ${formatDate(post.publishedAt)}${post.featured ? ' · Destacada' : ''}`}
                onEdit={() => setNewsForm({ open: true, editing: post })}
                onDelete={() => {
                  if (!confirmDelete(post.title)) return;
                  deleteNews.mutate(post.id, { onSuccess: () => notify('Noticia eliminada.', 'info') });
                }}
              />
            ))}

          {tab === 'eventos' &&
            (events.data ?? []).map((event) => (
              <ContentRow
                key={event.id}
                title={event.title}
                meta={`${event.category} · ${formatDate(event.startsAt)} · ${event.location}`}
                onEdit={() => setEventForm({ open: true, editing: event })}
                onDelete={() => {
                  if (!confirmDelete(event.title)) return;
                  deleteEvent.mutate(event.id, { onSuccess: () => notify('Evento eliminado.', 'info') });
                }}
              />
            ))}


          {tab === 'beneficios' &&
            sortBenefits(benefits.data ?? []).map((benefit) => (
              <ContentRow
                key={benefit.id}
                title={`${benefit.name} · ${benefit.partner}`}
                meta={`${benefit.category} · ${benefit.active ? 'activo' : 'inactivo'}${
                  benefit.validUntil ? ` · hasta el ${formatDate(benefit.validUntil)}` : ''
                }`}
                onEdit={() => setBenefitForm({ open: true, editing: benefit })}
                onDelete={() => {
                  if (!confirmDelete(benefit.name)) return;
                  deleteBenefit.mutate(benefit.id, {
                    onSuccess: () => notify('Beneficio eliminado.', 'info'),
                  });
                }}
              />
            ))}

          {tab === 'resultados' &&
            sortResults(results.data ?? []).map((result) => (
              <ContentRow
                key={result.id}
                title={`${sportDisciplineLabel[result.discipline]} ${sportLevelLabel[result.level]} · ${result.opponent}`}
                meta={`${OUTCOME_LABEL[result.outcome]}${
                  result.scoreFor !== null && result.scoreAgainst !== null
                    ? ` ${result.scoreFor}-${result.scoreAgainst}`
                    : ''
                } · ${formatDate(result.playedAt)}`}
                onEdit={() => setResultForm({ open: true, editing: result })}
                onDelete={() => {
                  if (!confirmDelete(`${sportDisciplineLabel[result.discipline]} vs. ${result.opponent}`))
                    return;
                  deleteResult.mutate(result.id, {
                    onSuccess: () => notify('Resultado eliminado.', 'info'),
                  });
                }}
              />
            ))}

          {tab === 'proyectos' &&
            sortProjects(projects.data ?? []).map((project) => (
              <ContentRow
                key={project.id}
                title={project.title}
                meta={`${project.area} · ${projectYears(project)} · ${
                  project.status === 'activo' ? 'en marcha' : 'histórico'
                }`}
                onEdit={() => setProjectForm({ open: true, editing: project })}
                onDelete={() => {
                  if (!confirmDelete(project.title)) return;
                  deleteProject.mutate(project.id, {
                    onSuccess: () => notify('Proyecto eliminado.', 'info'),
                  });
                }}
              />
            ))}
        </div>
      )}

      <AnnouncementFormSheet
        open={announcementForm.open}
        editing={announcementForm.editing}
        user={user}
        onClose={() => setAnnouncementForm({ open: false, editing: null })}
      />
      <NewsFormSheet
        open={newsForm.open}
        editing={newsForm.editing}
        user={user}
        onClose={() => setNewsForm({ open: false, editing: null })}
      />
      <EventFormSheet
        open={eventForm.open}
        editing={eventForm.editing}
        user={user}
        onClose={() => setEventForm({ open: false, editing: null })}
      />
      <BenefitFormSheet
        open={benefitForm.open}
        editing={benefitForm.editing}
        onClose={() => setBenefitForm({ open: false, editing: null })}
      />
      <SportsResultFormSheet
        open={resultForm.open}
        editing={resultForm.editing}
        user={user}
        onClose={() => setResultForm({ open: false, editing: null })}
      />
      <ProjectFormSheet
        open={projectForm.open}
        editing={projectForm.editing}
        onClose={() => setProjectForm({ open: false, editing: null })}
      />
    </Page>
  );
}

function ContentRow({
  title,
  meta,
  onEdit,
  onDelete,
}: {
  title: string;
  meta: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-ink">{title}</p>
        <p className="truncate text-[12px] text-ink-3">{meta}</p>
      </div>
      <IconButton icon={Pencil} label={`Editar ${title}`} onClick={onEdit} />
      <IconButton
        icon={Trash2}
        label={`Eliminar ${title}`}
        onClick={onDelete}
        className="hover:text-danger-500"
      />
    </Card>
  );
}
