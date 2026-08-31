import { useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { signupKinds } from '@/content/taxonomies';
import { useAuth } from '@/core/auth/AuthContext';
import { approvedOnly } from '@/core/moderation/visibility';
import { CardListSkeleton, EmptyState, FilterChips, Page, PageHeader, SegmentedTabs } from '@/ui';
import { findRegistration, isOpen, useActivityList, useRegistrations } from './api';
import { ActivityCard } from './components/ActivityCard';

const ALL = 'todas';

export function SignupsListPage() {
  const { user } = useAuth();
  const { data, isLoading } = useActivityList();
  const { data: registrationData } = useRegistrations();
  const [view, setView] = useState<'abiertas' | 'mias'>('abiertas');
  const [kind, setKind] = useState(ALL);

  const registrations = registrationData ?? [];
  const activities = useMemo(() => approvedOnly(data ?? []), [data]);

  const openActivities = useMemo(() => activities.filter(isOpen), [activities]);
  const myActivities = useMemo(
    () => (user ? activities.filter((a) => findRegistration(registrations, a.id, user.id)) : []),
    [activities, registrations, user],
  );

  const source = view === 'abiertas' ? openActivities : myActivities;
  const filtered = useMemo(
    () => source.filter((activity) => kind === ALL || activity.kind === kind),
    [source, kind],
  );

  const options = useMemo(
    () => [
      { value: ALL, label: 'Todas', count: source.length },
      ...signupKinds
        .map((option) => ({
          value: option.value,
          label: option.label,
          count: source.filter((activity) => activity.kind === option.value).length,
        }))
        .filter((option) => option.count > 0),
    ],
    [source],
  );

  return (
    <Page>
      <PageHeader
        title="Inscripciones"
        description="Actividades, proyectos e iniciativas con cupos abiertos para participar."
      />

      <SegmentedTabs
        className="mb-3"
        value={view}
        onChange={(value) => setView(value as 'abiertas' | 'mias')}
        options={[
          { value: 'abiertas', label: 'Abiertas', count: openActivities.length },
          { value: 'mias', label: 'Mis inscripciones', count: myActivities.length },
        ]}
      />

      <FilterChips options={options} value={kind} onChange={setKind} className="mb-5" />

      {isLoading ? (
        <CardListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={view === 'abiertas' ? 'Sin convocatorias abiertas' : 'Aún no tienes inscripciones'}
          description={
            view === 'abiertas'
              ? 'Cuando se abran nuevas convocatorias aparecerán aquí.'
              : 'Inscríbete en una actividad y la verás en esta pestaña.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              registrations={registrations}
              registered={Boolean(user && findRegistration(registrations, activity.id, user.id))}
            />
          ))}
        </div>
      )}
    </Page>
  );
}
