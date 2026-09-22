import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarSync, ChevronDown, TriangleAlert } from 'lucide-react';
import { supabase, usingServer } from '@/core/data';
import { Button, Card, Input, cn, useToast } from '@/ui';

/* ============================================================================
   SUBIR LOS CURSOS UN AÑO
   ----------------------------------------------------------------------------
   En marzo todo el colegio cambia de curso: 8° Básico A pasa a I Medio A, y
   así hasta IV Medio, que egresa. Son casi setecientas filas; esto lo deja en
   un botón.

   POR QUÉ ESTÁ ESCONDIDO
   Es la acción más destructiva de toda la app: toca el curso de TODAS las
   personas a la vez y cierra el acceso de los que egresan. No puede estar al
   alcance de un dedo distraído, así que va al final de Cuentas y permisos,
   plegado, y además pide:

     1. Abrir el bloque a propósito.
     2. Ver primero el ENSAYO, que cuenta a cuántos afecta sin tocar nada.
     3. Escribir el año a mano. Si no calza con el que se propone, no se activa.
     4. Confirmar en el cuadro del sistema.

   Y el servidor tiene sus propios candados por separado (solo administrador,
   y no se puede repetir el mismo año): ver `supabase/12-subir-los-cursos.sql`.
   Aunque alguien llegara aquí sin permiso, no pasaría de la primera línea.
   ========================================================================== */

/** El año al que toca subir: el que viene, salvo que ya estemos en marzo. */
function anioPropuesto(hoy = new Date()): number {
  // Antes de marzo todavía se está cerrando el año anterior, así que el
  // ascenso es "hacia este año"; de marzo en adelante, hacia el que viene.
  return hoy.getMonth() < 2 ? hoy.getFullYear() : hoy.getFullYear() + 1;
}

interface Resumen {
  octavo_a_primero?: number;
  primero_a_segundo?: number;
  segundo_a_tercero?: number;
  tercero_a_cuarto?: number;
  cuarto_egresa?: number;
  sin_tocar?: number;
  ensayo?: boolean;
  cuentas_cerradas?: number;
  perfiles_actualizados?: number;
}

