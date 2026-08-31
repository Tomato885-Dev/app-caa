import { Compass } from 'lucide-react';
import { ButtonLink, EmptyState, Page } from '@/ui';

export function NotFoundPage() {
  return (
    <Page>
      <div className="py-16">
        <EmptyState
          icon={Compass}
          title="Página no encontrada"
          description="El enlace que seguiste no existe o la sección fue movida."
          action={<ButtonLink to="/">Volver al inicio</ButtonLink>}
        />
      </div>
    </Page>
  );
}
