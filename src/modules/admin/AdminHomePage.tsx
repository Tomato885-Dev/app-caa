import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  Download,
  FileStack,
  Flag,
  ShieldCheck,
  UserCog,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/core/auth/AuthContext';
import { usingOwnContent } from '@/content/seed';
import { usingServer } from '@/core/data';
import { db } from '@/core/data';
import { useCollection } from '@/core/hooks/useData';
import { useModerationQueue } from '@/core/moderation/useModerationQueue';
import { Badge, Button, Card, Page, PageHeader, accentSolid, cn, toneSoft, useToast, type Tone } from '@/ui';
import {
  COLLECTION_LABEL,
  EXPORTED_COLLECTIONS,
  downloadContentSnapshot,
  getPendingChanges,
  type ExportCounts,
  type PendingChanges,
} from './exportContent';

/* Panel de administración (§8). Reúne las tareas de moderadores y
   administradores; cada tarjeta lleva a una herramienta específica. */

export function AdminHomePage() {
  const { hasRole } = useAuth();
  const notify = useToast();
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState<ExportCounts | null>(null);
  const [pendingExport, setPendingExport] = useState<PendingChanges | null>(null);

  /* Cuánto trabajo hay en este navegador que todavía no está en el proyecto.
     Se recalcula al entrar al panel y después de cada exportación. */
  const refreshPending = useCallback(() => {
    void getPendingChanges().then(setPendingExport);
  }, []);

  useEffect(refreshPending, [refreshPending]);
  const { data: queue } = useModerationQueue();
  const { data: reports } = useCollection('reports', db.reports);

  const pending = queue?.pending.length ?? 0;
  const openReports = (reports ?? []).filter((report) => report.state === 'open').length;

  const tools: {
    to: string;
    icon: LucideIcon;
    tone: Tone;
    title: string;
    description: string;
    count?: number;
    adminOnly?: boolean;
  }[] = [
    {
      to: '/admin/moderacion',
      icon: ShieldCheck,
      tone: 'warning',
      title: 'Cola de revisión',
      description: 'Aprobar, rechazar o solicitar cambios en las publicaciones.',
      count: pending,
    },
    {
      to: '/admin/reportes',
      icon: Flag,
      tone: 'danger',
      title: 'Reportes',
      description: 'Revisar el contenido reportado por la comunidad.',
      count: openReports,
    },
    {
      to: '/admin/contenidos',
      icon: FileStack,
      tone: 'brand',
      title: 'Contenidos',
      description: 'Publicar noticias, eventos y convocatorias de inscripción.',
      adminOnly: true,
    },
    {
      to: '/admin/usuarios',
      icon: UserCog,
      tone: 'info',
      title: 'Cuentas y permisos',
      description: 'Asignar roles y gestionar el acceso a la plataforma.',
      adminOnly: true,
    },
  ];

  const visibleTools = tools.filter((tool) => !tool.adminOnly || hasRole('admin'));

  return (
    <Page>
      <PageHeader
        title="Administración"
        description="Gestión compartida entre el Centro de Alumnos y los equipos designados por la institución."
      />

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="text-[28px] font-extrabold leading-none text-ink">{pending}</p>
          <p className="mt-1.5 text-[12.5px] font-medium text-ink-2">En revisión</p>
        </Card>
        <Card className="text-center">
          <p className="text-[28px] font-extrabold leading-none text-ink">{openReports}</p>
          <p className="mt-1.5 text-[12.5px] font-medium text-ink-2">Reportes abiertos</p>
        </Card>
      </div>

      <ul className="space-y-2.5">
        {visibleTools.map((tool) => (
          <li key={tool.to}>
            <Link
              to={tool.to}
              className="flex items-center gap-3.5 rounded-card border border-line bg-surface p-4 transition hover:border-line-strong hover:shadow-raised"
            >
              <span
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  toneSoft[tool.tone],
                )}
              >
                <tool.icon size={20} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[14.5px] font-bold text-ink">{tool.title}</span>
                  {tool.count ? (
                    <span className={cn('rounded-full px-1.5 py-0.5 text-[10.5px] font-bold', accentSolid)}>
                      {tool.count}
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-[12.5px] leading-relaxed text-ink-2">
                  {tool.description}
                </span>
              </span>

              <ChevronRight size={17} className="shrink-0 text-ink-3" />
            </Link>
          </li>
        ))}
      </ul>

      {hasRole('admin') ? <ExportCard
        exporting={exporting}
        exported={exported}
        pending={pendingExport}
        onExport={async () => {
          setExporting(true);
          try {
            const { counts, total } = await downloadContentSnapshot();
            setExported(counts);
            notify(`Se exportaron ${total} elementos a contenido.json.`);
          } catch {
            notify('No fue posible exportar el contenido.', 'error');
          } finally {
            setExporting(false);
            refreshPending();
          }
        }}
      /> : null}
    </Page>
  );
}

