import { useParams } from 'react-router-dom';
import { CalendarClock, CheckCircle2, ExternalLink, FileQuestion, Mail } from 'lucide-react';
import { AppImage, Avatar, Badge, ButtonLink, Card, EmptyState, MetaRow, Page, Prose, Skeleton } from '@/ui';
import { useGroup } from './api';

export function CommunityDetailPage() {
  const { id } = useParams();
  const { data: group, isLoading } = useGroup(id);

  if (isLoading) {
    return (
      <Page>
        <Skeleton className="mb-4 aspect-[16/9] w-full" />
        <Skeleton className="mb-2 h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </Page>
    );
  }

  if (!group) {
    return (
      <Page>
        <EmptyState
          icon={FileQuestion}
          title="Espacio no encontrado"
          action={<ButtonLink to="/comunidad">Volver a comunidad</ButtonLink>}
        />
      </Page>
    );
  }

  return (
    <Page>
      <AppImage imageKey={group.coverImageKey} ratio="16/9" className="mb-4" />

      <div className="flex items-start gap-3.5">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-line">
          <AppImage imageKey={group.logoImageKey} ratio="1/1" compact rounded={false} />
        </div>
        <div className="min-w-0 pt-1">
          <Badge tone="brand" className="mb-1.5">
            {group.category}
          </Badge>
          <h1 className="text-[23px] font-extrabold leading-tight tracking-tight text-ink">
            {group.name}
          </h1>
        </div>
      </div>

      <p className="mt-3 text-[15px] font-medium leading-relaxed text-ink-2">
        {group.shortDescription}
      </p>

      <section className="mt-6">
        <h2 className="mb-2 text-[15px] font-bold text-ink">Quiénes somos</h2>
        <Prose text={group.about} />
      </section>

      {/* Objetivos (§6.6) */}
      <section className="mt-6">
        <h2 className="mb-2.5 text-[15px] font-bold text-ink">Objetivos</h2>
        <ul className="space-y-2">
          {group.goals.map((goal, index) => (
            <li key={index} className="flex gap-2.5">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-success-500" />
              <span className="text-[14px] leading-relaxed text-ink-2">{goal}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Cómo participar (§6.6) */}
      <Card className="mt-6 border-brand-200 bg-brand-50 dark:border-brand-700 dark:bg-brand-950">
        <h2 className="text-[15px] font-bold text-ink">Cómo participar</h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{group.howToJoin}</p>
      </Card>

      <Card className="mt-4 divide-y divide-line">
        {group.meetingInfo ? (
          <MetaRow icon={CalendarClock} label="Reuniones" value={group.meetingInfo} />
        ) : null}

        <div className="py-2.5">
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">
            Responsables
          </p>
          <ul className="mt-2 space-y-2">
            {group.leads.map((lead) => (
              <li key={lead.id} className="flex items-center gap-2.5">
                <Avatar name={lead.name} avatarKey={lead.avatarKey} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-semibold text-ink">{lead.name}</p>
                  <p className="text-[11.5px] text-ink-3">{lead.grade}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Enlaces de contacto (§6.6) */}
      {group.links.length > 0 ? (
        <section className="mt-4 space-y-2">
          {group.links.map((link, index) => (
            <a
              key={`${link.url}:${index}`}
              href={link.url}
              className="flex items-center gap-3 rounded-card border border-line bg-surface p-3.5 transition hover:border-line-strong"
            >
              {link.url.startsWith('mailto:') ? (
                <Mail size={17} className="shrink-0 text-ink-3" />
              ) : (
                <ExternalLink size={17} className="shrink-0 text-ink-3" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-ink">{link.label}</span>
                <span className="block truncate text-[12.5px] text-ink-3">
                  {link.url.replace(/^mailto:/, '')}
                </span>
              </span>
            </a>
          ))}
        </section>
      ) : null}
    </Page>
  );
}
