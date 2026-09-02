# Manual de uso · App CAA

Guía para administrar la aplicación **sin saber programar**.

---

## ⚠️ Lo primero que debes saber

La app todavía **no tiene servidor**. Eso significa que todo lo que publiques
desde la aplicación se guarda **solo en el navegador donde lo hiciste**.

- Si publicas una noticia en tu computador, tus compañeros **no la verán**.
- Si borras los datos del navegador, esos cambios se pierden.
- Sirve perfecto para **probar, mostrar y preparar** la app.

Para que todos vean lo mismo hace falta conectar un servidor. Es el siguiente
paso del proyecto y no cambia nada de lo que explica este manual.

En cambio, los cambios hechos **en los archivos** (imágenes, textos fijos,
colores) sí son permanentes y los verá todo el mundo.

---

## 1. Encender la aplicación

Abre una terminal en la carpeta del proyecto y escribe:

```bash
npm run dev
```

Luego abre `http://localhost:5173` en el navegador.
Para apagarla: `Ctrl + C` en la terminal.

---

## 2. Quién puede entrar

El acceso está cerrado a la **nómina oficial**. Para entrar hacen falta cuatro cosas:

1. que el correo sea `@verbo.cl`,
2. que la persona figure en la nómina,
3. que haya creado su contraseña, y
4. que haya comprobado su correo con un código.

Un correo `@verbo.cl` que no esté en la lista **no puede entrar**, aunque exista
en el colegio. Ve el mensaje: *«Ese correo no figura en la nómina habilitada»*.

### Cómo entra un alumno la primera vez

Nadie se "crea una cuenta": la cuenta **ya existe**, generada desde la nómina.
Lo único que falta es ponerle contraseña. Son dos pantallas:

| Pantalla | Dirección | Para qué |
| --- | --- | --- |
| **Activar mi cuenta** | `/registro` | Solo la primera vez: crear la contraseña |
| **Iniciar sesión** | `/acceso` | Todas las veces siguientes |

**Activar mi cuenta** son tres pasos:

1. **Correo.** El alumno lo escribe y la app le muestra su nombre y su curso
   para que confirme que es él.
2. **Contraseña.** Mínimo 8 caracteres, con al menos una letra y un número. Se
   guarda **cifrada**: nadie puede leerla, ni siquiera ustedes.
3. **Código.** Le llega un código de 6 dígitos a su correo institucional y tiene
   que escribirlo. Así se comprueba que el correo es de verdad suyo.

Diles a los alumnos: **la primera vez, "Activar mi cuenta"; después, "Iniciar
sesión"**.

### El código de verificación

| | |
| --- | --- |
| Dura | 10 minutos |
| Intentos | 5, después hay que pedir uno nuevo |
| Entre un envío y otro | 60 segundos de espera |

Si alguien cierra la app a mitad del registro, no pasa nada: la próxima vez que
entre con su correo y contraseña, la app retoma sola el paso del código.

> ⚠️ **Mientras no enciendas el servidor de correo**, el código no se envía: se
> muestra en pantalla dentro de un recuadro amarillo que dice «Modo de prueba».
> Sirve para probar todo el flujo, pero **no lo dejes así cuando los alumnos
> empiecen a usar la app**: cualquiera vería el código de la cuenta que esté
> activando. Cómo encenderlo está en `docs/servidor-de-correo/README.md`.

### Si alguien olvida su contraseña

No hay correo de recuperación, así que lo resuelven ustedes:

1. Entra como Administrador a **Cuentas y permisos**.
2. Busca a la persona. Debajo de su tarjeta dice en qué estado está.
3. Pulsa **Restablecer**.

La persona vuelve a quedar como el primer día —sin contraseña y sin verificar— y
entra otra vez por **Activar mi cuenta**.

En esa misma pantalla, las etiquetas te dicen quién es quién:

| Etiqueta | Significa |
| --- | --- |
| **Sin activar** | Todavía no ha creado su contraseña |
| **Sin verificar** | Creó la contraseña pero no escribió el código |
| *(sin etiqueta)* | Cuenta lista y funcionando |

> ⚠️ **Ojo mientras no haya servidor:** la contraseña se guarda en el
> dispositivo donde se creó. Si un alumno activa su cuenta en el computador y
> después abre la app en el teléfono, tendrá que activarla de nuevo ahí. Esto se
> arregla solo cuando la app tenga servidor.

### ⚠️ La nómina no se sube a internet

`src/content/roster.ts` tiene nombres y correos de menores de edad, así que
**no forma parte del repositorio**: está en `.gitignore` y vive solo en los
computadores del Centro de Alumnos.

