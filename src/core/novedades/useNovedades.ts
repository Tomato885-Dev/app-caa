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
}

/** Cuántas de estas publicaciones son posteriores a la última visita. */
function contarNuevas(filas: BaseEntity[] | undefined, desde: string | null): number {
  if (!filas || !desde) return 0;
  return filas.filter((fila) => (fila.updatedAt ?? fila.createdAt) > desde).length;
}

/**
 * Cuántas novedades tiene cada sección. Se llama una vez, arriba del todo, y
 * el resultado se reparte por contexto: así no se piden las colecciones de
 * nuevo en cada rincón de la navegación.
 */
export function useContarNovedades(): Record<string, number> {
  /* Las fechas se leen UNA vez al abrir la app. Si se leyeran en cada dibujo,
     apagar una sección volvería a contar desde ese instante y el número
     parpadearía. */
  const [vistos] = useState(() => {
    const inicial: Record<string, string | null> = {};
    for (const seccion of SECCIONES) {
      const guardado = leerVisto(seccion.modulo);
      if (guardado === null) anotarVisto(seccion.modulo);
      inicial[seccion.modulo] = guardado;
    }
    return inicial;
  });

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
 * Marca una sección como vista. Lo llama su propia pantalla al abrirse, con un
 * respiro: apagar el número antes de que alcance a verse deja a la persona sin
 * entender por qué había un número.
 */
export function useMarcarVisto(modulo: string, listo = true): void {
  useEffect(() => {
    if (!listo) return;
    const temporizador = setTimeout(() => anotarVisto(modulo), 1200);
    return () => clearTimeout(temporizador);
  }, [modulo, listo]);
}

/** Para pruebas y para el botón de "olvidar" de Mi perfil. */
export function useOlvidarNovedades(): () => void {
  return useCallback(() => {
    for (const seccion of SECCIONES) anotarVisto(seccion.modulo, new Date(0).toISOString());
  }, []);
}
