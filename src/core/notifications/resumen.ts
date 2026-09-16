import type { ResultadoAviso } from './enviar';

/* ============================================================================
   QUÉ DECIRLE A QUIEN MANDÓ EL AVISO
   ----------------------------------------------------------------------------
   El servidor cuenta como "fallido" todo envío que no salió, y eso mezcla dos
   cosas muy distintas:

     · Un teléfono que desinstaló la app. No es un problema: el servidor lo
       borra solo, y lo informa en `dispositivosBorrados`.
     · Un rechazo de verdad. Una llave mal subida, un servicio caído.

   Antes no se separaban. Un teléfono viejo hacía parecer que algo fallaba, y
   si fallaban TODOS los envíos el mensaje decía "Nadie tiene los avisos
   activados", que es falso y manda a buscar el problema en otro lado. Por eso
   primero se descuentan los teléfonos borrados, y solo lo que queda se trata
   como falla.

   Cuando hay fallas se nombra el registro de `enviar-aviso` en Supabase: ahí
   queda escrito el motivo exacto de cada rechazo. Así se encontró la llave de
   Apple que faltaba el 13 de septiembre de 2026.
   ========================================================================== */

export interface ResumenAviso {
  texto: string;
  tipo: 'success' | 'info' | 'error';
}

const REGISTRO = 'Revisa el registro de enviar-aviso en Supabase.';

export function resumenDelAviso(r: ResultadoAviso): ResumenAviso {
  const activos = r.total - r.dispositivosBorrados;
  const problemas = r.fallidos - r.dispositivosBorrados;

  if (activos <= 0) {
    return { texto: 'Nadie tiene los avisos activados todavía.', tipo: 'info' };
  }

  const cuantos = `${r.enviados} de ${activos} ${activos === 1 ? 'dispositivo' : 'dispositivos'}`;

  if (problemas <= 0) {
    return { texto: `Aviso enviado a ${cuantos}.`, tipo: 'success' };
  }

  if (r.enviados === 0) {
    return {
      texto:
        activos === 1
          ? `No se pudo enviar al único dispositivo. ${REGISTRO}`
          : `No se pudo enviar a ninguno de los ${activos} dispositivos. ${REGISTRO}`,
      tipo: 'error',
    };
  }

  return {
    texto: `Aviso enviado a ${cuantos}. ${problemas} no se ${problemas === 1 ? 'pudo' : 'pudieron'} enviar. ${REGISTRO}`,
    tipo: 'error',
  };
}
