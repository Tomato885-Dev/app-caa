import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { db } from '@/core/data';
import { useCollection, useDataMutation } from '@/core/hooks/useData';
import type { ContentKind, ID, Report } from '@/core/types';
import { formatRelative } from '@/core/utils/date';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardListSkeleton,
  EmptyState,
  Page,
  PageHeader,
  SegmentedTabs,
  useToast,
} from '@/ui';

/* Gestión de reportes de la comunidad (§8.2). */

const kindLabel: Record<ContentKind, string> = {
  news: 'Noticia',
  event: 'Evento',
  signupActivity: 'Inscripción',
};

/** Ruta al contenido reportado dentro de su módulo. */
function hrefFor(report: Report): string | null {
  switch (report.contentKind) {
    case 'news':
      return `/noticias/${report.contentId}`;
    case 'event':
      return `/eventos/${report.contentId}`;
    case 'signupActivity':
      return `/inscripciones/${report.contentId}`;
    default:
      return null;
  }
}

export function ReportsPage() {
  const { data, isLoading } = useCollection('reports', db.reports);
  const notify = useToast();
  const [view, setView] = useState<'abiertos' | 'cerrados'>('abiertos');

  const resolve = useDataMutation(
    ({ id, state }: { id: ID; state: Report['state'] }) => db.reports.update(id, { state }),
    ['reports'],
  );

  const reports = data ?? [];
  const open = useMemo(() => reports.filter((r) => r.state === 'open'), [reports]);
  const closed = useMemo(() => reports.filter((r) => r.state !== 'open'), [reports]);
  const listed = view === 'abiertos' ? open : closed;

  const handleResolve = (id: ID, state: Report['state']) => {
    resolve.mutate(
      { id, state },
      {
        onSuccess: () =>
          notify(state === 'reviewed' ? 'Reporte marcado como revisado.' : 'Reporte descartado.', 'info'),
      },
    );
  };

  return (
    <Page>
      <PageHeader
        title="Reportes"
        description="Contenido señalado por la comunidad para revisión del equipo de moderación."
      />

      <SegmentedTabs
        className="mb-5"
        value={view}
        onChange={(value) => setView(value as 'abiertos' | 'cerrados')}
        options={[
          { value: 'abiertos', label: 'Abiertos', count: open.length },
          { value: 'cerrados', label: 'Cerrados', count: closed.length },
        ]}
      />

      {isLoading ? (
        <CardListSkeleton count={2} />
      ) : listed.length === 0 ? (
        <EmptyState
          icon={Flag}
          title={view === 'abiertos' ? 'Sin reportes pendientes' : 'Sin reportes cerrados'}
          description="Los reportes enviados por estudiantes aparecerán en esta lista."
        />
      ) : (
        <ul className="space-y-3">
          {listed.map((report) => {
            const href = hrefFor(report);

            return (
              <li key={report.id}>
                <Card>
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <Badge tone="danger">{report.reason}</Badge>
                    <Badge tone="neutral">{kindLabel[report.contentKind]}</Badge>
                    <span className="text-[11.5px] text-ink-3">
                      {formatRelative(report.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-[14.5px] font-bold leading-snug text-ink">
                    {report.contentTitle}
                  </h3>

                  {report.detail ? (
                    <p className="mt-1.5 rounded-lg bg-surface-2 p-2.5 text-[13px] leading-relaxed text-ink-2">
                      {report.detail}
                    </p>
                  ) : null}

                  <div className="mt-3 flex items-center gap-2.5">
                    <Avatar
                      name={report.reporter.name}
                      avatarKey={report.reporter.avatarKey}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-semibold text-ink">
                        {report.reporter.name}
                      </p>
                      <p className="text-[11.5px] text-ink-3">{report.reporter.grade}</p>
                    </div>
                    {href ? (
                      <Link
                        to={href}
                        className="shrink-0 text-[12.5px] font-semibold text-brand-600 dark:text-brand-300"
                      >
                        Ver contenido
                      </Link>
                    ) : null}
                  </div>

                  {report.state === 'open' ? (
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" onClick={() => handleResolve(report.id, 'reviewed')}>
                        Marcar como revisado
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResolve(report.id, 'dismissed')}
                      >
                        Descartar
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-3 text-[12.5px] font-semibold text-ink-3">
                      {report.state === 'reviewed' ? 'Revisado' : 'Descartado'}
                    </p>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </Page>
  );
}
