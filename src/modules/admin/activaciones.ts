import { appConfig } from '@/config/app.config';
import { supabase, usingServer } from '@/core/data';
import type { User } from '@/core/types';

/* ============================================================================
   QUIÉN HA ACTIVADO SU CUENTA
   ----------------------------------------------------------------------------
   Con el servidor conectado no hace falta llevar una lista aparte: una cuenta
   existe únicamente si su dueño se registró, escribió el código que le llegó
   al correo y entró. Es decir, cada perfil ES una activación, con su fecha.

   Este archivo solo hace dos cosas con esa información:
     · contarla por curso, para saber cómo va la llegada a cada generación, y
     · convertirla en un archivo que se pueda abrir en Excel y mostrar en una
       reunión, que es lo que suele pedirse.

   EL DENOMINADOR
   Cuántos podrían activarse sale de la nómina del servidor, no de una cifra
   escrita a mano: si mañana el colegio suma un curso, el porcentaje se corrige
   solo. Leer la nómina completa está permitido a la administración y a nadie
   más (`supabase/01-esquema.sql`), así que esta cuenta no se puede hacer desde
   una cuenta de estudiante.
   ========================================================================== */

export interface CourseActivation {
  grade: string;
  activated: number;
  /** Cuántos hay en la nómina de ese curso. `null` si no se pudo averiguar. */
  total: number | null;
}

export interface ActivationSummary {
  /** Cuentas creadas: alguien se registró y verificó su correo. */
  activated: number;
  /** Personas habilitadas en la nómina. `null` si no se pudo averiguar. */
  enrolled: number | null;
  /** La más reciente, para saber si la cosa sigue moviéndose. */
  lastActivation: string | null;
  byCourse: CourseActivation[];
}

/**
 * Cuántos hay habilitados para entrar, por curso.
 *
 * CON SERVIDOR es la nómina: la lista del colegio, que puede tener a gente que
 * todavía no se registró.
 *
 * SIN SERVIDOR son las cuentas sembradas en este navegador, que se generan
 * desde esa misma nómina. Ahí todas existen desde el principio y lo que
 * distingue a quien ya entró es haber creado su contraseña.
 */
