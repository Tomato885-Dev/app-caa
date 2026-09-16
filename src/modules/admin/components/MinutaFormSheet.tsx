import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { MenuDelDia, MinutaCasino } from '@/core/types';
import { formatDayLong } from '@/core/utils/date';
import { useCreateMinuta, useUpdateMinuta } from '@/modules/casino/api';
import {
  diasHabilesDelMes,
  fechaLocal,
  mesDe,
  nombreDelMes,
} from '@/modules/casino/fechas';
import { Button, Sheet, TextField, cn, useToast } from '@/ui';

/* ============================================================================
   CARGAR LA MINUTA DEL CASINO
   ----------------------------------------------------------------------------
   Al Centro de Alumnos la minuta le llega por mes, así que se carga por mes:
   aparecen todos los días de lunes a viernes, uno bajo otro, y se llena lo
   que haya.

   Para que el formulario no sea eterno, cada día muestra solo el plato de
   fondo. La entrada, la opción vegetariana y el postre se abren con un toque,
   y quedan abiertos solos en los días que ya los tienen.

   Los días que se dejan vacíos no se guardan: en la app aparecen como "todavía
   no está la minuta". Un feriado se marca con "Sin servicio".
   ========================================================================== */

interface DiaForm {
  principal: string;
  entrada: string;
  alternativa: string;
  postre: string;
  sinServicio: boolean;
}

const VACIO: DiaForm = { principal: '', entrada: '', alternativa: '', postre: '', sinServicio: false };

function aForm(dia: MenuDelDia): DiaForm {
  return {
    principal: dia.principal ?? '',
    entrada: dia.entrada ?? '',
    alternativa: dia.alternativa ?? '',
    postre: dia.postre ?? '',
    sinServicio: Boolean(dia.sinServicio),
  };
}

