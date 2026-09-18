# La ficha de las tiendas

Todo lo que Google Play y App Store piden escribir sobre la aplicación. Está
aquí y no solo en la consola de cada tienda para que, cuando haya que cambiar
algo, se vea qué decía antes y por qué.

---

## Descripción corta

Máximo 80 caracteres. Es la que sale bajo el nombre en el listado.

```
Comunicados, eventos y beneficios del Centro de Alumnos del Verbo Divino.
```

---

## Descripción completa

```
App CAA es la plataforma del Centro de Alumnos del Colegio Del Verbo Divino.

Reúne en un solo lugar lo que hoy anda repartido entre carteles en los
pasillos, grupos de WhatsApp y el boca a boca. Si algo se publica aquí, es
oficial.

QUÉ ENCUENTRAS

• Comunicados — Los avisos del día a día y las convocatorias abiertas.
• Noticias — Lo que ya pasó, contado con fotos.
• Eventos — Lo que viene, con su fecha, su lugar y su inscripción.
• Calendario — Todo el año, mes a mes.
• 365 — Los resultados de las competencias entre cursos.
• Proyectos — En qué está trabajando el Centro de Alumnos y cómo va cada cosa.
• Casino — La minuta de la semana, con lo que hay hoy.
• Central de apuntes — Las carpetas de apuntes de tu generación.
• Colaboradores — Los convenios y descuentos vigentes, y cómo canjear cada uno.
• Contactos — La comunidad del colegio, para escribirle a alguien sin tener
  que preguntar su correo.

AVISOS EN EL TELÉFONO

Cuando el Centro de Alumnos publica algo importante, llega una notificación.
Se activan desde Mi perfil y se apagan cuando quieras.

ACCESO RESTRINGIDO

Esta aplicación no es de uso público. Solo pueden entrar las personas de la
nómina oficial del colegio, con su correo institucional @verbo.cl. Quien no
esté en esa nómina no puede crear una cuenta.

TU INFORMACIÓN

No hay publicidad, no hay rastreadores y no se comparte nada con terceros.
Puedes decidir no aparecer en la base de contactos, y puedes borrar tu cuenta
completa desde la propia aplicación, sin pedírselo a nadie.

Política de privacidad: https://sites.google.com/view/appcaa
Soporte: https://sites.google.com/view/appcaa/soporte

Desarrollada por Mateo Burgos para el Centro de Alumnos.
```

Desde la 1.1 la descripcion suma Casino y Central de apuntes, y la ultima
linea con quien la desarrollo. El nombre que Apple muestra bajo la app (el
"vendedor") es el del titular de la cuenta de desarrollador y no se puede
cambiar desde la ficha: por eso el credito va aqui. La descripcion solo se
puede editar al preparar una version nueva.

---

## Imágenes

| Qué | Dónde | Medida |
|---|---|---|
| Gráfico destacado | `capturas/google-play/grafico-1024x500.png` | 1024 × 500 |
| Capturas Android | `capturas/google-play/` | 1080 × 2400 |
| Capturas iPhone | `capturas/app-store/` | 1320 × 2868 |
| Icono | `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` | 512 × 512 |

La carpeta `capturas/` no se sube al repositorio: las imágenes muestran
contenido real de la aplicación, con nombres de personas.

---

## Formulario de seguridad de datos (Google Play)

**¿La app recopila o comparte datos de los usuarios?** Sí, recopila. **No
comparte** nada con terceros.

| Dato | ¿Obligatorio? | Para qué | ¿Ligado a la persona? |
|---|---|---|---|
| Nombre | Sí | Funcionamiento de la app | Sí |
| Correo electrónico | Sí | Gestión de la cuenta | Sí |
| Teléfono | No, opcional | Funcionamiento de la app | Sí |
| Curso | Sí | Funcionamiento de la app | Sí |

**Nada de esto se usa para publicidad ni para seguir a nadie.** No hay
identificadores de publicidad, ni analítica, ni rastreadores.

Respuestas al resto del formulario:

- ¿Los datos viajan cifrados? **Sí.**
- ¿Se pueden borrar? **Sí**, desde la propia aplicación, en Mi perfil →
  Eliminar mi cuenta.
- ¿Hay recopilación obligatoria para usar la app? **Sí**: sin cuenta no se
  entra, porque toda la información es de una comunidad cerrada.

---

## Clasificación de contenido

La app no tiene violencia, ni lenguaje adulto, ni compras, ni juegos de azar,
ni ubicación compartida, ni publicidad.

Sobre contenido publicado por usuarios: **los estudiantes no pueden publicar**.
Solo la directiva y los equipos designados por el colegio, y lo que publican lo
ve únicamente la comunidad del colegio. No hay comentarios, ni mensajería, ni
subida de fotos por parte de los estudiantes.

---

## Cuenta para los revisores

Google y Apple necesitan entrar a la aplicación para revisarla, y no están en
la nómina. Hay una cuenta creada para eso, oculta de la base de contactos.

El correo está en `supabase/09-cuenta-de-revision.sql`. **La contraseña no está
escrita en ninguna parte del repositorio**: se entrega solo en el formulario de
cada tienda.

---

## A qué edades va dirigida

**Trece años o más.** La nómina es solo de enseñanza media; no hay menores de
esa edad.

Eso importa porque, de haberlos, Google aplicaría su Política de Familias y
Apple su categoría de apps para niños, las dos con exigencias adicionales. No
es el caso, así que no hay nada extra que hacer.