Consecuencias prácticas:

- Si clonas el proyecto en otro computador, ese archivo **no viene**. Cópialo
  a mano desde el computador que lo tenga.
- Sin él, la app arranca con una **nómina de demostración** de 13 alumnos
  inventados (`roster.demo.ts`). No es un error: es lo que protege los datos.
- La versión publicada en internet usa siempre esa nómina inventada.
- **Guarda una copia del archivo en un lugar seguro.** Si se pierde, hay que
  volver a generarlo desde las listas del colegio.

### Agregar un curso o una generación

La nómina está en **`src/content/roster.ts`**. Cada estudiante es una línea:

```ts
{ name: 'Apellido Apellido Nombre', email: 'correo@verbo.cl', grade: '8° Básico A' },
```

Para sumar III y IV Medio (o a alguien que faltó):

1. Copia una línea, pégala al final del bloque que corresponda y cambia los tres
   datos. Respeta las comillas y la coma del final.
2. Si el curso es nuevo, agrégalo también a la lista `grades` de
   `src/config/app.config.ts`, escrito **exactamente igual**.
3. Sube el `version` en `src/content/seed/index.ts` (por ejemplo, de
   `2026-08-23.nomina-1` a `2026-08-23.nomina-2`).

> ⚠️ El paso 3 vuelve a crear las cuentas **y borra el contenido que hayas
> cargado desde la app en ese navegador**. Haz los cambios de nómina antes de
> ponerte a cargar noticias, beneficios y eventos.

### Sacar a alguien

No hace falta borrarlo de la nómina: entra como Administrador a
**Cuentas y permisos** y usa **Desactivar**. Deja de poder entrar de inmediato y
desaparece de la base de contactos.

---

## 3. Entrar como administrador

La cuenta de administración también se activa una sola vez. Entra a
**Activar mi cuenta** (`/registro`), escribe:

```
centrodealumnos@verbo.cl
```

y crea la contraseña del Centro de Alumnos. De ahí en adelante entras por
**Iniciar sesión** con ese correo y esa clave.

Solo la cuenta de **Administrador** puede publicar contenidos: comunicados,
noticias, eventos, inscripciones, beneficios y resultados de las selecciones.
Las otras dos cuentas de prueba son:

| Cuenta | Correo | Qué puede hacer |
| --- | --- | --- |
| Administrador | `centrodealumnos@verbo.cl` | Todo |
| Moderador | `moderacion@verbo.cl` | Revisar publicaciones y reportes |
| Estudiante | cualquiera de la nómina | Solo participar |

> ⚠️ **Antes de abrir la app a los alumnos**, pon `enableDemoAccounts: false` en
> `src/config/app.config.ts`. Mientras esté en `true`, cualquiera que llegue a
> la pantalla de acceso entra como administrador con un clic.

---

## 4. Cómo personalizar la app y que quede guardado

Esta es la parte más importante del manual si vas a empezar a dejar la app a tu
gusto. Hay **dos tipos de cambio** y se guardan de forma distinta.

### Tipo 1 — El contenido (lo que cambiarás todos los días)

Noticias, comunicados, eventos, inscripciones, beneficios y resultados del 365.
Todo eso se publica y se edita **desde la app**, en Administración →
**Contenidos**. No hay que tocar ningún archivo.

Pero ojo con esto, porque es la clave:

> Lo que publicas desde la app se guarda **solo en el navegador donde lo
> hiciste**. Nadie más lo ve. Para que pase a ser el contenido de verdad de la
> aplicación hay que dar un paso más.

**El paso más — exportar:**

1. Trabaja tranquilo en la app: crea, edita y borra hasta que quede como quieres.
2. Entra a **Administración** y pulsa **Exportar contenido**. Se descarga un
   archivo llamado `contenido.json`.
3. Guarda ese archivo en la carpeta **`src/content/seed/`** del proyecto,
   reemplazando el que hubiera.

Listo. A partir de ahí ese contenido es el oficial de la app: sobrevive a que
cierres el navegador, a cambiar de computador y a actualizar la nómina.

Puedes repetirlo cuantas veces quieras: trabajas, exportas, reemplazas. Cada
exportación pisa a la anterior.

En Administración, la tarjeta de exportar te avisa sola cuando tienes trabajo
que solo existe en el navegador:

> **Tienes 3 cambios sin exportar** — 1 nuevo · 1 editado · 1 eliminado

Cuando dice *«No hay cambios pendientes»*, lo que ves en la app es exactamente
lo que está guardado en el proyecto. Esa es la señal de que puedes cerrar
tranquilo.

También verás una etiqueta que te dice en qué modo estás:

