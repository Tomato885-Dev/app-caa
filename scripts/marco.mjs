/* ============================================================================
   EL MARCO DE LAS CAPTURAS DE LA TIENDA
   ----------------------------------------------------------------------------
   Una captura pelada del teléfono se ve como lo que es: un pantallazo. Las
   fichas de las apps que se ven bien tienen otra cosa —un fondo de color, una
   frase corta arriba y el teléfono asomando por abajo—, y eso es lo que arma
   este archivo.

   NO SE RETOCA LA APP
   La imagen de adentro es la captura tal cual, sin recortes ni filtros: lo que
   se ve en la tienda es lo que se recibe al instalar. Lo único que se agrega
   es el fondo y la frase, que es lo que permiten las dos tiendas.

   Se dibuja como una página web y se fotografía: así el texto sale nítido a
   cualquier tamaño, sin programas de diseño de por medio.
   ========================================================================== */

/** La paleta de la app, para que la ficha y la app sean la misma cosa. */
const VERDE_OSCURO = '#062616';
const VERDE = '#0b4527';
const VERDE_CLARO = '#11673c';
const AMARILLO = '#ffd101';

/**
 * Las frases de cada captura. Una idea por pantalla, en lo que diría un
 * alumno, y la palabra que importa en amarillo.
 *
 * Se guardan aquí y no en el script de capturas para que cambiar el texto de
 * la ficha no obligue a tocar la parte que maneja el navegador.
 */
export const FRASES = {
  '1-inicio': ['Todo tu colegio', 'en una sola app'],
  '2-casino': ['Mira qué se sirve', 'hoy en el casino'],
  '3-eventos': ['No te pierdas', 'ningún evento'],
  '4-comunicados': ['Los avisos oficiales,', 'apenas salen'],
  '5-colaboradores': ['Descuentos', 'solo para ti'],
  '6-noticias': ['Entérate de todo', 'lo que pasa'],
};

/** La segunda línea va en amarillo: da el acento sin gritar. */
function titulo(frase) {
  const [primera, segunda] = frase;
  return `<h1><span>${primera}</span><br /><em>${segunda}</em></h1>`;
}

/**
 * La página que se fotografía. Mide lo mismo que la captura de adentro, así
 * que el resultado sale del tamaño exacto que pide la tienda.
 *
 * @param {string} imagenBase64 la captura del teléfono, ya en base64
 * @param {string[]} frase      las dos líneas del título
 * @param {{width:number,height:number}} medidas en puntos, no en píxeles
 */
export function paginaDelMarco(imagenBase64, frase, medidas) {
  /* Todo se calcula en proporción al alto: así el mismo marco sirve para el
     iPhone alto de Apple y para el más cuadrado de Android, sin rehacerlo. */
  const alto = medidas.height;
  const ancho = medidas.width;
  const margen = Math.round(ancho * 0.065);
  const tamanoTitulo = Math.round(ancho * 0.082);
  const anchoTelefono = ancho - margen * 2;
  const arribaTelefono = Math.round(alto * 0.215);
  const radio = Math.round(ancho * 0.085);

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <!-- Imprescindible: el navegador esta emulando un telefono, y sin esto
         dibuja la pagina en un lienzo de 980px y la achica. El marco salia a
         media escala, con el telefono chico en una esquina. -->
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }

      body {
        width: ${ancho}px;
        height: ${alto}px;
        overflow: hidden;
        position: relative;
        background:
          radial-gradient(120% 80% at 15% 0%, ${VERDE_CLARO} 0%, transparent 55%),
          radial-gradient(90% 60% at 100% 18%, rgba(255, 209, 1, 0.22) 0%, transparent 60%),
          linear-gradient(170deg, ${VERDE} 0%, ${VERDE_OSCURO} 70%);
        font-family: -apple-system, 'Segoe UI', system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
      }

      /* La trama de puntos del fondo de la app, para que la ficha se parezca
         a lo que hay adentro. */
      .trama {
        position: absolute;
        inset: 0;
        background-image: radial-gradient(rgba(255, 255, 255, 0.09) 1.4px, transparent 1.4px);
        background-size: ${Math.round(ancho * 0.05)}px ${Math.round(ancho * 0.05)}px;
        -webkit-mask-image: linear-gradient(to bottom, black, transparent 55%);
      }

      h1 {
        position: absolute;
        top: ${Math.round(alto * 0.065)}px;
        left: ${margen}px;
        right: ${margen}px;
        font-size: ${tamanoTitulo}px;
        line-height: 1.12;
        letter-spacing: -0.025em;
        font-weight: 800;
        color: #ffffff;
        text-align: center;
      }
      h1 em { font-style: normal; color: ${AMARILLO}; }

      /* El teléfono asoma por abajo y se sale del borde: es lo que da la
         sensación de que hay más app de la que cabe en la foto. */
      .telefono {
        position: absolute;
        top: ${arribaTelefono}px;
        left: ${margen}px;
        width: ${anchoTelefono}px;
        border-radius: ${radio}px;
        overflow: hidden;
        box-shadow:
          0 0 0 ${Math.round(ancho * 0.008)}px rgba(255, 255, 255, 0.16),
          0 ${Math.round(alto * 0.03)}px ${Math.round(alto * 0.06)}px rgba(0, 0, 0, 0.55);
      }
      .telefono img { display: block; width: 100%; height: auto; }
    </style>
  </head>
  <body>
    <div class="trama"></div>
    ${titulo(frase)}
    <div class="telefono"><img src="data:image/png;base64,${imagenBase64}" alt="" /></div>
  </body>
</html>`;
}
