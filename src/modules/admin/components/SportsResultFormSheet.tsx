import { useEffect, useState } from 'react';
import { sportDisciplines, sportLevels } from '@/content/taxonomies';
import { toAuthorRef } from '@/content/seed/users';
import type {
  MatchOutcome,
  SportDiscipline,
  SportLevel,
  SportsResult,
  User,
} from '@/core/types';
import { useCreateSportsResult, useUpdateSportsResult } from '@/modules/sports/api';
import { Button, Field, SelectField, Sheet, TextField, useToast } from '@/ui';

function toDateInput(iso: string | undefined): string {
  return iso ? new Date(iso).toISOString().slice(0, 10) : '';
}

/**
 * El resultado se deduce del marcador en vez de pedirlo aparte: así no puede
 * quedar un 3-1 registrado como derrota.
 */
function outcomeFrom(scoreFor: number, scoreAgainst: number): MatchOutcome {
  if (scoreFor > scoreAgainst) return 'victoria';
  if (scoreFor < scoreAgainst) return 'derrota';
  return 'empate';
}

/** Carga y edición de resultados de las selecciones (365). */
export function SportsResultFormSheet({
  open,
  onClose,
  editing,
  user,
}: {
  open: boolean;
  onClose: () => void;
  editing: SportsResult | null;
  user: User;
}) {
  const notify = useToast();
  const create = useCreateSportsResult();
  const update = useUpdateSportsResult();

  const empty = {
    discipline: 'futbol' as SportDiscipline,
    level: 'superior' as SportLevel,
    playedAt: toDateInput(new Date().toISOString()),
    opponent: '',
    competition: '',
    location: '',
    scoreFor: '',
    scoreAgainst: '',
    /** Competencias sin marcador: atletismo, encuentros formativos. */
    noScore: false,
    highlights: '',
  };

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      editing
        ? {
            discipline: editing.discipline,
            level: editing.level,
            playedAt: toDateInput(editing.playedAt),
            opponent: editing.opponent,
            competition: editing.competition ?? '',
            location: editing.location ?? '',
            scoreFor: editing.scoreFor === null ? '' : String(editing.scoreFor),
            scoreAgainst: editing.scoreAgainst === null ? '' : String(editing.scoreAgainst),
            noScore: editing.scoreFor === null || editing.scoreAgainst === null,
            highlights: editing.highlights ?? '',
          }
        : empty,
    );
    // `empty` es una constante literal; no necesita entrar en las dependencias.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const set = (key: keyof typeof form, value: string | boolean) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      // El atletismo no tiene marcador: se marca solo al elegir la disciplina.
      if (key === 'discipline' && !editing) next.noScore = value === 'atletismo';
      return next;
    });
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    if (form.opponent.trim().length < 3)
      nextErrors.opponent = 'Indica el rival o el nombre de la competencia.';
    if (!form.playedAt) nextErrors.playedAt = 'Falta la fecha del encuentro.';

    const scoreFor = Number(form.scoreFor);
    const scoreAgainst = Number(form.scoreAgainst);
    if (!form.noScore) {
      if (form.scoreFor === '' || form.scoreAgainst === '' || Number.isNaN(scoreFor) || Number.isNaN(scoreAgainst)) {
        nextErrors.scoreFor = 'Completa ambos marcadores, o marca «sin marcador».';
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      discipline: form.discipline,
      level: form.level,
      // La fecha se fija a mediodía para que el cambio de zona horaria no la
      // desplace al día anterior en el calendario ni en el listado.
      playedAt: new Date(`${form.playedAt}T12:00:00`).toISOString(),
      opponent: form.opponent.trim(),
      competition: form.competition.trim() || undefined,
      location: form.location.trim() || undefined,
      scoreFor: form.noScore ? null : scoreFor,
      scoreAgainst: form.noScore ? null : scoreAgainst,
      outcome: form.noScore ? ('participacion' as MatchOutcome) : outcomeFrom(scoreFor, scoreAgainst),
      highlights: form.highlights.trim() || undefined,
    };

    const onSuccess = () => {
      notify(editing ? 'Resultado actualizado.' : 'Resultado publicado.');
      onClose();
    };

    if (editing) {
      update.mutate({ id: editing.id, patch: payload }, { onSuccess });
    } else {
      create.mutate({ ...payload, author: toAuthorRef(user) }, { onSuccess });
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? 'Editar resultado' : 'Nuevo resultado'}
      description="Se publica en 365 dentro de la selección que corresponda."
      footer={
        <Button
          size="lg"
          onClick={handleSubmit}
          loading={create.isPending || update.isPending}
          className="w-full"
        >
          {editing ? 'Guardar cambios' : 'Publicar resultado'}
        </Button>
      }
    >
      <div className="space-y-4">
        <SelectField
          label="Disciplina"
          required
          value={form.discipline}
          onChange={(event) => set('discipline', event.target.value)}
          options={sportDisciplines.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />

        <SelectField
          label="Categoría"
          required
          value={form.level}
          onChange={(event) => set('level', event.target.value)}
          options={sportLevels.map((option) => ({ value: option.value, label: option.label }))}
        />

        <TextField
          label="Rival o prueba"
          required
          error={errors.opponent}
          value={form.opponent}
          onChange={(event) => set('opponent', event.target.value)}
          placeholder="Liceo San Andrés"
          hint="En atletismo, el nombre del encuentro o de la prueba."
        />

        <TextField
          label="Fecha"
          required
          type="date"
          error={errors.playedAt}
          value={form.playedAt}
          onChange={(event) => set('playedAt', event.target.value)}
        />

        <Field label="Marcador" error={errors.scoreFor}>
          <label className="mb-2 flex cursor-pointer items-center gap-2.5 rounded-field border border-line p-3">
            <input
              type="checkbox"
              checked={form.noScore}
              onChange={(event) => set('noScore', event.target.checked)}
              className="h-4 w-4 accent-[var(--color-brand-500)]"
            />
            <span className="text-[13.5px] text-ink-2">
              Sin marcador: se registra como participación.
            </span>
          </label>

          {!form.noScore ? (
            <div className="flex items-center gap-2">
              <TextField
                label="Selección"
                type="number"
                min={0}
                value={form.scoreFor}
                onChange={(event) => set('scoreFor', event.target.value)}
                className="text-center"
              />
              <span className="pt-6 text-[18px] font-bold text-ink-3">:</span>
              <TextField
                label="Rival"
                type="number"
                min={0}
                value={form.scoreAgainst}
                onChange={(event) => set('scoreAgainst', event.target.value)}
                className="text-center"
              />
            </div>
          ) : null}
        </Field>

        <TextField
          label="Torneo o competencia (opcional)"
          value={form.competition}
          onChange={(event) => set('competition', event.target.value)}
          placeholder="Torneo interescolar · fecha 5"
        />

        <TextField
          label="Lugar (opcional)"
          value={form.location}
          onChange={(event) => set('location', event.target.value)}
          placeholder="Gimnasio techado"
        />

        <TextField
          label="Detalle (opcional)"
          multiline
          rows={3}
          value={form.highlights}
          onChange={(event) => set('highlights', event.target.value)}
          hint="Goleadores, tiempos, posiciones obtenidas."
        />
      </div>
    </Sheet>
  );
}
