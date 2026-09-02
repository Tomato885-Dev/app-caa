import { ensureSeeded, localProvider } from './localProvider';
import type { DataProvider } from './repository';
import { createSupabaseClient, createSupabaseProvider } from './supabaseProvider';

/* ============================================================================
   DE DÓNDE SALEN LOS DATOS
   ----------------------------------------------------------------------------
   Toda la aplicación pide datos llamando a `db`, y nunca sabe quién responde.
   Aquí se decide, una sola vez, cuál de los dos contesta:

   · CON SERVIDOR    si el archivo `.env` trae la dirección y la clave del
                     proyecto de Supabase. El contenido es compartido: lo que
                     publica el Centro de Alumnos lo ve todo el mundo al
                     instante.

   · SIN SERVIDOR    si no hay `.env`. Los datos viven en el navegador de cada
                     persona. Sirve para desarrollar y para la demostración
                     pública, y es como funcionó la app hasta ahora.

   La aplicación no cambia en ninguno de los dos casos: las pantallas, los
   formularios y la moderación son exactamente los mismos.

   Cómo obtener esos dos valores está en `.env.example`.
   ========================================================================== */

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/** ¿Hay un servidor configurado? Lo consultan las pantallas que lo advierten. */
export const usingServer = Boolean(url && anonKey);

/**
 * Cliente de Supabase, o `null` sin servidor. Lo necesita el acceso, que va
 * más allá de leer y escribir contenido.
 */
export const supabase = usingServer ? createSupabaseClient(url as string, anonKey as string) : null;

if (!usingServer) {
  // Sin servidor hay que dejar sembrado el contenido de ejemplo del navegador.
  ensureSeeded();
}

export const db: DataProvider = supabase ? createSupabaseProvider(supabase) : localProvider;

export * from './repository';
export { createId, readSeedSignature, type SeedSignature } from './localProvider';
