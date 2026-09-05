/* ============================================================================
   TRABAJADOR DE SEGUNDO PLANO
   ----------------------------------------------------------------------------
   Este archivo NO es parte de la aplicación: el navegador lo ejecuta aparte,
   incluso con la app cerrada. Es la única forma de que llegue una notificación
   cuando nadie tiene la página abierta.

   Por eso está escrito en JavaScript plano y suelto en `public/`: no pasa por
   la compilación, no puede importar nada del proyecto, y su dirección tiene
   que ser estable. Si un día se mueve, los navegadores ya suscritos se quedan
   sin recibir nada.

   HACE DOS COSAS, Y NADA MÁS
     · mostrar el aviso que llega del servidor, y
     · abrir la app en el lugar correcto cuando alguien lo toca.

   No guarda páginas para uso sin conexión. Se podría, pero mezclar las dos
   cosas hace que un error de caché deje a la gente viendo una versión vieja de
   la app, y eso es peor que no tener modo sin conexión.
   ========================================================================== */

self.addEventListener('install', () => {
  // Tomar el control sin esperar a que se cierren las pestañas abiertas.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let aviso = {};
  try {
    aviso = event.data ? event.data.json() : {};
  } catch {
    // Un aviso mal formado no debe dejar al usuario sin nada en pantalla.
    aviso = { titulo: 'Centro de Alumnos', cuerpo: event.data ? event.data.text() : '' };
  }

  const titulo = aviso.titulo || 'Centro de Alumnos';
  const opciones = {
    body: aviso.cuerpo || '',
    icon: aviso.icono || './icons/icon.png',
    badge: './icons/icon.png',
    lang: 'es',
    /* Avisos del mismo contenido se reemplazan en vez de apilarse: si se
       reenvía un comunicado, nadie termina con tres notificaciones iguales. */
    tag: aviso.origen || 'appcaa',
    renotify: Boolean(aviso.origen),
    data: { ruta: aviso.ruta || './' },
  };

  event.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  /* La dirección se arma desde el alcance de este trabajador, NO desde la raíz
     del dominio. La app no vive en la raíz: en GitHub Pages está bajo
     /app-caa/, y el día que tenga dominio propio estará en otro sitio.

     Resolver contra la raíz mandaba a github.io/comunicados/... —una página que
     no existe— y la notificación abría un 404. Se le quita la barra inicial a
     la ruta para que se resuelva como relativa al alcance. */
  const base = self.registration.scope;
  const cruda = event.notification.data?.ruta || './';
  const destino = new URL(String(cruda).replace(/^\/+/, ''), base).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ventanas) => {
      /* Si la app ya está abierta se reutiliza esa ventana. Abrir una segunda
         pestaña de la misma app es la forma más rápida de que alguien crea que
         se le duplicó la sesión.

         Se compara contra el alcance y no contra el dominio: en github.io
         conviven muchos proyectos, y una pestaña de otro no es esta app. */
      for (const ventana of ventanas) {
        if (ventana.url.startsWith(base) && 'focus' in ventana) {
          ventana.navigate?.(destino);
          return ventana.focus();
        }
      }
      return self.clients.openWindow(destino);
    }),
  );
});