| Etiqueta | Significa |
| --- | --- |
| **Contenido de ejemplo** | Todavía no has exportado: se ve el contenido de demostración |
| **Contenido propio** | Ya hay un `contenido.json` y manda ese |

> ⚠️ El botón **Restaurar contenido de ejemplo** (en Perfil) borra todo lo que
> hayas publicado y no exportado. Ahora pregunta antes, pero no te confíes:
> **exporta antes de tocarlo**. Si ya exportaste, restaurar te devuelve a tu
> propio contenido, no al de demostración.

### Tipo 2 — La identidad de la app (lo que cambiarás una vez)

Estas cosas no están en la app: se cambian en archivos y quedan guardadas para
siempre desde el momento en que las escribes.

| Qué quieres cambiar | Dónde |
| --- | --- |
| Nombre del Centro de Alumnos, colegio, periodo | `src/config/app.config.ts` |
| Qué secciones están activas | `src/config/app.config.ts` (`enabledModules`) |
| Cursos del colegio | `src/config/app.config.ts` (`grades`) |
| Colores | `src/styles/theme.css` |
| Fotos | `src/content/images.ts` + la carpeta `public/images/` |
| Categorías y textos fijos | `src/content/taxonomies.ts` |

Cada uno está explicado más abajo en su propia sección.

### En qué orden conviene hacerlo

1. Primero la **nómina** (sección 2), antes de cargar nada.
2. Después la **identidad**: nombres, colores, cursos.
3. Después las **fotos**.
4. Y al final el **contenido**, trabajando desde la app y exportando.

Va en ese orden porque cambiar la nómina obliga a re-sembrar, y eso borraría el
contenido que hubieras cargado sin exportar.

---

## 5. Publicar y editar los contenidos

**Esto se hace desde la propia app. No tocas ningún archivo.**

1. Entra como Administrador.
2. Abre el menú **Más** (abajo a la derecha en el celular) → **Administración**.
3. Toca **Contenidos**.
4. Arriba verás seis pestañas, que se deslizan hacia el lado:
   **Comunicados · Noticias · Eventos · Inscripciones · Beneficios · 365**.
5. Botón **Crear** para una nueva, o el ícono del lápiz ✏️ para editar una
   existente. El basurero 🗑️ la elimina.

### Qué te pide cada formulario

**Comunicado** — el aviso corto del día a día
- *Título* — directo y concreto.
- *Contenido* — el texto del aviso. Deja una línea en blanco entre párrafos.
- *Prioridad* — Informativo, Importante o Urgente. Guarda «Urgente» para lo que
  de verdad no puede esperar: si todo es urgente, nada resalta.
- *Dirigido a* — a quién le sirve (toda la comunidad, un nivel, los delegados…).
- *Fijar* — lo deja arriba del listado hasta que lo desmarques.

> **¿Comunicado o noticia?** El comunicado es el aviso de hoy: «cambio de sala»,
> «mañana cierra la colecta». La noticia es una pieza más trabajada, con foto y
> bajada. Los comunicados aparecen además en la pantalla de Inicio.

**Noticia**
- *Título* — el titular.
- *Bajada* — resumen de una o dos líneas; es lo que se ve en el listado.
- *Categoría* — Comunicados, Deportes, Cultura, etc.
- *Cuerpo* — el texto completo. Deja una línea en blanco entre párrafos.
- *Imagen* — se elige de una lista (ver punto 5).
- *Destacar* — la muestra arriba en la pantalla de Inicio.

**Evento**
- Título, categoría, fecha y hora de inicio, término (opcional), lugar,
  descripción, requisitos y datos de contacto.

**Inscripción (convocatoria)**
- Título, tipo de actividad, descripción, fecha de cierre y cupos.
- Si dejas los cupos vacíos, no hay límite.
- La casilla *Recibir inscripciones* abre o cierra la convocatoria.

**Beneficio** — los convenios de la campaña
- *Nombre del beneficio* — lo que gana el estudiante: «2x1 en combos».
- *Comercio o institución* — quién lo otorga.
- *Resumen* — una línea; es lo que se lee en el listado.
- *De qué se trata* — la explicación completa que el estudiante lee antes de
  canjear.
- *Condiciones de uso* — topes, restricciones, si se acumula con otras ofertas.
- *Contenido del código QR* — **lo que el comercio lee al escanear**. Puede ser
  un código (`CAA2026-COMBO-2X1`) o una dirección web. Apenas lo escribas verás
  la **vista previa del código**: así compruebas que quedó bien antes de
  publicarlo.
