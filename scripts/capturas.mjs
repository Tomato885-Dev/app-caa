import { chromium, devices } from 'playwright';
import { FRASES, paginaDelMarco } from './marco.mjs';
import { mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

/* ============================================================================
   CAPTURAS PARA LAS TIENDAS
   ----------------------------------------------------------------------------
   Google Play y App Store piden imágenes de tamaño exacto. Sacarlas a mano
   desde el navegador da 440x956, un tercio de lo que pide Apple, y ampliarlas
   deja el texto borroso: en una ficha de tienda eso se nota.

   Aquí el navegador dibuja directamente al triple de densidad. El resultado
   son 1320x2868 píxeles reales, con el texto nítido, y se puede repetir cada
   vez que cambie el contenido o el logo.

   TRES MODOS
     node scripts/capturas.mjs --demo
       Usa el contenido de demostración. Sirve para ver el encuadre.

     node scripts/capturas.mjs --entrar
       Abre una ventana de verdad para que TÚ escribas tu contraseña. La
       sesión queda guardada en scripts/.sesion.json y no se vuelve a pedir.
       La contraseña no pasa por el script ni queda escrita en ninguna parte.

     node scripts/capturas.mjs
       Usa esa sesión guardada y saca las capturas con el contenido real.

   POR QUÉ NO APARECE CONTACTOS
   La base de contactos muestra nombre, curso, correo y teléfono de menores de
   edad. Una captura de esa pantalla publicada en una tienda es justo lo que no
   corresponde hacer, así que no está en la lista y no debe agregarse.
   ========================================================================== */

/* El servidor y la carpeta se pueden cambiar sin tocar el archivo, con
   CAPTURAS_SERVIDOR y CAPTURAS_CARPETA. Sirve para probar un marco nuevo
   contra el servidor de demostracion sin pisar las capturas buenas: ojo que
   la carpeta se borra entera al empezar. */
const SERVIDOR = process.env.CAPTURAS_SERVIDOR ?? 'http://localhost:5173';
const CARPETA = process.env.CAPTURAS_CARPETA ?? 'capturas';
const SESION = 'scripts/.sesion.json';

/** iPhone 16 Pro Max: 440x956 puntos por 3 = 1320x2868 píxeles. Es la medida
 *  que Apple pide para 6,9 pulgadas, y de la que deriva el resto. */
const IPHONE = { viewport: { width: 440, height: 956 }, deviceScaleFactor: 3 };

/** Con que tema salen las capturas: 'light' o 'dark'. */
const TEMA = process.env.CAPTURAS_TEMA === 'dark' ? 'dark' : 'light';

/** iPhone 11 Pro Max: 414x896 puntos por 3 = 1242x2688 pixeles. Es la medida
 *  de 6,5 pulgadas, y es la que App Store Connect pide en la ranura que sale
 *  por defecto. Sacar solo la de 6,9 obliga a convertirlas despues, y
 *  redimensionar a mano deja imagenes de 2687 pixeles que Apple rechaza por
 *  un pixel. */
const IPHONE_65 = { viewport: { width: 414, height: 896 }, deviceScaleFactor: 3 };

/** Google acepta un rango amplio; 1080x2400 es una proporción de teléfono
 *  Android corriente y entra holgado en lo que exige. */
const ANDROID = { viewport: { width: 360, height: 800 }, deviceScaleFactor: 3 };

/* ----------------------------------------------------------------------------
   QUÉ NAVEGADOR USAR
   El Chromium que trae Playwright dejó de arrancar en este equipo: Windows
   responde "la configuración en paralelo no es correcta", que es su manera de
   decir que al binario le falta una librería del sistema. Volver a descargarlo
   no lo arregla, porque el problema no está en la descarga.

   Edge sirve igual de bien: es el mismo motor, viene con Windows y trae sus
   propias librerías. Se prueba primero el de Playwright —así en otro equipo
   esto sigue funcionando sin tocar nada— y solo si no arranca se usa Edge.
   -------------------------------------------------------------------------- */
let canal;

async function abrirNavegador(opciones = {}) {
  if (canal === undefined) {
    try {
      const prueba = await chromium.launch();
      await prueba.close();
      canal = null;
    } catch {
      canal = 'msedge';
      console.log('El Chromium de Playwright no arranca en este equipo. Se usa Edge.');
    }
  }
  return chromium.launch({ ...opciones, ...(canal ? { channel: canal } : {}) });
}

/* Desde la 1.1 entran Casino y Eventos: son lo nuevo, y la primera captura
   (Inicio) ya resume casino, eventos y avisos.

   `antes` deja la pantalla como tiene que salir. En Casino se va al día que
   tiene minuta cargada (el 1 de septiembre de 2026): la semana de hoy puede
   estar vacía, y una captura que dice "todavía no está la minuta" no sirve en
   la tienda. Si cambia la minuta, cambiar el día aquí. */
const DIA_DEL_CASINO = { semanasAtras: 2, etiqueta: /1 de septiembre/i };

const PANTALLAS = [
  { archivo: '1-inicio', ruta: '/', espera: 'Comunicados' },
  {
    archivo: '2-casino',
    ruta: '/casino',
    espera: 'Casino',
    antes: async (pagina) => {
      for (let i = 0; i < DIA_DEL_CASINO.semanasAtras; i += 1) {
        await pagina.getByRole('button', { name: 'Semana anterior' }).click();
        await pagina.waitForTimeout(300);
      }
      await pagina.getByRole('button', { name: DIA_DEL_CASINO.etiqueta }).first().click();
      await pagina.waitForTimeout(500);
    },
  },
  { archivo: '3-eventos', ruta: '/eventos', espera: 'Eventos' },
  { archivo: '4-comunicados', ruta: '/comunicados', espera: 'Comunicados' },
  { archivo: '5-colaboradores', ruta: '/colaboradores', espera: 'Colaboradores' },
  { archivo: '6-noticias', ruta: '/noticias', espera: 'Noticias' },
];

/* Sacar una sola pantalla, cuando cambio el diseño de una y las demás siguen
   sirviendo. Se le da el nombre del archivo o un trozo:
   CAPTURAS_SOLO=colaboradores. Sin esto salen las seis. */
const SOLO = (process.env.CAPTURAS_SOLO ?? '').trim().toLowerCase();
const pantallasAsacar = SOLO
  ? PANTALLAS.filter((p) => p.archivo.toLowerCase().includes(SOLO))
  : PANTALLAS;

const args = process.argv.slice(2);
const modoDemo = args.includes('--demo');
const modoEntrar = args.includes('--entrar');
/* Por defecto salen las dos versiones de cada pantalla: la pelada, por si
   hace falta, y la de la ficha, con fondo y frase. Con --simples se saltan
   las segundas. */
const soloSimples = args.includes('--simples');

async function entrarAMano() {
  console.log('\nSe va a abrir una ventana del navegador.');
  console.log('Inicia sesión ahí con tu cuenta. Cuando estés dentro, vuelve');
  console.log('a esta terminal y presiona Enter.\n');

  const navegador = await abrirNavegador({ headless: false });
  const contexto = await navegador.newContext({ viewport: { width: 480, height: 900 } });
  const pagina = await contexto.newPage();
  await pagina.goto(SERVIDOR);

  await new Promise((listo) => {
    process.stdin.resume();
    process.stdin.once('data', listo);
  });

  await contexto.storageState({ path: SESION });
  await navegador.close();
  console.log(`\nSesión guardada en ${SESION}. Ya puedes sacar las capturas.\n`);
}

async function capturar(nombreTienda, medidas, sufijo) {
  const navegador = await abrirNavegador();
  const contexto = await navegador.newContext({
    ...medidas,
    isMobile: true,
    hasTouch: true,
    locale: 'es-CL',
    timezoneId: 'America/Santiago',
    /* En claro. La ficha de la tienda se mira de dia y con el pulgar: el
       verde sobre blanco se lee mejor en miniatura que el modo noche, que en
       una captura chica se ve como un rectangulo negro. Se cambia aqui. */
    colorScheme: TEMA,
    storageState: !modoDemo && existsSync(SESION) ? SESION : undefined,
  });

  /* La invitacion a activar los avisos aparece sola al entrar, y taparia la
     pantalla de Inicio en la primera captura. Se marca como ya ofrecida antes
     de que cargue la app: en la ficha de la tienda tiene que verse la app. */
  await contexto.addInitScript(() => {
    localStorage.setItem('avisos:invitacion', JSON.stringify({ veces: 3, ultima: Date.now() }));
  });

  const pagina = await contexto.newPage();
  const destino = path.join(CARPETA, nombreTienda);
  await mkdir(destino, { recursive: true });

  const destinoConMarco = path.join(CARPETA, `${nombreTienda}-con-marco`);
  if (!soloSimples) await mkdir(destinoConMarco, { recursive: true });

  /* Se entra con la cuenta de ESTUDIANTE, no con la de administrador.

     Quien mira la ficha de la tienda tiene que ver lo que va a recibir: un
     alumno de la nómina. Con la cuenta de administrador aparecía el acceso al
     panel de gestión —que la mayoría nunca va a ver— y el saludo mostraba
     "Centro", porque el nombre de pila de "Directiva Centro de Alumnos" es
     justamente eso. */
  if (modoDemo) {
    await pagina.goto(SERVIDOR, { waitUntil: 'networkidle' });
    const demo = pagina.getByText('Experiencia de un alumno de la nómina.');
    if (await demo.count()) {
      await demo.click();
      await pagina.waitForTimeout(1500);
    }
  }

  for (const pantalla of pantallasAsacar) {
    await pagina.goto(`${SERVIDOR}${pantalla.ruta}`, { waitUntil: 'networkidle' });

    /* Las imágenes entran después del primer dibujo. Sin esperarlas, la
       captura sale con huecos grises donde deberían ir las fotos. */
    await pagina.waitForTimeout(2500);
    if (pantalla.antes) await pantalla.antes(pagina);
    await pagina.evaluate(() =>
      Promise.all(
        Array.from(document.images)
          .filter((img) => !img.complete)
          .map((img) => new Promise((listo) => { img.onload = listo; img.onerror = listo; })),
      ),
    );

    const archivo = path.join(destino, `${pantalla.archivo}${sufijo}.png`);
    const imagen = await pagina.screenshot({ path: archivo });
    console.log(`  ${archivo}`);

    /* La misma captura, montada en el marco de la tienda. Se hace aquí y no
       en otro paso para no volver a abrir el navegador ni releer archivos. */
    if (!soloSimples && FRASES[pantalla.archivo]) {
      const conMarco = path.join(
        destinoConMarco,
        `${pantalla.archivo}${sufijo}.png`,
      );
      await componerMarco(contexto, imagen, FRASES[pantalla.archivo], medidas, conMarco);
      console.log(`  ${conMarco}`);
    }
  }

  await navegador.close();
}

/**
 * Monta una captura en el marco de la tienda y la fotografia.
 *
 * Se dibuja en una pestana aparte, del mismo tamano en puntos que la captura,
 * y con la misma densidad: por eso el texto del marco sale tan nitido como el
 * de la app y la imagen final mide exactamente lo que pide la tienda.
 */
async function componerMarco(contexto, imagen, frase, medidas, destino) {
  const pagina = await contexto.newPage();
  await pagina.setViewportSize(medidas.viewport);
  await pagina.setContent(
    paginaDelMarco(imagen.toString('base64'), frase, medidas.viewport),
    { waitUntil: 'load' },
  );
  await pagina.evaluate(() =>
    Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map((img) => new Promise((listo) => { img.onload = listo; img.onerror = listo; })),
    ),
  );
  await pagina.screenshot({ path: destino });
  await pagina.close();
}

if (modoEntrar) {
  await entrarAMano();
  process.exit(0);
}

if (!modoDemo && !existsSync(SESION)) {
  console.error('\nNo hay sesión guardada. Corre primero:');
  console.error('  node scripts/capturas.mjs --entrar');
  console.error('O usa --demo para el contenido de demostración.\n');
  process.exit(1);
}

/* La carpeta se vacía para que no queden capturas de una versión anterior
   mezcladas con las nuevas. Pero si se pidió UNA sola pantalla, borrarla se
   llevaría por delante las otras cinco, que siguen sirviendo: ahí solo se
   sobrescribe la que toca. */
if (!SOLO) await rm(CARPETA, { recursive: true, force: true });

console.log(`\n${modoDemo ? 'Contenido de DEMOSTRACIÓN' : 'Contenido REAL'}\n`);
console.log('App Store · 1320x2868  (6,9 pulgadas)');
await capturar('app-store', IPHONE, '');
console.log('');
console.log('App Store · 1242x2688  (6,5 pulgadas)');
await capturar('app-store-6.5', IPHONE_65, '');
console.log('\nGoogle Play · 1080x2400');
await capturar('google-play', ANDROID, '');
console.log(`\nListo. Están en ${path.resolve(CARPETA)}\n`);
