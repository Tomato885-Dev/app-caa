import { useEffect, useMemo, useState } from 'react';
import type { MenuDelDia } from '@/core/types';
import { dayKey, isToday } from '@/core/utils/date';
import { menusPorFecha, useMinutas } from '../api';
import { diaHabilDeReferencia, nombreDelDia } from '../fechas';

/* ============================================================================
   HOY EN EL CASINO
   ----------------------------------------------------------------------------
   Lo que se come hoy (o lo que se comerá mañana, si ya son más de las 16:00),
   para mostrarlo en Inicio. Es lo que más gente va a mirar cada día, así que
   Inicio lo dice sin tener que entrar.

   Si ese día no hay minuta cargada, o no hay servicio, devuelve `null` y la
   portada no promete nada: un recuadro que dice "todavía no hay minuta" todos
   los días es ruido.

   EL SALTO A LAS 16:00 SE ACTUALIZA SOLO
   Alguien que abre la app a las 15:55 y la deja abierta hasta las 16:05
   debería ver el cambio sin tener que cerrarla y volver a abrirla. Un tic por
   minuto pregunta cuál es el día de referencia y, si cambió, redibuja. Cuesta
   nada y evita "quedarse pegado" en el menú de ayer después de las cuatro.
   ========================================================================== */

export interface MenuDestacado {
  menu: MenuDelDia;
  /** El plato que se muestra grande. Si no cargaron fondo, lo primero que haya. */
  destacado: string;
  /** "Hoy", "Mañana" o "El lunes". */
  cuando: string;
}

export function useMenuDeHoy(): MenuDestacado | null {
  const { data } = useMinutas();
  const [dia, setDia] = useState(() => diaHabilDeReferencia());

  useEffect(() => {
    const id = setInterval(() => {
      const nuevo = diaHabilDeReferencia();
      setDia((actual) => (dayKey(nuevo) === dayKey(actual) ? actual : nuevo));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    const menu = menusPorFecha(data ?? []).get(dayKey(dia));
    const destacado =
      menu && !menu.sinServicio
        ? menu.principal || menu.entrada || menu.alternativa || menu.postre
        : undefined;
    if (!menu || !destacado) return null;

    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    const cuando = isToday(dia)
      ? 'Hoy'
      : dayKey(dia) === dayKey(mañana)
        ? 'Mañana'
        : `El ${nombreDelDia(dia)}`;

    return { menu, destacado, cuando };
  }, [data, dia]);
}
