# La respuesta a Apple

Apple no rechazó la aplicación por un error: pidió información. Es la revisión
que le hacen a toda cuenta de desarrollador nueva antes de dejarla publicar por
primera vez. **No hay que tocar ni una línea de código, ni subir una
compilación nueva.** La 12 sigue esperando ahí.

Lo que pidieron son seis cosas, y son todas información.

---

## Cómo está organizado esto

Hay dos clases de texto y conviene no mezclarlas. Este archivo es solo para ti,
en español, y no se le manda a nadie. Lo que va a Apple está aparte, ya
redactado en inglés, en dos archivos que se copian enteros de una sola vez:

| Archivo | Dónde se pega | Qué es |
|---|---|---|
| `apple/1-resolution-center.txt` | Resolution Center | La respuesta completa, contestando los seis puntos en el mismo orden en que Apple los numeró. |
| `apple/2-notas-app-review.txt` | App Store Connect → App Review Information → **Notes** | Lo mismo resumido. Va aparte porque **ese campo acepta 4.000 caracteres y la respuesta completa tiene 9.423**. |

Apple pidió las dos cosas: responder *y* dejarlo guardado en las notas, para no
tener que volver a explicarlo en cada versión futura.

Los dos archivos se abren, se selecciona todo (`Ctrl + A`), se copia y se pega.
No hay que ir armando nada a mano.

**Lo único que hay que editar** es `1-resolution-center.txt`: donde dice
`CORREO` y `CONTRASENA` van los de la cuenta de revisión. La contraseña no está
escrita en ningún archivo del proyecto y así tiene que quedar: cuando termines
de pegarla en App Store Connect, déjala fuera del archivo otra vez.

---

## El orden de las cosas

### Paso 0 · Cuatro comprobaciones antes de grabar

Un minuto cada una. Si alguna falla, el video hay que rehacerlo.

**1. Que la cuenta de revisión entre.** Ábrela en TestFlight en tu iPhone y
entra con ella. Si la contraseña no funciona, Apple tampoco va a poder entrar y
te rechazan sin mirar nada más.

**2. Deja las dos contraseñas copiadas en la app Notas del iPhone.** En el
video se pegan, no se escriben. El porqué está en el paso 1.

**3. Que el iPhone esté al día.** Ajustes → General → Actualización de
software. Apple pide el video *"running the latest operating system"*.

**4. Que las credenciales estén en el formulario, no solo en las notas.** En
App Store Connect → App Review Information, la casilla **"Sign-in required"**
tiene que estar marcada, con el correo y la contraseña de la cuenta de revisión
escritos ahí. Es un campo distinto del de Notes.

**5. Que tu cuenta personal vuelva a entrar después de borrarte.** En Supabase
→ SQL Editor, con tu correo:

```sql
select correo, rol_inicial, habilitado from public.nomina where correo = 'TU-CORREO@verbo.cl';
```

Tiene que devolver una fila con `habilitado = true`. El `rol_inicial` es el rol
con el que vas a volver a entrar cuando te registres de nuevo en el video.

---

### Paso 1 · Grabar el video

Apple lo pide grabado **en un iPhone de verdad** (no en el simulador) y tiene
que **empezar cuando se abre la aplicación**.

Se graba con la propia función del iPhone: Ajustes → Centro de control →
agregar "Grabación de pantalla". Después se desliza desde arriba a la derecha y
se toca el círculo.

#### Se usan dos cuentas, y el orden importa

> ⚠️ **Nunca borres la cuenta de revisión.** Su correo no tiene buzón de verdad:
> se creó a mano en el panel de Supabase. Si la borras no puede volver a
> registrarse, porque el registro pide un código que llega por correo y ese
> correo no lo recibe nadie. Apple se quedaría sin poder entrar.

Por eso el borrado y el registro se muestran con **tu** cuenta personal, que sí
recibe correos.

**Parte 1 — con la cuenta de revisión** (la misma que le entregas a Apple)

| # | Qué se hace |
|---|---|
| 1 | Abrir la app desde la pantalla de inicio del iPhone, cerrada del todo |
| 2 | Pantalla de acceso: pegar el correo y la contraseña de revisión, entrar |
| 3 | Recorrer Inicio, Comunicados (abrir uno), Noticias, Eventos, Calendario, 365, Proyectos, Colaboradores (abrir uno y que se vea el código de canje), Contactos |
| 4 | Mi perfil → activar las notificaciones → que se vea el permiso del sistema |
| 5 | Mi perfil → que se vea el botón "Eliminar mi cuenta" **sin tocarlo** |
| 6 | Cerrar sesión |

