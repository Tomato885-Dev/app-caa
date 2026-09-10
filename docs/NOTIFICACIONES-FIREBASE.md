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

## Paso 5 — iPhone

El mismo Firebase sirve para los dos. **Del lado del código ya está todo
hecho**: el permiso especial que exige Apple, el aviso al sistema cuando
entrega el identificador, y el plugin declarado en el proyecto de Xcode.

Faltan tres cosas, y ninguna es de programar.

### 5.1 · Registrar la app de iPhone en Firebase

1. En la portada del proyecto de Firebase, **Agregar app** → icono de **Apple**.
2. **ID del paquete**: el mismo de siempre, `cl.verbo.centroalumnos`.
3. Descarga el **`GoogleService-Info.plist`**.
4. Guárdalo aquí, con ese nombre exacto:

   ```
   ios/App/App/GoogleService-Info.plist
   ```

> **Sin ese archivo la app de iPhone no compila.** Está declarado dentro del
> proyecto de Xcode a propósito: es preferible que el error salte al compilar,
> y no que la app llegue a la App Store sin poder recibir un solo aviso.

### 5.2 · La clave de notificaciones de Apple

1. Entra a <https://developer.apple.com/account> → **Certificates, Identifiers
   & Profiles** → **Keys** → el botón **+**.
2. Nombre: `App CAA`. Marca **Apple Push Notifications service (APNs)**.
3. Continuar → Registrar → **Descargar**.

> Apple deja bajar ese archivo `.p8` **una sola vez**. Si lo pierdes hay que
> anular la clave y crear otra. Guárdalo en un lugar seguro antes de seguir, y
> apunta también el **Key ID** que aparece en pantalla.

4. Necesitas además tu **Team ID**: está arriba a la derecha en esa misma
   página de Apple, o en Membership.

### 5.3 · Entregarle esa clave a Firebase

1. Firebase → Configuración del proyecto → pestaña **Cloud Messaging**.
2. En la sección de la app de iOS, **Clave de autenticación de APNs** →
   **Cargar**.
3. Sube el `.p8` y escribe el **Key ID** y el **Team ID**.

Con eso, Firebase ya puede hablar con Apple en nombre de la app.

### 5.4 · Al compilar en el Mac

El proyecto de iPhone necesita bajar sus dependencias, y eso solo corre en un
Mac. En la carpeta `ios/App`:

```bash
pod install
```

Después se abre **`App.xcworkspace`** (el `.xcworkspace`, no el `.xcodeproj`) y
se compila desde ahí.

En Xcode, en la pestaña **Signing & Capabilities**, tiene que aparecer **Push
Notifications** en la lista. Si aparece, está bien puesto. Si no aparece, se
agrega con el botón **+ Capability**.

---

## Lo que todavía no está probado

El camino de Android está compilado y revisado, pero **ninguna notificación ha
llegado a un teléfono de verdad todavía**, porque para eso hace falta el
proyecto de Firebase.

El de iPhone tampoco está compilado: hacerlo necesita un Mac.

Los dos hay que probarlos en un aparato real antes de subir la app.
