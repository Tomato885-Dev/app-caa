import type { CapacitorConfig } from '@capacitor/cli';

/* ============================================================================
   APP ANDROID
   ----------------------------------------------------------------------------
   Envuelve la misma aplicación web que ya está publicada, para poder subirla a
   Google Play. No es una app distinta: es el mismo código.

   LA WEB VIAJA DENTRO DEL PAQUETE
   No se apunta a una dirección de internet. Se copia `dist/` dentro de la app,
   así que abre igual de rápido y no depende de que la página siga en pie.

   El CONTENIDO —comunicados, noticias, eventos, fotos— sí viene del servidor,
   como en la web. Publicar un comunicado nuevo NO necesita una versión nueva
   en la tienda. Solo la necesitan los cambios de código.

   EL IDENTIFICADOR NO SE PUEDE CAMBIAR
   `appId` queda amarrado a la app para siempre: es como se identifica en Google
   Play y en el teléfono de cada persona. Cambiarlo después significa publicar
   otra app distinta y perder las instalaciones.
   ========================================================================== */

const config: CapacitorConfig = {
  appId: 'cl.verbo.centroalumnos',
  appName: 'App CAA',
  webDir: 'dist',
  android: {
    /* La aplicación se ve mejor en oscuro y así está pensada, pero se respeta
       lo que la persona eligió en Mi perfil: el color de fondo mientras carga
       es el mismo verde de la marca en los dos casos. */
    backgroundColor: '#11673c',
  },
};

export default config;