---

## Lo que pide solo App Store

Apple usa campos que Google no tiene. La descripcion larga de arriba sirve
igual; estos son los que hay que escribir aparte.

**Nombre** (maximo 30 caracteres). Desde la version 1.1, y comprobado en
App Store Connect:

```
CAA Verbo
```

En la 1.0 era "App CAA". Se cambio porque "CAA" tambien es la sigla de
Comunicacion Aumentativa y Alternativa: buscando "App CAA", la app salia sexta,
detras de cinco apps de autismo. "CAA Verbo" ya salia primera. El nombre
es lo que mas pesa en la busqueda.

El nombre del icono en el telefono tambien dice "CAA Verbo" desde la 1.11: ese
sale del codigo, no de la ficha, y estaba quedado en "App CAA". Se cambia en
`capacitor.config.ts`, `android/.../strings.xml`, `ios/App/App/Info.plist`,
`index.html` y `public/manifest.webmanifest`.

Apple no deja repetir el nombre de otra app. Si App Store Connect dice que ya
esta usado, avisar antes de inventar otro.

**Subtitulo** (maximo 30 caracteres, sale bajo el nombre). Desde la 1.1:

```
Centro de Alumnos
```

En la 1.0 era "Colegio Del Verbo Divino". Con "Verbo Divino" ya en el nombre,
repetirlo aqui no suma: Apple junta nombre, subtitulo y palabras clave en un
solo indice.

**Texto promocional** (maximo 170, se puede cambiar sin publicar una version
nueva):

```
Los comunicados, los eventos y los beneficios del Centro de Alumnos, en tu telefono. El acceso es solo para la comunidad del colegio, con correo @verbo.cl.
```

**Palabras clave** (maximo 100 caracteres, separadas por coma y sin espacios).
Desde la 1.1:

```
colegio,comunicados,eventos,estudiantes,escolar,noticias,calendario,convenios,cursos,avisos
```

La regla: **ninguna palabra que ya este en el nombre o el subtitulo**. Apple
los junta, y repetir solo gasta espacio. Las de la 1.0 repetian "caa", "verbo
divino", "centro" y "alumnos".

**Categoria**: Educacion. Sin categoria secundaria.

**Clasificacion por edad**: se responde un cuestionario y Apple calcula el
numero. Todas las respuestas son "Ninguno": no hay violencia, ni lenguaje
adulto, ni juegos de azar, ni acceso web sin restricciones. Sale 4+, y esta
bien: la nomina es de ensenanza media, pero el contenido no tiene nada que
requiera una edad minima mayor.

**Categoria Kids**: NO. Es para ensenanza media, no para menores de 13.

**Derechos de contenido**: la app no contiene contenido de terceros.

---

## Informacion para el revisor de Apple

Apple no puede probar la app sin entrar, y no esta en la nomina. En el
formulario hay que marcar que **se requiere iniciar sesion** y entregar la
cuenta de revision.

En las notas conviene explicar por que la app es cerrada:

```
Esta es la aplicacion del Centro de Alumnos de un colegio. El acceso esta
restringido a los estudiantes de la nomina oficial del establecimiento, que
entran con su correo institucional. No es una aplicacion de uso publico y no
admite registro abierto.

Se adjunta una cuenta creada para la revision. Esa cuenta no aparece en la
base de contactos de la comunidad.

Los estudiantes no pueden publicar contenido: solo la directiva del Centro de
Alumnos y los equipos designados por el colegio.
```

Desde el 12 de septiembre de 2026, las notas completas para el revisor estan
en `docs/apple/2-notas-app-review.txt`, en ingles. Esas son las que valen.

---

## Novedades de la version 1.11

La 1.1 fue la renovacion grande; esta son los detalles que quedaron fuera. Por
eso el numero: 1.11 y no 1.2.

```
Los detalles que faltaban.

• Colaboradores renovado: los logos se ven parejos y cada descuento dice cómo se canjea sin ocupar media pantalla.
• Ahora se nota lo nuevo: las secciones con algo que no has visto llevan un número.
• Más color en toda la app, y el modo oscuro por fin se ve tan bien como el claro.
• Videos: las noticias y los eventos pueden traer un video para verlo dentro de la app.
• WhatsApp: escríbele directo a quien busques en Contactos.
• Te avisamos cuando subimos la comida del mes.
• Nueva categoría de descuentos: Ropa.
• La app ahora se llama "CAA Verbo" también bajo el ícono de tu teléfono.
```

---

## Novedades de la version 1.1

App Store lo pide en cada version nueva, en "Novedades de esta version". Lo lee
la gente que ya tiene la app, antes de actualizar: por eso habla de lo que
notan ellos y no de los arreglos internos.

```
¡La app se renovó entera!

• Diseño nuevo: portada con lo que pasa hoy, más color y una barra de navegación flotante.
• Casino: la minuta de la semana y lo que se come hoy, apenas abres la app.
• Central de apuntes: las carpetas de apuntes de tu generación, en un solo lugar.
• Colaboradores: cada descuento dice cómo se canjea (código, QR, en línea o en el local) y avisa cuando está por vencer.
• Te preguntamos si quieres recibir avisos, para que no te pierdas nada.
• Acceso más claro: se explica cómo activar tu cuenta y que el correo con el código puede tardar unos minutos.
• Instagram del Centro de Alumnos a un toque.
• Arreglos: la pantalla ya no se agranda al escribir y las fotos se ven completas.
```
