import { useState } from 'react';
import type { Registration, SignupActivity, User } from '@/core/types';
import { Button, Field, Select, Sheet, TextField, useToast } from '@/ui';
import { useRegister } from '../api';

/* ============================================================================
   FORMULARIO DE INSCRIPCIÓN
   ----------------------------------------------------------------------------
   Las preguntas se generan a partir de `activity.questions`, de modo que cada
   convocatoria puede pedir la información que necesite sin crear pantallas
   nuevas.
   ========================================================================== */

export function RegistrationSheet({
  open,
  onClose,
  activity,
  user,
  waitlist,
}: {
  open: boolean;
  onClose: () => void;
  activity: SignupActivity;
  user: User;
  /** Sin cupos disponibles: la inscripción entra en lista de espera. */
  waitlist: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const register = useRegister();
  const notify = useToast();

  const setAnswer = (id: string, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    setErrors((current) => ({ ...current, [id]: '' }));
  };

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    for (const question of activity.questions) {
      if (question.required && !answers[question.id]?.trim()) {
        nextErrors[question.id] = 'Esta respuesta es obligatoria.';
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const state: Registration['state'] = waitlist ? 'waitlist' : 'confirmed';
    register.mutate(
      { activity, user, answers, state },
      {
        onSuccess: () => {
          notify(
            waitlist
              ? 'Quedaste en lista de espera. Te avisaremos si se libera un cupo.'
              : '¡Inscripción confirmada!',
          );
          setAnswers({});
          onClose();
        },
      },
    );
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={waitlist ? 'Sumarse a la lista de espera' : 'Confirmar inscripción'}
      description={activity.title}
      footer={
        <Button size="lg" onClick={handleSubmit} loading={register.isPending} className="w-full">
          {waitlist ? 'Entrar a lista de espera' : 'Confirmar inscripción'}
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Identidad: se inscribe con el nombre real y curso de la cuenta (§7). */}
        <div className="rounded-field bg-surface-2 p-3.5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-3">
            Te inscribes como
          </p>
          <p className="mt-1 text-[14.5px] font-bold text-ink">{user.name}</p>
          <p className="text-[13px] text-ink-2">
            {user.grade} · {user.email}
          </p>
        </div>

        {activity.questions.map((question) =>
          question.type === 'select' ? (
            <Field
              key={question.id}
              label={question.label}
              required={question.required}
              error={errors[question.id]}
            >
              <Select
                value={answers[question.id] ?? ''}
                onChange={(event) => setAnswer(question.id, event.target.value)}
              >
                <option value="">Selecciona una opción</option>
                {question.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <TextField
              key={question.id}
              label={question.label}
              required={question.required}
              error={errors[question.id]}
              multiline={question.type === 'textarea'}
              value={answers[question.id] ?? ''}
              onChange={(event) => setAnswer(question.id, event.target.value)}
            />
          ),
        )}

        {activity.requirements ? (
          <div className="rounded-field border border-warning-500 bg-warning-100 p-3.5 dark:border-warning-700 dark:bg-warning-950">
            <p className="text-[12.5px] font-bold text-warning-700 dark:text-warning-300">
              Requisitos de participación
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{activity.requirements}</p>
          </div>
        ) : null}
      </div>
    </Sheet>
  );
}