/* ----------------------------------------------------------------------------
   GUARDAR EL CONTENIDO EN FIRME
   Lo que se publica desde la app vive en este navegador. Este botón lo convierte
   en un archivo del proyecto, que es lo que ve todo el mundo al abrir la app.
   -------------------------------------------------------------------------- */

function ExportCard({
  exporting,
  exported,
  pending,
  onExport,
}: {
  exporting: boolean;
  exported: ExportCounts | null;
  pending: PendingChanges | null;
  onExport: () => void;
}) {
  const partes = pending
    ? [
        pending.added ? `${pending.added} nuevo${pending.added === 1 ? '' : 's'}` : null,
        pending.edited ? `${pending.edited} editado${pending.edited === 1 ? '' : 's'}` : null,
        pending.removed ? `${pending.removed} eliminado${pending.removed === 1 ? '' : 's'}` : null,
      ].filter(Boolean)
    : [];

  return (
    <Card className="mt-6">
      <div className="flex items-start gap-3">
        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', toneSoft.accent)}>
          <Download size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[14.5px] font-bold text-ink">
              {usingServer ? 'Copia de seguridad' : 'Exportar contenido'}
            </h2>
            <Badge tone={usingServer || usingOwnContent ? 'brand' : 'neutral'}>
              {usingServer
                ? 'Servidor conectado'
                : usingOwnContent
                  ? 'Contenido propio'
                  : 'Contenido de ejemplo'}
            </Badge>
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">
            {usingServer
              ? 'Lo que publicas ya se guarda en el servidor y lo ve toda la comunidad al instante: no hay que exportar nada. Este botón descarga una copia de respaldo, por si algún día quieres tenerla guardada aparte.'
              : 'Guarda todo lo que has publicado en un archivo del proyecto, para que deje de depender de este navegador y sea lo que vean todos al abrir la aplicación.'}
          </p>
        </div>
      </div>

      {/* Aviso del trabajo que solo existe en este navegador. */}
      {pending ? (
        pending.total > 0 ? (
          <div className={cn('mt-3.5 rounded-field p-3.5', toneSoft.accent)}>
            <p className="text-[13px] font-bold">
              {pending.total === 1
                ? 'Tienes 1 cambio sin exportar'
                : `Tienes ${pending.total} cambios sin exportar`}
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed">
              {partes.join(' · ')}. Solo existen en este navegador: expórtalos para que queden
              guardados en el proyecto.
            </p>
          </div>
        ) : (
          <div className="mt-3.5 flex items-center gap-2 rounded-field border border-line bg-surface-2 p-3.5">
            <Check size={16} className="shrink-0 text-brand-500 dark:text-brand-300" />
            <p className="text-[12.5px] text-ink-2">
              No hay cambios pendientes: lo que ves es lo que está guardado.
            </p>
          </div>
        )
      ) : null}

      <Button
        variant="secondary"
        icon={Download}
        loading={exporting}
        onClick={onExport}
        className="mt-3.5 w-full"
      >
        {usingServer ? 'Descargar copia de seguridad' : 'Exportar contenido'}
      </Button>

      {exported ? (
        <div className="mt-3.5 rounded-field border border-line bg-surface-2 p-3.5">
          <p className="text-[12.5px] font-bold text-ink">Se descargó contenido.json con:</p>
          <ul className="mt-2 space-y-1">
            {EXPORTED_COLLECTIONS.map((name) => (
              <li key={name} className="flex justify-between text-[12.5px] text-ink-2">
                <span>{COLLECTION_LABEL[name]}</span>
                <span className="font-semibold text-ink">{exported[name]}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-line pt-3 text-[12.5px] leading-relaxed text-ink-2">
            {usingServer ? (
              'Guarda el archivo donde quieras. Es solo un respaldo: el contenido vivo está en el servidor.'
            ) : (
              <>
                Ahora guarda ese archivo en la carpeta{' '}
                <span className="font-bold text-ink">src/content/seed/</span> del proyecto,
                reemplazando el que haya. Con eso queda grabado.
              </>
            )}
          </p>
        </div>
      ) : null}
    </Card>
  );
}
