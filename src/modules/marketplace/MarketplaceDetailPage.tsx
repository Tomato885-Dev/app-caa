import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileQuestion, Flag, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthContext';
import { isVisibleTo } from '@/core/moderation/visibility';
import { formatDate } from '@/core/utils/date';
import { ModerationNotice } from '@/shared/ModerationNotice';
import { ReportSheet } from '@/shared/ReportSheet';
import {
  AppImage,
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  Page,
  Prose,
  Skeleton,
} from '@/ui';
import { useListing } from './api';

export function MarketplaceDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: listing, isLoading } = useListing(id);
  const [reportOpen, setReportOpen] = useState(false);

  if (isLoading) {
    return (
      <Page>
        <Skeleton className="mb-4 aspect-square w-full" />
        <Skeleton className="mb-2 h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </Page>
    );
  }

  if (!listing || !isVisibleTo(listing, user)) {
    return (
      <Page>
        <EmptyState
          icon={FileQuestion}
          title="Publicación no disponible"
          description="Puede haber sido retirada o estar aún en revisión."
          action={<ButtonLink to="/marketplace">Volver al marketplace</ButtonLink>}
        />
      </Page>
    );
  }

  const isSeller = user?.id === listing.seller.id;

  return (
    <Page>
      {isSeller ? (
        <div className="mb-4">
          <ModerationNotice item={listing} />
        </div>
      ) : null}

      {/* Galería: una imagen por clave del manifiesto de contenido. */}
      <div className="mb-5 grid grid-cols-1 gap-2">
        <AppImage imageKey={listing.imageKeys[0]} ratio="1/1" />
        {listing.imageKeys.length > 1 ? (
          <div className="grid grid-cols-3 gap-2">
            {listing.imageKeys.slice(1, 4).map((key) => (
              <AppImage key={key} imageKey={key} ratio="1/1" compact />
            ))}
          </div>
        ) : null}
      </div>

      <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
        <Badge tone={listing.type === 'producto' ? 'brand' : 'info'}>
          {listing.type === 'producto' ? 'Producto' : 'Servicio'}
        </Badge>
        <Badge tone="neutral">{listing.category}</Badge>
      </div>

      <h1 className="text-[23px] font-extrabold leading-tight tracking-tight text-ink">
        {listing.title}
      </h1>

      <p className="mt-2 text-[19px] font-extrabold text-brand-600 dark:text-brand-300">
        {listing.priceLabel}
      </p>

      <Card className="my-5">
        <div className="flex items-center gap-3">
          <Avatar name={listing.seller.name} avatarKey={listing.seller.avatarKey} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold text-ink">{listing.seller.name}</p>
            <p className="text-[12.5px] text-ink-3">
              {listing.seller.grade} · Publicado el {formatDate(listing.createdAt)}
            </p>
          </div>
        </div>

        <a href={listing.contact.url} className="mt-4 block">
          <span className="flex h-12 w-full items-center justify-center gap-2 rounded-field bg-brand-500 text-[15px] font-semibold text-white transition hover:bg-brand-600">
            <Mail size={17} />
            {listing.contact.label}
          </span>
        </a>

        <p className="mt-2.5 text-center text-[11.5px] leading-relaxed text-ink-3">
          El contacto y el acuerdo se realizan fuera de la plataforma.
        </p>
      </Card>

      <h2 className="mb-2 text-[15px] font-bold text-ink">Descripción</h2>
      <Prose text={listing.description} />

      <div className="mt-6 flex items-start gap-2.5 rounded-field border border-line bg-surface-2 p-3.5">
        <ShieldAlert size={17} className="mt-0.5 shrink-0 text-ink-3" />
        <p className="text-[12.5px] leading-relaxed text-ink-2">
          La plataforma actúa solo como medio de difusión y no participa en pagos, entregas ni
          acuerdos comerciales. Ante cualquier problema, avisa al equipo de moderación.
        </p>
      </div>

      {user && !isSeller ? (
        <div className="mt-4 flex justify-center">
          <Button variant="ghost" size="sm" icon={Flag} onClick={() => setReportOpen(true)}>
            Reportar publicación
          </Button>
        </div>
      ) : null}

      <ReportSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        contentKind="marketplaceListing"
        contentId={listing.id}
        contentTitle={listing.title}
      />
    </Page>
  );
}
