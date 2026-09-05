import { supabase, usingServer } from '@/core/data';

/* ============================================================================
   MANDAR UN AVISO
   ----------------------------------------------------------------------------
   La aplicación no envía notificaciones: se lo pide al servidor. La llave que
   firma los avisos vive solo allá, porque quien la tenga puede escribirle a
   los 694 alumnos en nombre del Centro de Alumnos.

   `origen` ES LO QUE EVITA EL AVISO DUPLICADO
   Se manda el id del contenido. El servidor lo guarda como único, así que un
   segundo intento sobre el mismo comunicado se rechaza sin molestar a nadie.
   Da lo mismo que alguien pulse dos veces, o que dos personas del equipo
   decidan avisar del mismo comunicado con minutos de diferencia.
   ========================================================================== */

export interface ResultadoAviso {
  enviados: number;
  fallidos: number;
  total: number;
  dispositivosBorrados: number;
}

export class AvisoDuplicado extends Error {}

export async function enviarAviso(entrada: {
  titulo: string;
  cuerpo: string;
  /** A dónde lleva al tocarlo, p. ej. '/comunicados/com_12'. */
  ruta?: string;
  /** Id del contenido que lo origina. Impide mandarlo dos veces. */
  origen?: string;
}): Promise<ResultadoAviso> {
  if (!usingServer || !supabase) {
    throw new Error('Los avisos necesitan el servidor conectado.');
  }

  const { data, error } = await supabase.functions.invoke('enviar-aviso', { body: entrada });

  if (error) {
    /* El código 409 significa "ya se envió". No es un fallo que haya que
       resolver, así que se distingue para poder decirlo en otro tono. */
    const respuesta = (error as { context?: Response }).context;
    if (respuesta?.status === 409) {
      throw new AvisoDuplicado('Ese aviso ya se había enviado.');
    }
    if (respuesta?.status === 403) {
      throw new Error('No tienes permiso para enviar avisos.');
    }
    throw new Error(`No se pudo enviar: ${error.message}`);
  }

  return data as ResultadoAviso;
}