export function SubirLosCursos() {
  const notify = useToast();
  const queryClient = useQueryClient();
  const [abierto, setAbierto] = useState(false);
  const [anio, setAnio] = useState('');
  const [ensayo, setEnsayo] = useState<Resumen | null>(null);
  const [trabajando, setTrabajando] = useState(false);
  const [listo, setListo] = useState(false);

  const propuesto = anioPropuesto();
  const escritoCalza = anio.trim() === String(propuesto);

  /* Sin servidor no hay a quién subirle el curso: la nómina es inventada y
     vive en este navegador. El bloque ni se ofrece.
     Se guarda en una constante para que siga estando dentro de `llamar`. */
  const cliente = supabase;
  if (!usingServer || !cliente) return null;

  const llamar = async (esEnsayo: boolean) => {
    setTrabajando(true);
    try {
      const { data, error } = await cliente.rpc('subir_los_cursos_un_ano', {
        p_anio: propuesto,
        p_ensayo: esEnsayo,
      });

      if (error) {
        notify(error.message || 'No se pudo. Revisa que seas administrador.', 'error');
        return;
      }

      const resultado = (data ?? {}) as Resumen;
      if (esEnsayo) {
        setEnsayo(resultado);
        return;
      }

      setListo(true);
      setEnsayo(resultado);
      notify(`Listo. ${resultado.perfiles_actualizados ?? 0} cuentas quedaron en su curso nuevo.`);
      // Los cursos cambiaron: la base de contactos y los filtros tienen que
      // volver a pedirse o seguirían mostrando los de el año pasado.
      await queryClient.refetchQueries();
    } catch {
      notify('No se pudo conectar. Revisa tu internet e inténtalo de nuevo.', 'error');
    } finally {
      setTrabajando(false);
    }
  };

  const confirmarYSubir = () => {
    const seguro = window.confirm(
      `¿Subir todos los cursos a ${propuesto}?\n\n` +
        '· 8° Básico pasa a I Medio, I Medio a II Medio, y así.\n' +
        '· La letra del curso no cambia.\n' +
        `· Los de IV Medio quedan como "Egresado ${propuesto}" y su cuenta se cierra.\n\n` +
        'Esto afecta a toda la comunidad y NO se puede deshacer desde la app.',
    );
    if (seguro) void llamar(false);
  };

  return (
    <Card className="mt-8">
      <button
        type="button"
        onClick={() => setAbierto((estaba) => !estaba)}
        aria-expanded={abierto}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-3 text-ink-3">
          <CalendarSync size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-bold text-ink">Empezar un año nuevo</span>
          <span className="block text-[12px] text-ink-3">
            Sube a todos un curso. Solo en marzo.
          </span>
        </span>
        <ChevronDown
          size={18}
          className={cn('shrink-0 text-ink-3 transition', abierto && 'rotate-180')}
        />
      </button>

      {abierto ? (
        <div className="mt-3 border-t border-line pt-3.5">
          <div className="flex gap-2.5 rounded-2xl bg-accent-500/12 p-3">
            <TriangleAlert size={17} className="mt-0.5 shrink-0 text-accent-600" />
            <p className="text-[12.5px] leading-relaxed text-ink-2">
              Esto cambia el curso de <span className="font-bold text-ink">toda la comunidad</span>{' '}
              de una vez, y cierra la cuenta de quienes egresan. Hazlo una sola vez al año, cuando
              empiecen las clases. <span className="font-semibold">No se puede deshacer.</span>
            </p>
          </div>

          <p className="mt-3.5 text-[13px] leading-relaxed text-ink-2">
            Primero mira el ensayo: cuenta a cuánta gente afecta sin cambiar nada.
          </p>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => void llamar(true)}
            loading={trabajando && !listo}
            className="mt-2.5 w-full"
          >
            Ver a quiénes afecta (no cambia nada)
          </Button>

          {ensayo ? (
            <ul className="mt-3 space-y-1.5 rounded-2xl bg-surface-2 p-3 text-[12.5px] text-ink-2">
              <Fila que="8° Básico pasa a I Medio" cuantos={ensayo.octavo_a_primero} />
              <Fila que="I Medio pasa a II Medio" cuantos={ensayo.primero_a_segundo} />
              <Fila que="II Medio pasa a III Medio" cuantos={ensayo.segundo_a_tercero} />
              <Fila que="III Medio pasa a IV Medio" cuantos={ensayo.tercero_a_cuarto} />
              <Fila que={`IV Medio egresa (cuenta cerrada)`} cuantos={ensayo.cuarto_egresa} />
              <Fila que="Sin tocar (profesores y autoridades)" cuantos={ensayo.sin_tocar} />
            </ul>
          ) : null}

          {listo ? (
            <p className="mt-3 rounded-2xl bg-brand-500/12 p-3 text-[12.5px] font-semibold leading-relaxed text-brand-700 dark:text-brand-200">
              Listo. Los cursos ya están en {propuesto}. Si alguien que egresó tiene que seguir
              entrando, actívale la cuenta desde la lista de arriba.
            </p>
          ) : (
            <>
              <p className="mt-4 text-[13px] leading-relaxed text-ink-2">
                Si el ensayo cuadra, escribe{' '}
                <span className="font-bold text-ink">{propuesto}</span> para habilitar el botón.
              </p>
              <Input
                inputMode="numeric"
                value={anio}
                onChange={(event) => setAnio(event.target.value)}
                placeholder={String(propuesto)}
                aria-label={`Escribe ${propuesto} para confirmar`}
                className="mt-2"
              />
              <Button
                variant="danger"
                size="sm"
                onClick={confirmarYSubir}
                disabled={!escritoCalza || !ensayo}
                loading={trabajando && listo}
                className="mt-2.5 w-full"
              >
                Subir todos los cursos a {propuesto}
              </Button>
              {!ensayo ? (
                <p className="mt-2 text-center text-[12px] text-ink-3">
                  Mira el ensayo antes de poder continuar.
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </Card>
  );
}

function Fila({ que, cuantos }: { que: string; cuantos?: number }) {
  return (
    <li className="flex items-baseline justify-between gap-3">
      <span className="min-w-0">{que}</span>
      <span className="shrink-0 font-bold tabular-nums text-ink">{cuantos ?? 0}</span>
    </li>
  );
}
