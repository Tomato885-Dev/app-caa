import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App';
import './index.css';

/* EL ZOOM EN LA APP INSTALADA
   Una app de teléfono no se acerca con dos dedos, y hacerlo sin querer deja
   la pantalla corrida hasta que uno adivina cómo volver. Dentro de la app se
   bloquea. En el navegador NO: ahí sirve a quien necesita agrandar para leer,
   y quitarlo sería quitarle eso.

   La causa principal del zoom era otra —la letra chica de los campos, ver
   `src/ui/Form.tsx`—; esto cubre lo que queda. */
if (Capacitor.isNativePlatform()) {
  document
    .querySelector('meta[name="viewport"]')
    ?.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1, user-scalable=no',
    );
}

const container = document.getElementById('root');
if (!container) throw new Error('No se encontró el nodo #root en index.html');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