- *Código escrito* — el mismo código en letras, por si el lector del local falla.
- *Vigente hasta* — al vencer, el beneficio deja de poder canjearse pero sigue
  a la vista.
- *Disponibilidad* — desmárcala para suspender un convenio sin borrarlo.

**Resultado de 365** — cómo le fue a las selecciones
- *Disciplina* y *Categoría* — fútbol, básquetbol, tenis, vóleibol o atletismo,
  en infantil, intermedia o superior.
- *Rival o prueba* — el equipo contrario, o el nombre del encuentro en atletismo.
- *Marcador* — escribe los dos números y la app deduce sola si fue victoria,
  empate o derrota: no puede quedar un 3-1 registrado como derrota.
- *Sin marcador* — para atletismo y encuentros formativos. Se marca sola al
  elegir atletismo y el resultado queda como «participación».
- *Detalle* — goleadores, tiempos, posiciones obtenidas.

### Proyectos

Es el apartado de las iniciativas del colegio: las que siguen funcionando y las
que ya terminaron. Está pensado para los cursos más pequeños, así que conviene
escribir simple.

El formulario te pide:

| Campo | Para qué |
| --- | --- |
| **Nombre** | Como lo conoce todo el mundo en el colegio |
| **En una frase** | Lo único que se lee en el listado |
| **De qué se trata** | Cómo partió, qué hace, qué ha logrado |
| **Área** | Sirve para los filtros. Se editan en `taxonomies.ts` |
| **Estado** | *En marcha* o *Ya terminó* |
| **Años** | El de término solo se pide si ya terminó |
| **A cargo de** | Academia, taller, curso… (opcional) |
| **Cómo participar** | Solo en los que están en marcha (opcional) |

Los que están **en marcha** salen primero, en su propio bloque; abajo van los
**ya terminados**. No hay que configurar nada: se separan solos según el estado.

**Cómo participar** aparece destacado en un recuadro verde, porque es lo que más
busca un alumno de básica que entra a mirar.

Las fotos de los proyectos se agregan igual que las demás (sección 6), con
claves que empiezan por `projects.`

### El calendario se llena solo

**No hay que cargar nada en el Calendario.** Esa pantalla junta lo que ya
publicaste en otras partes:

- los **eventos**, con los días que duren (una semana de aniversario se pinta
  completa, de principio a fin);
- los **cierres de inscripción**, para que nadie se quede fuera por olvido.

Publicas el evento una sola vez y aparece en su listado y en el calendario. Así
no hay dos listas que puedan terminar diciendo cosas distintas.

### La base de contactos

Tampoco se carga aparte: usa **las mismas cuentas** de
*Administración → Cuentas y permisos*. Ahí mismo puedes escribir el **teléfono**
de cada persona; se guarda al salir del campo.

Cada estudiante controla si aparece: en **Mi perfil → Editar perfil** hay una
casilla *«Quiero aparecer en el buscador de contactos»*. Si la desmarca, nadie
lo encuentra ahí, aunque tenga teléfono cargado.

### Revisar lo que publican los estudiantes

Hoy no hay ningun modulo donde publiquen los estudiantes, asi que esta cola se
mantiene vacia. La herramienta queda lista por si mas adelante se habilita uno.

**Administración → Cola de revisión** → botones **Aprobar**, **Pedir cambios** o
**Rechazar**. Si rechazas o pides cambios, debes escribir un comentario: el
estudiante lo verá en su perfil.

En **Administración → Reportes** aparece lo que la comunidad denuncia.

### Cambiar permisos de una persona

**Administración → Cuentas y permisos**: ahí conviertes a alguien en Moderador o
Administrador, o desactivas su cuenta.

---

## 6. Poner las imágenes

Aquí sí hay que editar **un archivo**, pero es copiar y pegar. Son dos pasos.

### Los logotipos de los colaboradores son un caso aparte (más fácil)

Para los 15 colaboradores **no hay que editar ningún archivo**. Las rutas ya
están anotadas: solo deja la imagen en su carpeta con el nombre correcto.

1. Abre la carpeta **`public/images/colaboradores/`**
2. Copia ahí el logotipo con el nombre que corresponda:

```
colaborador-01.png   ← logo del "Colaborador 1"
colaborador-02.png   ← logo del "Colaborador 2"
...
colaborador-15.png
```

3. Recarga la aplicación. El logo aparece solo.

**Mientras no exista el archivo**, la app muestra las iniciales del colaborador
en un cuadrito de color. No queda nada roto ni ningún hueco punteado, así que
puedes ir poniéndolos de a uno, sin apuro.

Recomendaciones: formato PNG, cuadrado, mínimo 200×200 píxeles, fondo claro o
transparente. Si tu logo es `.jpg`, cámbiale la extensión a `.png` y funciona
igual.

