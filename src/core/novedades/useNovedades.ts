import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '@/core/data';
import { useCollection } from '@/core/hooks/useData';
import type { CollectionName } from '@/core/data/repository';
import type { BaseEntity } from '@/core/types';

/* ============================================================================
   LO QUE NO HAS VISTO
   ----------------------------------------------------------------------------
   El motivo para abrir la app un martes cualquiera. Cada sección recuerda
   cuándo fue la última vez que la miraste, y si desde entonces se publicó algo,
   lleva un número en la barra de abajo.

   POR SECCIÓN Y NO UNA SOLA FECHA
   Si fuera una sola, entrar a ver un comunicado apagaría también el aviso de
   que hay convenios nuevos. Cada sección se apaga sola cuando la abres, y el
   resto sigue esperando.

   LA PRIMERA VEZ NO CUENTA NADA
   Alguien que recién instala la app no tiene "14 convenios nuevos": los tiene
   todos por primera vez. Al no haber fecha guardada se anota la de ahora y se
   empieza a contar desde la próxima publicación.

   VIVE EN ESTE TELÉFONO
   No se guarda en el servidor a propósito. Es una comodidad, no un dato: no
   vale la pena registrar en la base qué mira cada uno de los 694 alumnos.
   ========================================================================== */

/** El id del módulo y la colección de la que salen sus publicaciones. */
const SECCIONES = [
  { modulo: 'announcements', coleccion: 'announcements' },
  { modulo: 'news', coleccion: 'news' },
  { modulo: 'events', coleccion: 'events' },
  { modulo: 'benefits', coleccion: 'benefits' },
  { modulo: 'casino', coleccion: 'casino' },
  { modulo: 'apuntes', coleccion: 'apuntes' },
] as const satisfies readonly { modulo: string; coleccion: CollectionName }[];

export type SeccionConNovedades = (typeof SECCIONES)[number]['modulo'];

const CLAVE = 'appcaa:visto:';
/* Más de esto no se muestra: "+9" dice lo mismo que "23" y no descuadra la
   barra. */
const TOPE = 9;

/* Quienes quieran enterarse cuando una sección se marque como vista. Es una
   señal interna, no toca la red ni el disco. La usa el contador de arriba para
   apagar el número al instante: si no, la fecha nueva la escribiría el disco
   pero el contador seguiría con la fecha vieja hasta que la app se recargue. */
const oyentes = new Set<() => void>();

function leerVisto(modulo: string): string | null {
  try {
    return localStorage.getItem(CLAVE + modulo);
  } catch {
    // Navegación privada o almacenamiento bloqueado: no se cuenta nada.
    return null;
  }
}

function anotarVisto(modulo: string, cuando = new Date().toISOString()): void {
  try {
    localStorage.setItem(CLAVE + modulo, cuando);
  } catch {
    /* sin almacenamiento, la sesión sigue funcionando igual */
  }
  /* Avisar SIEMPRE, aunque el disco haya fallado: al menos en esta sesión el
     número se apaga y no queda un "1" fantasma sobre una pestaña ya abierta. */
  for (const oyente of oyentes) {
    try {
      oyente();
    } catch {
      /* un oyente que reviente no puede tumbar a los demás */
    }
  }
}

/**
 * ¿Esta fila se le muestra de verdad a la comunidad?
 *
 * El contador lee las colecciones en crudo, y ahí conviven cosas que la
 * persona nunca va a ver: una noticia despublicada, un colaborador apagado.
 * Contarlas dejaba el número amarillo prometiendo algo que al entrar no
 * estaba. Se comprueban los dos campos que usan las pantallas —`status` para
 * lo publicable y `active` para lo que se enciende y apaga— y lo que no tenga
 * ninguno de los dos se cuenta igual, que es como se comportaba antes.
 */
