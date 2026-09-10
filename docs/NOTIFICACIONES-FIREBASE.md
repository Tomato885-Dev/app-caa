# Notificaciones en la app instalada

En el navegador los avisos ya funcionan. En la app descargada desde Google Play
o App Store, **no**: un navegador metido dentro de una app no tiene permiso
para mostrar notificaciones del sistema. Ahí el aviso lo entrega el propio
teléfono, y quien se lo pasa al teléfono es **Firebase**.

Firebase es gratis para esto y es de Google. Habla con Android directamente y
con Apple por detrás, así que sirve para las dos tiendas: se le entrega el
aviso una sola vez y él lo reparte.

**Nada de esto cambia lo que ya funciona.** Quien use la app en el navegador la
sigue recibiendo igual que hasta ahora.

---

## Lo que hay que conseguir

Son dos archivos. Uno va dentro del proyecto y el otro va a Supabase.

| Archivo | De dónde sale | A dónde va |
|---|---|---|
| `google-services.json` | Firebase → tu app de Android | dentro del proyecto |
| La clave de cuenta de servicio (`.json`) | Firebase → Cuentas de servicio | un secreto en Supabase |

El segundo **no se guarda en el proyecto, ni se manda por correo, ni se pega en
un chat**. Quien lo tenga puede mandarle una notificación a los 694 alumnos
haciéndose pasar por el Centro de Alumnos.

---

## Paso 1 — Crear el proyecto en Firebase

1. Entra a <https://console.firebase.google.com> con la cuenta del Centro de
   Alumnos (`centrodealumnoscvd2027@gmail.com`), no con tu cuenta personal. El
   día que cambie la directiva, el proyecto se traspasa junto con el correo.
2. **Crear un proyecto**. De nombre pon `App CAA`.
3. Cuando pregunte por **Google Analytics**, dile que **no**. No lo usamos, y
   activarlo obligaría a declarar en las dos tiendas que la app recoge datos de
   uso, que es justo lo que la política de privacidad dice que no hace.
4. Espera a que termine y entra al proyecto.

---

## Paso 2 — Registrar la app de Android

1. En la portada del proyecto, toca el icono de **Android**.
2. **Nombre del paquete**: escríbelo exactamente así, sin espacios:

   ```
   cl.verbo.centroalumnos
   ```

   Tiene que coincidir carácter por carácter con el que ya está en Google Play.
   Si te equivocas, las notificaciones no llegan y no avisa nadie.
3. **Apodo** (opcional): `App CAA`.
4. **Certificado SHA-1**: déjalo vacío. Hace falta para otras cosas de Firebase,
   no para las notificaciones.
5. **Registrar app**.
6. Firebase te ofrece descargar **`google-services.json`**. Descárgalo.
7. Guárdalo dentro del proyecto, en esta carpeta exacta:

   ```
   android/app/google-services.json
   ```

   Justo al lado de `build.gradle`. Si queda en otra carpeta, la app compila
   igual pero las notificaciones nunca llegan.
8. Los pasos siguientes que muestra Firebase (agregar el SDK, tocar archivos de
   Gradle) **ya están hechos**. Dale a Siguiente hasta salir.

---

## Paso 3 — La llave con la que el servidor envía

Esta es la que hay que cuidar.

1. En Firebase, arriba a la izquierda, la rueda dentada → **Configuración del
   proyecto**.
2. Pestaña **Cuentas de servicio**.
3. Botón **Generar nueva clave privada** → **Generar clave**. Se descarga un
   archivo `.json`.
4. Ábrelo con el Bloc de notas y **copia todo el contenido**, desde la primera
   llave `{` hasta la última `}`.
5. Entra a Supabase → tu proyecto → **Edge Functions** → **Secrets**.
6. **Add new secret**:
   - Nombre: `FIREBASE_CUENTA_SERVICIO`
   - Valor: todo lo que copiaste
7. Guarda.
8. **Borra el archivo descargado de tu computador.** Ya está guardado donde
   corresponde, y una copia suelta en Descargas es una copia de más.

Si algún día se filtra, se arregla desde la misma pantalla de Firebase:
se borra esa clave y se genera otra.

---

## Paso 4 — Probar que llega

1. Compila la app y ábrela en un teléfono Android de verdad. En un emulador sin
   servicios de Google no funciona.
2. Entra con tu cuenta, ve a **Mi perfil → Avisos** y toca **Activar los
   avisos**. El teléfono va a preguntar; acepta.
3. Desde Administración, publica algo y manda el aviso.
4. Cierra la app del todo y comprueba que la notificación llega igual.

Si no llega, casi siempre es una de tres:

- `google-services.json` no está en `android/app/`;
- el nombre del paquete de Firebase no es `cl.verbo.centroalumnos`;
- el secreto de Supabase se pegó incompleto o con el nombre mal escrito.

---

## Sobre `google-services.json` en el repositorio

Ese archivo **sí** se sube al repositorio, aunque sea público. No es una llave:
es la dirección del proyecto, y lo mismo va dentro de cada copia instalada de
la app, así que cualquiera podría sacarlo del paquete de todos modos. Para
*enviar* un aviso hace falta la del Paso 3, que no está ahí.

Sin subirlo, nadie más podría compilar la app.

---

## Mañana: iPhone

El mismo Firebase sirve para los dos. Para iPhone falta:

1. En Firebase, registrar también la app de **iOS** con el mismo identificador.
2. En <https://developer.apple.com>, crear una **clave de notificaciones
   (APNs)**. Se descarga un archivo `.p8` que Apple deja bajar **una sola vez**.
3. Subir ese `.p8` a Firebase, en Configuración del proyecto → **Cloud
   Messaging** → sección de iOS.

No hay que tocar código: la app ya pide el permiso y guarda el registro igual
en los dos sistemas.