**Parte 2 — con tu cuenta personal @verbo.cl**, sin cortar la grabación

| # | Qué se hace |
|---|---|
| 7 | Entrar con tu correo y tu contraseña |
| 8 | Mi perfil → Eliminar mi cuenta → confirmar → la app vuelve al acceso |
| 9 | Crear cuenta → tu mismo correo @verbo.cl → llega el código → escribirlo → entrar |

El paso 3 es lo que Apple llama *"the typical user flow"*, y por eso va con la
cuenta de estudiante: el revisor tiene que ver lo mismo que verá cuando entre
él. Los pasos 8 y 9 son los que más miran: si una app deja crear cuenta, tiene
que dejar borrarla desde adentro, y quieren verlo pasar.

En el paso 9, el código llega por correo. No hace falta abrir el buzón en
cámara: se alcanza a leer en la notificación que aparece arriba.

#### El video es privado, pero hay que mantenerlo así

Lo que se manda por el Resolution Center lo ve **solo el equipo de revisión de
Apple**. Es un canal privado de la cuenta de desarrollador: no se publica en
ninguna parte, no aparece en la ficha de la App Store y no lo ve nadie del
colegio. Lo mismo vale para el campo Notes y para las credenciales del
formulario.

Aun así, el video muestra dos cosas que no pueden salir de ahí: **contraseñas**
y, en la sección Contactos, **los nombres, correos y teléfonos de unos 700
menores de edad**. De ahí estas dos reglas.

**Adjunta el archivo, no pongas un enlace.** Un video de dos o tres minutos
pesa entre 20 y 30 MB y entra como adjunto. Subirlo a YouTube "no listado" o a
Drive con "cualquiera con el enlace" significa que cualquiera que consiga la
dirección lo abre, y ahí van los datos de los 700. Si quedara muy pesado, se
recorta o se graba de nuevo más corto; nunca se resuelve con una nube abierta.

**Pega las contraseñas, no las escribas.** El campo muestra puntitos, pero el
teclado del iPhone dibuja una burbuja ampliada con cada letra que tocas, y la
grabación la capta. En el video: tocar el campo, mantener apretado, "Pegar".
Cero teclas, cero burbujas.

Si prefieres una red más: cámbiale la contraseña a tu cuenta personal por una
temporal antes de grabar, y vuelve a cambiarla desde Mi perfil cuando termines.
Así, aunque el video se filtrara, la contraseña que se ve ya no sirve. Con la
cuenta de revisión esto no se puede hacer: su contraseña tiene que seguir
siendo la misma que está escrita en el formulario de App Store Connect.

---

### Paso 2 · Pegar las notas

App Store Connect → la app → **App Review Information** → campo **Notes**.

Se pega entero el contenido de `apple/2-notas-app-review.txt`. Son 3.446
caracteres y el límite es 4.000.

Aprovecha de comprobar ahí mismo lo del paso 0.4: que "Sign-in required" esté
marcado y con las credenciales.

Guardar.

---

### Paso 3 · Responder en el Resolution Center

App Store Connect → la app → el mensaje de Apple → responder.

1. Abrir `apple/1-resolution-center.txt`.
2. Reemplazar `CORREO` y `CONTRASENA` por los de la cuenta de revisión.
3. Seleccionar todo, copiar, pegar en la respuesta.
4. **Adjuntar el video.**
5. Enviar.

---

## Y después

Apple retoma la revisión sin que haya que subir nada. Si vuelven a escribir por
el Resolution Center, se responde por ahí mismo.

Solo si pidieran un cambio en la aplicación habría que compilar de nuevo, y eso
se hace lanzando otra vez el flujo `ios.yml` en GitHub.

---

## Qué pidió Apple, y dónde quedó contestado

Para revisar que no falte nada.

| Lo que pidieron | Dónde está |
|---|---|
| 1 · Video en teléfono físico, desde que se abre la app | Paso 1 |
| 1a · Registro, inicio de sesión y borrado de cuenta | Video, pasos 2, 8 y 9 |
| 1b · Contenido de usuarios, con reporte y bloqueo | No aplica. Explicado en la sección 3 de la respuesta |
| 1c · Contenido de pago | No aplica. Explicado en la sección 3 de la respuesta |
| 2 · Propósito y público objetivo | Sección 2 de la respuesta |
| 3 · Instrucciones de acceso y credenciales | Sección 3 de la respuesta |
| 4 · Servicios externos | Sección 4 de la respuesta |
| 5 · Diferencias por región | Sección 5 de la respuesta |
| 6 · Industria regulada o material de terceros | Sección 6 de la respuesta |
| Además · Pauta 3.2 | Nota final de la respuesta, contestada por adelantado |