function seVe(fila: BaseEntity): boolean {
  const posible = fila as BaseEntity & { status?: string; active?: boolean };
  if (posible.status !== undefined && posible.status !== 'approved') return false;
  if (posible.active === false) return false;
  return true;
}

/** Cuántas de estas publicaciones son posteriores a la última visita. */
function contarNuevas(filas: BaseEntity[] | undefined, desde: string | null): number {
  if (!filas || !desde) return 0;
  return filas.filter((fila) => seVe(fila) && (fila.updatedAt ?? fila.createdAt) > desde).length;
}

/**
 * Cuántas novedades tiene cada sección. Se llama una vez, arriba del todo, y
 * el resultado se reparte por contexto: así no se piden las colecciones de
 * nuevo en cada rincón de la navegación.
 */
export function useContarNovedades(): Record<string, number> {
  /* Las fechas se guardan en el estado para poder refrescarlas cuando una
     sección se marca como vista. La primera vez que arranca la app, si no hay
     fecha guardada se anota la de ahora: alguien recién llegado no tiene
     "14 convenios nuevos", los tiene todos por primera vez. */
  const [vistos, setVistos] = useState(() => {
    const inicial: Record<string, string | null> = {};
    for (const seccion of SECCIONES) {
      const guardado = leerVisto(seccion.modulo);
      if (guardado === null) anotarVisto(seccion.modulo);
      inicial[seccion.modulo] = guardado;
    }
    return inicial;
  });

  /* Cuando alguna pantalla llama a `useMarcarVisto`, este hook se entera y
     vuelve a leer las fechas del disco. Así el numerito amarillo se apaga en
     el mismo instante en que la persona abre la categoría. */
  useEffect(() => {
    const refrescar = () => {
      const nuevos: Record<string, string | null> = {};
      for (const seccion of SECCIONES) nuevos[seccion.modulo] = leerVisto(seccion.modulo);
      setVistos(nuevos);
    };
    oyentes.add(refrescar);
    return () => {
      oyentes.delete(refrescar);
    };
  }, []);

  /* Las mismas consultas que ya usan las pantallas: react-query las comparte,
     así que esto no agrega tráfico salvo la primera vez. */
  const comunicados = useCollection('announcements', db.announcements);
  const noticias = useCollection('news', db.news);
  const eventos = useCollection('events', db.events);
  const convenios = useCollection('benefits', db.benefits);
  const minutas = useCollection('casino', db.casino);
  const carpetas = useCollection('apuntes', db.apuntes);

  const datos: Record<string, BaseEntity[] | undefined> = {
    announcements: comunicados.data,
    news: noticias.data,
    events: eventos.data,
    benefits: convenios.data,
    casino: minutas.data,
    apuntes: carpetas.data,
  };

  return useMemo(() => {
    const cuenta: Record<string, number> = {};
    for (const seccion of SECCIONES) {
      cuenta[seccion.modulo] = Math.min(
        contarNuevas(datos[seccion.modulo], vistos[seccion.modulo]),
        TOPE,
      );
    }
    return cuenta;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comunicados.data, noticias.data, eventos.data, convenios.data, minutas.data, carpetas.data, vistos]);
}

/**
 * Marca una sección como vista. Lo llama su propia pantalla al abrirse: apenas
 * la persona abre la categoría, el numerito amarillo se apaga. Antes se
 * esperaba un respiro para que el número alcanzara a verse, pero Mateo prefiere
 * que desaparezca al instante: si la persona ya está mirando la sección, el
 * "1" ya cumplió su tarea de traerla hasta acá.
 */
export function useMarcarVisto(modulo: string, listo = true): void {
  useEffect(() => {
    if (!listo) return;
    anotarVisto(modulo);
  }, [modulo, listo]);
}

/** Para pruebas y para el botón de "olvidar" de Mi perfil. */
export function useOlvidarNovedades(): () => void {
  return useCallback(() => {
    for (const seccion of SECCIONES) anotarVisto(seccion.modulo, new Date(0).toISOString());
  }, []);
}
