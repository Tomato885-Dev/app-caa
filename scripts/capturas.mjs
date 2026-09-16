import { chromium, devices } from 'playwright';
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

const SERVIDOR = 'http://localhost:5173';
const CARPETA = 'capturas';
const SESION = 'scripts/.sesion.json';

/** iPhone 16 Pro Max: 440x956 puntos por 3 = 1320x2868 píxeles. Es la medida
 *  que Apple pide para 6,9 pulgadas, y de la que deriva el resto. */
const IPHONE = { viewport: { width: 440, height: 956 }, deviceScaleFactor: 3 };

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

/* Desde la 1.1 entran Casino, Eventos y Central de apuntes: son lo nuevo, y
   la primera captura (Inicio) ya resume casino, eventos y avisos. */
const PANTALLAS = [
  { archivo: '1-inicio', ruta: '/', espera: 'Comunicados' },
  { archivo: '2-casino', ruta: '/casino', espera: 'Casino' },
  { archivo: '3-eventos', ruta: '/eventos', espera: 'Eventos' },
  { archivo: '4-comunicados', ruta: '/comunicados', espera: 'Comunicados' },
  { archivo: '5-colaboradores', ruta: '/colaboradores', espera: 'Colaboradores' },
  { archivo: '6-apuntes', ruta: '/apuntes', espera: 'Apuntes' },
  { archivo: '7-noticias', ruta: '/noticias', espera: 'Noticias' },
];

const args = process.argv.slice(2);
const modoDemo = args.includes('--demo');
const modoEntrar = args.includes('--entrar');

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
    colorScheme: 'dark',
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

  for (const pantalla of PANTALLAS) {
    await pagina.goto(`${SERVIDOR}${pantalla.ruta}`, { waitUntil: 'networkidle' });

    /* Las imágenes entran después del primer dibujo. Sin esperarlas, la
       captura sale con huecos grises donde deberían ir las fotos. */
    await pagina.waitForTimeout(2500);
    await pagina.evaluate(() =>
      Promise.all(
        Array.from(document.images)
          .filter((img) => !img.complete)
          .map((img) => new Promise((listo) => { img.onload = listo; img.onerror = listo; })),
      ),
    );

    const archivo = path.join(destino, `${pantalla.archivo}${sufijo}.png`);
    await pagina.screenshot({ path: archivo });
    console.log(`  ${archivo}`);
  }

  await navegador.close();
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

await rm(CARPETA, { recursive: true, force: true });

console.log(`\n${modoDemo ? 'Contenido de DEMOSTRACIÓN' : 'Contenido REAL'}\n`);
console.log('App Store · 1320x2868  (6,9 pulgadas)');
await capturar('app-store', IPHONE, '');
console.log('');
console.log('App Store · 1242x2688  (6,5 pulgadas)');
await capturar('app-store-6.5', IPHONE_65, '');
console.log('\nGoogle Play · 1080x2400');
await capturar('google-play', ANDROID, '');
console.log(`\nListo. Están en ${path.resolve(CARPETA)}\n`);