/** El primer mes, desde el actual, que todavía no tiene minuta. */
function mesSugerido(existentes: MinutaCasino[]): string {
  const cursor = new Date();
  cursor.setDate(1);
  for (let i = 0; i < 24; i += 1) {
    const mes = mesDe(cursor);
    if (!existentes.some((m) => m.mes === mes)) return mes;
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return mesDe(new Date());
}

export function MinutaFormSheet({
  open,
  onClose,
  editing,
  existentes,
}: {
  open: boolean;
  onClose: () => void;
  editing: MinutaCasino | null;
  existentes: MinutaCasino[];
}) {
  const notify = useToast();
  const create = useCreateMinuta();
  const update = useUpdateMinuta();

  const [mes, setMes] = useState('');
  const [nota, setNota] = useState('');
  const [dias, setDias] = useState<Record<string, DiaForm>>({});
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set());
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setErrores({});
    setError('');
    if (editing) {
      const cargados = Object.fromEntries(editing.dias.map((d) => [d.fecha, aForm(d)]));
      setMes(editing.mes);
      setNota(editing.nota ?? '');
      setDias(cargados);
      setAbiertos(
        new Set(editing.dias.filter((d) => d.entrada || d.alternativa || d.postre).map((d) => d.fecha)),
      );
    } else {
      setMes(mesSugerido(existentes));
      setNota('');
      setDias({});
      setAbiertos(new Set());
    }
    // `existentes` cambia de identidad en cada render; solo importa al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const fechas = useMemo(() => (/^\d{4}-\d{2}$/.test(mes) ? diasHabilesDelMes(mes) : []), [mes]);

  const cambiar = (fecha: string, campo: keyof DiaForm, valor: string | boolean) => {
    setDias((actual) => ({ ...actual, [fecha]: { ...(actual[fecha] ?? VACIO), [campo]: valor } }));
    setErrores((actual) => ({ ...actual, [fecha]: '' }));
  };

  const alternar = (fecha: string) =>
    setAbiertos((actual) => {
      const siguiente = new Set(actual);
      if (siguiente.has(fecha)) siguiente.delete(fecha);
      else siguiente.add(fecha);
      return siguiente;
    });

  const guardar = () => {
    setError('');
    if (!/^\d{4}-\d{2}$/.test(mes)) {
      setError('Elige el mes de la minuta.');
      return;
    }
    if (!editing && existentes.some((m) => m.mes === mes)) {
      setError(`Ya hay una minuta de ${nombreDelMes(mes)}. Edítala desde la lista.`);
      return;
    }

    const nuevosErrores: Record<string, string> = {};
    const resultado: MenuDelDia[] = [];

    for (const fecha of fechas) {
      const dia = dias[fecha];
      if (!dia) continue;
      if (dia.sinServicio) {
        resultado.push({ fecha, principal: '', sinServicio: true });
        continue;
      }
      const principal = dia.principal.trim();
      const entrada = dia.entrada.trim();
      const alternativa = dia.alternativa.trim();
      const postre = dia.postre.trim();
      if (!principal && !entrada && !alternativa && !postre) continue;
      resultado.push({
        fecha,
        principal,
        ...(entrada ? { entrada } : {}),
        ...(alternativa ? { alternativa } : {}),
        ...(postre ? { postre } : {}),
      });
    }

    setErrores(nuevosErrores);
    if (resultado.length === 0) {
      setError('Carga al menos un día.');
      return;
    }

    const payload = { mes, dias: resultado, nota: nota.trim() || undefined };
    const listo = () => {
      notify(editing ? 'Minuta actualizada.' : `Minuta de ${nombreDelMes(mes)} publicada.`);
      onClose();
    };

    if (editing) update.mutate({ id: editing.id, patch: payload }, { onSuccess: listo });
    else create.mutate(payload, { onSuccess: listo });
  };

  const cargados = fechas.filter((f) => {
    const d = dias[f];
    return d && (d.sinServicio || d.principal.trim() || d.entrada.trim() || d.alternativa.trim() || d.postre.trim());
  }).length;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? `Minuta de ${nombreDelMes(editing.mes)}` : 'Nueva minuta del casino'}
      description="Carga el mes completo. Los días que dejes vacíos no se muestran."
      footer={
        <Button
          size="lg"
          onClick={guardar}
          loading={create.isPending || update.isPending}
          className="w-full"
        >
          {editing ? 'Guardar cambios' : 'Publicar minuta'}
          {fechas.length ? ` · ${cargados} de ${fechas.length} días` : ''}
        </Button>
      }
    >
      <div className="space-y-4">
        {!editing ? (
          <TextField
            label="Mes"
            type="month"
            required
            value={mes}
            onChange={(event) => setMes(event.target.value)}
            hint={/^\d{4}-\d{2}$/.test(mes) ? `Minuta de ${nombreDelMes(mes)}.` : undefined}
          />
        ) : null}

        <TextField
          label="Aviso del mes (opcional)"
          value={nota}
          onChange={(event) => setNota(event.target.value)}
          placeholder="La minuta puede cambiar sin previo aviso."
        />

        {error ? (
          <p className="rounded-field border border-line bg-surface-2 px-3.5 py-3 text-[13px] font-medium text-danger-500">
            {error}
          </p>
        ) : null}

        <div className="space-y-3">
          {fechas.map((fecha) => {
            const dia = dias[fecha] ?? VACIO;
            const abierto = abiertos.has(fecha);
            return (
              <div
                key={fecha}
                className={cn(
                  'rounded-card border p-3.5',
                  errores[fecha] ? 'border-danger-500' : 'border-line',
                )}
              >
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <p className="text-[13.5px] font-bold text-ink">{formatDayLong(fechaLocal(fecha))}</p>
                  <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-2">
                    <input
                      type="checkbox"
                      checked={dia.sinServicio}
                      onChange={(event) => cambiar(fecha, 'sinServicio', event.target.checked)}
                      className="h-4 w-4 accent-[var(--color-brand-500)]"
                    />
                    Sin servicio
                  </label>
                </div>

                {dia.sinServicio ? (
                  <p className="text-[12.5px] text-ink-3">Feriado o jornada sin clases: no hay almuerzo.</p>
                ) : (
                  <div className="space-y-2.5">
                    <TextField
                      label="Plato de fondo"
                      value={dia.principal}
                      onChange={(event) => cambiar(fecha, 'principal', event.target.value)}
                      placeholder="Pollo arvejado con arroz"
                      error={errores[fecha]}
                    />

                    {abierto ? (
                      <>
                        <TextField
                          label="Entrada (opcional)"
                          value={dia.entrada}
                          onChange={(event) => cambiar(fecha, 'entrada', event.target.value)}
                          placeholder="Ensalada chilena"
                        />
                        <TextField
                          label="Opción vegetariana (opcional)"
                          value={dia.alternativa}
                          onChange={(event) => cambiar(fecha, 'alternativa', event.target.value)}
                          placeholder="Guiso de lentejas"
                        />
                        <TextField
                          label="Postre (opcional)"
                          value={dia.postre}
                          onChange={(event) => cambiar(fecha, 'postre', event.target.value)}
                          placeholder="Fruta de la estación"
                        />
                      </>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => alternar(fecha)}
                      className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand-600 dark:text-brand-300"
                    >
                      {abierto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {abierto ? 'Ocultar el resto' : 'Entrada, vegetariano y postre'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}