async function readEnrollment(accounts: User[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  if (!usingServer || !supabase) {
    for (const account of accounts) {
      counts.set(account.grade, (counts.get(account.grade) ?? 0) + 1);
    }
    return counts;
  }

  const { data, error } = await supabase.from('nomina').select('curso').eq('habilitado', true);
  /* Si la consulta falla se devuelve el mapa vacío y el resumen queda sin
     denominador. Es preferible a inventar uno: un porcentaje equivocado sobre
     cuánta gente entró se toma por cierto y se repite en una reunión. */
  if (error || !data) return counts;

  for (const row of data as { curso: string }[]) {
    counts.set(row.curso, (counts.get(row.curso) ?? 0) + 1);
  }
  return counts;
}

/**
 * @param accounts   todas las cuentas que existen.
 * @param activated  las que su dueño ya activó. Con servidor son todas: un
 *                   perfil no existe hasta que la persona verifica su correo.
 */
export async function buildActivationSummary(
  accounts: User[],
  activated: User[],
): Promise<ActivationSummary> {
  const matricula = await readEnrollment(accounts);
  const enrollment = matricula.size > 0 ? matricula : null;

  const activatedByCourse = new Map<string, number>();
  for (const account of activated) {
    activatedByCourse.set(account.grade, (activatedByCourse.get(account.grade) ?? 0) + 1);
  }

  /* Se recorre la lista oficial de cursos y no la de las cuentas, para que un
     curso donde todavía no entró nadie aparezca en cero en vez de faltar: un
     curso ausente del informe se lee como "ya está listo", que es lo contrario
     de lo que pasa. */
  const grades = new Set<string>([
    ...appConfig.grades,
    ...activatedByCourse.keys(),
    ...(enrollment?.keys() ?? []),
  ]);

  const byCourse = [...grades]
    .map((grade) => ({
      grade,
      activated: activatedByCourse.get(grade) ?? 0,
      total: enrollment?.get(grade) ?? null,
    }))
    .filter((row) => row.activated > 0 || (row.total ?? 0) > 0)
    .sort((a, b) => appConfig.grades.indexOf(a.grade) - appConfig.grades.indexOf(b.grade));

  /* La fecha de activación solo la sabe el servidor: `createdAt` es entonces
     el momento en que se creó el perfil, o sea cuando la persona verificó su
     correo. Sin servidor las cuentas nacen todas juntas al sembrar el
     navegador, y esa fecha no dice nada de nadie. */
  const fechas = usingServer ? activated.map((account) => account.createdAt).sort() : [];

  return {
    activated: activated.length,
    enrolled: enrollment ? [...enrollment.values()].reduce((sum, n) => sum + n, 0) : null,
    lastActivation: fechas.length > 0 ? fechas[fechas.length - 1] : null,
    byCourse,
  };
}

/* ----------------------------------------------------------------------------
   EL ARCHIVO
   -------------------------------------------------------------------------- */

/**
 * Excel en español espera punto y coma, no coma: con coma mete la fila entera
 * en una sola celda y el archivo parece roto. El BOM del principio es lo que
 * hace que muestre bien los acentos y las eñes.
 */
function toCsv(rows: string[][]): string {
  const escapar = (valor: string) => '"' + valor.replace(/"/g, '""') + '"';
  return '﻿' + rows.map((fila) => fila.map(escapar).join(';')).join('\r\n');
}

function fechaLegible(iso: string): string {
  const fecha = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    pad(fecha.getDate()) +
    '-' +
    pad(fecha.getMonth() + 1) +
    '-' +
    fecha.getFullYear() +
    ' ' +
    pad(fecha.getHours()) +
    ':' +
    pad(fecha.getMinutes())
  );
}

function marcaDeTiempo(fecha: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    fecha.getFullYear() + '-' + pad(fecha.getMonth() + 1) + '-' + pad(fecha.getDate())
  );
}

/**
 * Descarga la lista de quienes activaron su cuenta.
 *
 * @param accounts las cuentas ya activadas, no todas las que existen.
 *
 * ⚠️ El archivo lleva nombres y correos de menores de edad. Sirve para mostrar
 * cómo avanza la llegada de la aplicación, no para repartirlo: quien lo
 * descargue se hace responsable de dónde lo guarda.
 */
export function downloadActivationReport(accounts: User[], summary: ActivationSummary): string {
  const ahora = new Date();

  const filas: string[][] = [
    ['App CAA · Cuentas activadas'],
    ['Generado el', fechaLegible(ahora.toISOString())],
    [
      'Activadas',
      String(summary.activated),
      ...(summary.enrolled !== null ? ['de', String(summary.enrolled), 'en la nómina'] : []),
    ],
    [],
    ['Resumen por curso'],
    ['Curso', 'Activadas', 'En la nómina', 'Faltan'],
    ...summary.byCourse.map((row) => [
      row.grade,
      String(row.activated),
      row.total !== null ? String(row.total) : '',
      row.total !== null ? String(Math.max(0, row.total - row.activated)) : '',
    ]),
    [],
    ['Detalle'],
    ['Nombre', 'Curso', 'Correo', 'Rol', 'Activó el', 'Estado'],
    ...[...accounts]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((account) => [
        account.name,
        account.grade,
        account.email,
        account.role,
        // Sin servidor no se sabe cuándo activó: la columna se deja vacía en
        // vez de poner la fecha del sembrado, que no es de esta persona.
        usingServer ? fechaLegible(account.createdAt) : '',
        account.active ? 'Activa' : 'Desactivada',
      ]),
  ];

  const blob = new Blob([toCsv(filas)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  const nombre = 'cuentas-activadas-' + marcaDeTiempo(ahora) + '.csv';

  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);

  return nombre;
}
