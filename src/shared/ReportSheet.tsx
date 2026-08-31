import { useState } from 'react';
import { appConfig } from '@/config/app.config';
import { db } from '@/core/data';
import { useDataMutation } from '@/core/hooks/useData';
import { useAuth } from '@/core/auth/AuthContext';
import { toAuthorRef } from '@/content/seed/users';
import type { ContentKind, ID } from '@/core/types';
import { Button, Field, Select, Sheet, TextField, useToast } from '@/ui';

/* ============================================================================
   REPORTE DE CONTENIDO
   ----------------------------------------------------------------------------
   Cualquier estudiante puede reportar una publicación; los reportes llegan al
   panel de moderación (§8.2). Se usa desde el marketplace y queda
   disponible para módulos futuros sin cambios.
   ========================================================================== */

export function useCreateReport() {
  return useDataMutation(
    (input: {
      contentKind: ContentKind;
      contentId: ID;
      contentTitle: string;
      reason: string;
      detail?: string;
      reporter: ReturnType<typeof toAuthorRef>;
    }) => db.reports.create({ ...input, state: 'open' }),
    ['reports'],
  );
}

export function ReportSheet({
  open,
  onClose,
  contentKind,
  contentId,
  contentTitle,
}: {
  open: boolean;
  onClose: () => void;
  contentKind: ContentKind;
  contentId: ID;
  contentTitle: string;
}) {
  const { user } = useAuth();
  const notify = useToast();
  const createReport = useCreateReport();
  const [reason, setReason] = useState(appConfig.moderation.reportReasons[0]);
  const [detail, setDetail] = useState('');

  const handleSubmit = () => {
    if (!user) return;
    createReport.mutate(
      {
        contentKind,
        contentId,
        contentTitle,
        reason,
        detail: detail.trim() || undefined,
        reporter: toAuthorRef(user),
      },
      {
        onSuccess: () => {
          notify('Reporte enviado. El equipo de moderación lo revisará.');
          setDetail('');
          onClose();
        },
      },
    );
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Reportar publicación"
      description="Tu reporte llega al equipo de moderación y no se comparte con quien publicó."
      footer={
        <Button
          size="lg"
          variant="danger"
          onClick={handleSubmit}
          loading={createReport.isPending}
          className="w-full"
        >
          Enviar reporte
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="rounded-field bg-surface-2 p-3.5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-3">
            Contenido reportado
          </p>
          <p className="mt-1 text-[14px] font-semibold text-ink">{contentTitle}</p>
        </div>

        <Field label="Motivo" required>
          <Select value={reason} onChange={(event) => setReason(event.target.value)}>
            {appConfig.moderation.reportReasons.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>

        <TextField
          label="Detalle (opcional)"
          multiline
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
          placeholder="Cuéntanos brevemente qué ocurre."
          hint="Esta información ayuda a resolver el reporte más rápido."
        />
      </div>
    </Sheet>
  );
}