Hay un recordatorio con todo esto en `public/images/colaboradores/LEEME.txt`.

---

### Paso 1 — Copiar la foto a su carpeta

Dentro del proyecto está la carpeta `public/images/`. Copia tu foto ahí,
en la subcarpeta que corresponda:

```
public/images/noticias/       ← fotos de noticias
public/images/eventos/        ← fotos de eventos
public/images/inscripciones/  ← fotos de convocatorias
public/images/comunidad/      ← fotos de organizaciones
public/images/beneficios/     ← logos de los comercios en convenio
public/images/brand/          ← portada de la pantalla de acceso
```

> La app te dice exactamente dónde va cada foto: donde falta una imagen aparece
> un recuadro punteado que dice **IMAGEN PENDIENTE** con la ruta escrita.

### Paso 2 — Avisarle a la app

Abre el archivo `src/content/images.ts` con el Bloc de notas (o cualquier editor).
Busca la entrada que corresponde. Por ejemplo, para la foto de la asamblea verás:

```ts
'news.asamblea': pending(
  'Foto de la asamblea estudiantil o reunión del Centro de Alumnos',
  'public/images/noticias/asamblea.jpg',
),
```

Reemplaza **ese bloque completo** por este otro:

```ts
'news.asamblea': {
  src: '/images/noticias/asamblea.jpg',
  alt: 'Estudiantes reunidos en la asamblea de marzo',
  description: 'Foto de la asamblea estudiantil',
  ratio: '16/9',
  suggestedPath: 'public/images/noticias/asamblea.jpg',
},
```

Guarda el archivo. La foto aparece sola, sin reiniciar nada.

**Tres detalles que importan:**

1. En `src` la ruta **no lleva la palabra `public`**. Se escribe
   `/images/noticias/asamblea.jpg`.
2. El nombre del archivo debe coincidir **exactamente**, incluidas mayúsculas y
   la extensión (`.jpg` o `.png`).
3. En `alt` describe la foto en pocas palabras. Es lo que escuchan las personas
   ciegas que usan la app.

### Agregar una imagen que no existe en la lista

Copia una entrada cualquiera y cámbiale el nombre:

```ts
'news.gala-invierno': pending(
  'Foto de la gala de invierno',
  'public/images/noticias/gala-invierno.jpg',
),
```

Al crear una noticia desde la app, esa opción aparecerá en el selector de imagen.

### Cambiar el logo

Reemplaza estos dos archivos, conservando los mismos nombres:

- `public/icons/logo.png` — el logo que se ve dentro de la app (horizontal).
- `public/icons/icon.png` — versión cuadrada, es el ícono al instalar la app.

---

## 7. Cambiar textos fijos y categorías

| Qué quieres cambiar | Archivo |
| --- | --- |
| Nombre del centro de alumnos, año, cursos | `src/config/app.config.ts` |
| Correo permitido para entrar | `src/config/app.config.ts` |
| Quiénes pueden acceder (nómina) | `src/content/roster.ts` |
| Categorías de noticias, eventos, proyectos, colaboradores | `src/content/taxonomies.ts` |
| Disciplinas y categorías de las selecciones (365) | `src/content/taxonomies.ts` |
| A quién se dirigen los comunicados | `src/content/taxonomies.ts` |
| Colores de la app | `src/styles/theme.css` |

En todos los casos: abre el archivo, cambia el texto **entre comillas**, guarda.
Nunca borres las comillas, las comas ni los corchetes.

---

## 8. Si algo se rompe

- **La pantalla queda en blanco** → probablemente falta una coma o una comilla en
  el archivo que editaste. Deshaz el cambio (`Ctrl + Z`) y guarda.
- **Quiero volver al contenido original** → entra a **Perfil** y toca
  *Restaurar contenido de ejemplo*.
- **No aparece la foto** → revisa que el nombre del archivo coincida exacto y que
  la ruta en `src` empiece por `/images/` (sin `public`).
- **El calendario está vacío** → el calendario solo muestra eventos publicados y
  convocatorias abiertas. Revisa que el evento tenga fecha de inicio y que la
  convocatoria siga marcada como *Recibir inscripciones*.
- **El QR sale gris o no se lee** → sube el brillo del celular. El código se
  dibuja siempre oscuro sobre blanco, incluso con la app en modo oscuro, porque
  al revés los lectores no lo toman.
- **Alguien no aparece en Contactos** → o su cuenta está desactivada, o desmarcó
  la casilla del buscador en su perfil. Es su decisión y no se puede forzar
  desde administración.
