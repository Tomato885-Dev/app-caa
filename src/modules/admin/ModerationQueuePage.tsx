import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, PenLine, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthContext';
import { useModerationQueue } from '@/core/moderation/useModerationQueue';
import { getModerationSources } from '@/core/modules/registry';
import type { ModerationItem } from '@/core/modules/types';
import type { ModerationStatus } from '@/core/types';
import { formatRelative } from '@/core/utils/date';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardListSkeleton,
  EmptyState,
  FilterChips,
  Page,
  PageHeader,
  SegmentedTabs,
  Sheet,
  StatusBadge,
  TextField,
  useToast,
} from '@/ui';

/* ============================================================================
   COLA DE REVISIÓN (§7.1)
   ----------------------------------------------------------------------------
   Trabaja sobre las fuentes declaradas por cada módulo. Un módulo nuevo con
   contenido moderable aparece aquí automáticamente.
   ========================================================================== */

const ALL = 'todos';

type Decision = Extract<ModerationStatus, 'approved' | 'rejected' | 'changes_requested'>;

const decisionCopy: Record<Decision, { title: string; action: string; hint: string }> = {
  approved: {
    title: 'Aprobar publicación',
    action: 'Aprobar y publicar',
    hint: 'Quedará visible para toda la comunidad.',
  },
  rejected: {
    title: 'Rechazar publicación',
    action: 'Rechazar',
    hint: 'Explica el motivo: el autor verá tu comentario.',
  },
  changes_requested: {
    title: 'Solicitar cambios',
    action: 'Solicitar cambios',
    hint: 'Indica con claridad qué debe ajustarse antes de publicar.',
  },
};

export function ModerationQueuePage() {
  const { user } = useAuth();
  const notify = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useModerationQueue();

  const [view, setView] = useState<'pendientes' | 'historial'>('pendientes');
  const [kind, setKind] = useState(ALL);
  const [target, setTarget] = useState<{ item: ModerationItem; decision: Decision } | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const sources = getModerationSources();
  const items = data?.items ?? [];

  const source = useMemo(
    () =>
      view === 'pendientes'
        ? items.filter((item) => item.status === 'pending')
        : items.filter((item) => item.status !== 'pending'),
    [items, view],
  );

  const filtered = useMemo(
    () => source.filter((item) => kind === ALL || item.kind === kind),
    [source, kind],
  );

  const options = useMemo(
    () => [
      { value: ALL, label: 'Todo', count: source.length },
      ...sources
        .map((entry) => ({
          value: entry.kind,
          label: entry.pluralLabel,
          count: source.filter((item) => item.kind === entry.kind).length,
        }))
        .filter((option) => option.count > 0),
    ],
    [source, sources],
  );

  const applyDecision = async () => {
    if (!target || !user) return;

    const handler = sources.find((entry) => entry.kind === target.item.kind);
    if (!handler) return;

    // Rechazar o pedir cambios sin explicación deja al autor sin información útil.
    if (target.decision !== 'approved' && note.trim().length < 5) return;

    setSaving(true);
    try {
      await handler.decide({
        id: target.item.id,
        status: target.decision,
        note: note.trim() || undefined,
        moderatorId: user.id,
      });
      await queryClient.invalidateQueries();
      notify(
        target.decision === 'approved'
          ? 'Publicación aprobada.'
          : target.decision === 'rejected'
            ? 'Publicación rechazada.'
            : 'Se solicitaron cambios al autor.',
        target.decision === 'rejected' ? 'error' : 'success',
      );
      setTarget(null);
      setNote('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page>
      <PageHeader
        title="Cola de revisión"
        description="Toda publicación de estudiantes se revisa antes de ser visible para la comunidad."
      />

      <SegmentedTabs
        className="mb-3"
        value={view}
        onChange={(value) => setView(value as 'pendientes' | 'historial')}
        options={[
          {
            value: 'pendientes',
            label: 'Pendientes',
            count: items.filter((item) => item.status === 'pending').length,
          },
          { value: 'historial', label: 'Revisadas' },
        ]}
      />

      <FilterChips options={options} value={kind} onChange={setKind} className="mb-5" />

      {isLoading ? (
        <CardListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={view === 'pendientes' ? 'No hay nada por revisar' : 'Sin publicaciones revisadas'}
          description={
            view === 'pendientes'
              ? 'Todas las publicaciones están al día. Buen trabajo.'
              : 'Aquí aparecerá el historial de decisiones de moderación.'
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((item) => {
            const label = sources.find((entry) => entry.kind === item.kind)?.label ?? item.kind;

            return (
              <li key={`${item.kind}:${item.id}`}>
                <Card>
                  <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                    <Badge tone="neutral">{label}</Badge>
                    <StatusBadge status={item.status} />
                    <span className="text-[11.5px] text-ink-3">{formatRelative(item.createdAt)}</span>
                  </div>

                  <h3 className="text-[15px] font-bold leading-snug text-ink">{item.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{item.excerpt}</p>

                  <div className="mt-3 flex items-center gap-2.5">
                    <Avatar name={item.author.name} avatarKey={item.author.avatarKey} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-semibold text-ink">
                        {item.author.name}
                      </p>
                      <p className="text-[11.5px] text-ink-3">{item.author.grade}</p>
                    </div>
                    {item.href ? (
                      <Link
                        to={item.href}
                        className="shrink-0 text-[12.5px] font-semibold text-brand-600 dark:text-brand-300"
                      >
                        Ver en contexto
                      </Link>
                    ) : null}
                  </div>

                  {item.status === 'pending' ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => {
                          setTarget({ item, decision: 'approved' });
                          setNote('');
                        }}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={PenLine}
                        onClick={() => {
                          setTarget({ item, decision: 'changes_requested' });
                          setNote('');
                        }}
                      >
                        Pedir cambios
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={XCircle}
                        onClick={() => {
                          setTarget({ item, decision: 'rejected' });
                          setNote('');
                        }}
                      >
                        Rechazar
                      </Button>
                    </div>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Sheet
        open={target !== null}
        onClose={() => setTarget(null)}
        title={target ? decisionCopy[target.decision].title : ''}
        description={target?.item.title}
        footer={
          <Button
            size="lg"
            variant={target?.decision === 'rejected' ? 'danger' : 'primary'}
            onClick={applyDecision}
            loading={saving}
            className="w-full"
          >
            {target ? decisionCopy[target.decision].action : ''}
          </Button>
        }
      >
        <TextField
          label={target?.decision === 'approved' ? 'Comentario (opcional)' : 'Comentario para el autor'}
          required={target?.decision !== 'approved'}
          multiline
          rows={4}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          hint={target ? decisionCopy[target.decision].hint : ''}
          error={
            target && target.decision !== 'approved' && note.length > 0 && note.trim().length < 5
              ? 'Escribe un comentario más explicativo.'
              : undefined
          }
        />
      </Sheet>
    </Page>
  );
}
