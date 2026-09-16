import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  CakeSlice,
  CalendarOff,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Salad,
  UtensilsCrossed,
} from 'lucide-react';
import type { MenuDelDia } from '@/core/types';
import { dayKey, formatDayLong, isToday } from '@/core/utils/date';
import { Badge, Card, IconButton, Page, PageHeader, Skeleton, cn } from '@/ui';
import { menusPorFecha, useMinutas } from './api';
import {
  diaHabilDeReferencia,
  diasDeLaSemana,
  fechaLocal,
  lunesDe,
  mesDe,
  rangoDeSemana,
} from './fechas';

/* ============================================================================
   CASINO
   ----------------------------------------------------------------------------
   Qué se sirve cada día en el almuerzo, para que cada alumno decida si come en
   el casino o se trae algo.

   Se abre en HOY (o en el lunes, si es fin de semana), con la semana arriba
   para ir a otro día. La minuta la carga el Centro de Alumnos por mes, desde
   Administración → Contenidos → Casino.
   ========================================================================== */

const INICIALES = ['L', 'M', 'M', 'J', 'V'];

export function CasinoPage() {
  const { data, isLoading } = useMinutas();
  const menus = useMemo(() => menusPorFecha(data ?? []), [data]);

  const referencia = useMemo(() => diaHabilDeReferencia(), []);
  const [lunes, setLunes] = useState(() => lunesDe(referencia));
  const [seleccion, setSeleccion] = useState(() => dayKey(referencia));

  const semana = diasDeLaSemana(lunes);
  const fecha = fechaLocal(seleccion);
  const nota = (data ?? []).find((minuta) => minuta.mes === mesDe(fecha))?.nota;

  /* Al cambiar de semana se queda en el mismo día: quien miraba el miércoles
     quiere ver el miércoles de la otra semana, no volver al lunes. */
  const moverSemana = (semanas: number) => {
    const posicion = Math.max(0, semana.findIndex((dia) => dayKey(dia) === seleccion));
    const nuevoLunes = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + semanas * 7);
    setLunes(nuevoLunes);
    setSeleccion(dayKey(diasDeLaSemana(nuevoLunes)[posicion]));
  };

  return (
    <Page>
      <PageHeader title="Casino" description="Lo que se sirve cada día en el almuerzo." />

      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <IconButton icon={ChevronLeft} label="Semana anterior" onClick={() => moverSemana(-1)} />
          <p className="text-[14px] font-semibold text-ink">{rangoDeSemana(semana)}</p>
          <IconButton icon={ChevronRight} label="Semana siguiente" onClick={() => moverSemana(1)} />
        </div>

        <div className="grid grid-cols-5 gap-2">
          {semana.map((dia, indice) => {
            const clave = dayKey(dia);
            const activo = clave === seleccion;
            const cargado = menus.has(clave);
            return (
              <button
                key={clave}
                type="button"
                onClick={() => setSeleccion(clave)}
                aria-pressed={activo}
                aria-label={formatDayLong(dia)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl py-2.5 transition active:scale-[0.96]',
                  activo ? 'bg-brand-500 text-white shadow-sm' : 'bg-surface-2 text-ink',
                )}
              >
                <span
                  className={cn(
                    'text-[11px] font-bold uppercase',
                    activo ? 'text-brand-100' : 'text-ink-3',
                  )}
                >
                  {INICIALES[indice]}
                </span>
                <span className="text-[18px] font-extrabold leading-none">{dia.getDate()}</span>
                {/* El punto amarillo es hoy. Sin punto, ese día no tiene minuta. */}
                <span
                  className={cn(
                    'size-1.5 rounded-full',
                    isToday(dia)
                      ? 'bg-accent-500'
                      : cargado
                        ? activo
                          ? 'bg-brand-200'
                          : 'bg-brand-400'
                        : 'bg-transparent',
                  )}
                />
              </button>
            );
          })}
        </div>
      </Card>

      {isLoading ? (
        <Skeleton className="h-56 w-full rounded-card" />
      ) : (
        <MenuDelDiaCard fecha={fecha} menu={menus.get(seleccion)} />
      )}

      {nota ? <p className="mt-3 px-1 text-[12.5px] leading-relaxed text-ink-3">{nota}</p> : null}
    </Page>
  );
}

function MenuDelDiaCard({ fecha, menu }: { fecha: Date; menu: MenuDelDia | undefined }) {
  const extras: { icon: LucideIcon; etiqueta: string; valor?: string }[] = menu
    ? [
        { icon: Salad, etiqueta: 'Entrada', valor: menu.entrada },
        { icon: Leaf, etiqueta: 'Opción vegetariana', valor: menu.alternativa },
        { icon: CakeSlice, etiqueta: 'Postre', valor: menu.postre },
      ].filter((extra) => extra.valor)
    : [];

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-bold text-ink">{formatDayLong(fecha)}</h2>
        {isToday(fecha) ? <Badge tone="accent">Hoy</Badge> : null}
      </div>

      {!menu ? (
        <Vacio
          icon={UtensilsCrossed}
          titulo="Todavía no está la minuta de este día"
          detalle="Cuando el Centro de Alumnos la cargue, aparecerá aquí."
        />
      ) : menu.sinServicio ? (
        <Vacio icon={CalendarOff} titulo="No hay almuerzo este día" detalle="Feriado o jornada sin clases." />
      ) : (
        <>
          {menu.principal ? (
            <>
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-3">Plato de fondo</p>
              <p className="mt-1 text-[22px] font-extrabold leading-tight text-ink">{menu.principal}</p>
            </>
          ) : null}

          {extras.length ? (
            <ul className={menu.principal ? 'mt-4 space-y-3 border-t border-line pt-4' : 'space-y-3'}>
              {extras.map(({ icon: Icono, etiqueta, valor }) => (
                <li key={etiqueta} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    <Icono size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11.5px] font-semibold text-ink-3">{etiqueta}</span>
                    <span className="block text-[14.5px] font-semibold text-ink">{valor}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </Card>
  );
}

function Vacio({ icon: Icono, titulo, detalle }: { icon: LucideIcon; titulo: string; detalle: string }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-surface-2 text-ink-3">
        <Icono size={22} />
      </span>
      <p className="text-[14.5px] font-semibold text-ink">{titulo}</p>
      <p className="mt-1 text-[13px] text-ink-3">{detalle}</p>
    </div>
  );
}
