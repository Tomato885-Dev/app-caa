import { appConfig } from '@/config/app.config';
import { db } from '@/core/data';
import { useCollection, useDataMutation } from '@/core/hooks/useData';
import type { AcercaDe } from '@/core/types';

/* ============================================================================
   "ACERCA DE" EDITABLE
   ----------------------------------------------------------------------------
   El recuadro del final de Mi perfil: quién es el Centro de Alumnos, el
   periodo y quién desarrolló la app. Cambia con cada directiva, así que el
   equipo lo edita desde Administración en vez de pedir una versión nueva.

   Vive como UN solo documento en la colección `acerca`. Si nadie lo ha
   editado todavía, se muestran los textos de siempre.

   La política de privacidad NO se edita aquí: Apple y Google exigen que el
   enlace esté siempre, así que sale fijo de `app.config.ts`.
   ========================================================================== */

export type TextosAcercaDe = Pick<AcercaDe, 'titulo' | 'subtitulo' | 'descripcion' | 'credito'>;

export const ACERCA_POR_DEFECTO: TextosAcercaDe = {
  titulo: appConfig.organization.fullName,
  subtitulo: `${appConfig.organization.institution} · ${appConfig.organization.term}`,
  descripcion:
    'Plataforma administrada en conjunto por el Centro de Alumnos y los equipos designados por ' +
    'la institución. El acceso está restringido a cuentas institucionales de la nómina oficial ' +
    'del colegio.',
  credito: 'Desarrollada por Mateo Burgos para el Centro de Alumnos.',
};

export function useAcercaDe() {
  const consulta = useCollection('acerca', db.acerca);
  const documento = consulta.data?.[0];
  const textos: TextosAcercaDe = {
    titulo: documento?.titulo ?? ACERCA_POR_DEFECTO.titulo,
    subtitulo: documento?.subtitulo ?? ACERCA_POR_DEFECTO.subtitulo,
    descripcion: documento?.descripcion ?? ACERCA_POR_DEFECTO.descripcion,
    credito: documento?.credito ?? ACERCA_POR_DEFECTO.credito,
  };
  return { textos, documento, cargando: consulta.isLoading };
}

/** Guarda los textos: edita el documento si existe, o lo crea la primera vez. */
export function useGuardarAcercaDe() {
  return useDataMutation(
    async ({ id, textos }: { id?: string; textos: TextosAcercaDe }) =>
      id ? db.acerca.update(id, textos) : db.acerca.create(textos),
    ['acerca'],
  );
}
