# Servidor de correo

Este es el pedacito que la app **no puede hacer sola**: enviar el correo con el
código de verificación. Un navegador no envía correos; hace falta algo que lo
haga por él, y eso es este servidor.

Mientras no lo enciendas, la app funciona igual: en vez de enviar el código, lo
**muestra en pantalla** dentro de un recuadro amarillo que dice «Modo de
prueba». Todo el resto del flujo —el código, los intentos, el vencimiento— ya
funciona de verdad.

---

## Lo que necesitas antes de empezar

- **Node.js** instalado (el mismo que usas para la app).
- Una **cuenta de Gmail** desde la que saldrán los correos. Lo natural es usar
  la cuenta institucional del Centro de Alumnos.
- Esa cuenta debe tener la **verificación en dos pasos activada**.

---

## Paso 1 — Crear la contraseña de aplicación

Gmail no deja que un programa entre con tu contraseña normal. Hay que crear una
clave especial solo para esto.

1. Entra a <https://myaccount.google.com/apppasswords> con la cuenta que va a
   enviar los correos.
2. Escribe un nombre cualquiera, por ejemplo `App CAA`.
3. Google te muestra **16 letras**. Cópialas: no las vuelve a mostrar.

> Si esa página te dice que no está disponible, es porque a la cuenta le falta
> activar la verificación en dos pasos. Actívala y vuelve a intentar.

---

## Paso 2 — Instalar y encender

Abre una terminal **en esta carpeta** (`docs/servidor-de-correo`) y ejecuta una
sola vez:

```bash
npm install
```

Después, cada vez que quieras encenderlo (reemplaza los dos valores por los
tuyos):

```bash
GMAIL_USER=centrodealumnos@verbo.cl GMAIL_APP_PASSWORD=las16letras npm start
```

En Windows, si ese comando no funciona, usa PowerShell así:

```powershell
$env:GMAIL_USER="centrodealumnos@verbo.cl"; $env:GMAIL_APP_PASSWORD="las16letras"; npm start
```

Si todo va bien verás:

```
Servidor de correo escuchando en http://localhost:3001
```

**Deja esa terminal abierta**, igual que la de la app.

---

## Paso 3 — Avisarle a la app

Abre `src/config/app.config.ts` y pon la dirección del servidor:

```ts
verification: {
  endpoint: 'http://localhost:3001/enviar-codigo',
  fromLabel: 'Centro de Alumnos',
},
```

Guarda. El recuadro amarillo del código desaparece solo y, a partir de ahí, los
códigos llegan por correo de verdad.

---

## Qué hace este servidor para no ser un problema

| Protección | Para qué |
| --- | --- |
| Solo acepta peticiones desde la dirección de tu app | Que otra página no lo use |
| Solo escribe a direcciones `@verbo.cl` | Que no sirva para mandar spam a cualquiera |
| Máximo 5 envíos por hora a un mismo correo | Que nadie inunde la bandeja de un compañero |
| No guarda ningún dato | Recibe, envía y olvida |

---

## Cuando la app salga a internet de verdad

Dos cosas cambian, y conviene tenerlas anotadas desde ya:

1. **La dirección.** `localhost` solo existe en tu computador. El servidor tiene
   que vivir en algún lugar accesible (Render, Railway, Fly.io y varios más
   tienen plan gratis suficiente para esto), y `endpoint` apunta a esa
   dirección.

2. **Dónde se genera el código.** Hoy lo genera el navegador y este servidor
   solo lo reenvía. Eso frena el caso real —un alumno intentando activar la
   cuenta de otro— pero alguien que sepa abrir las herramientas de desarrollo
   podría leerlo. En la versión definitiva el código se genera y se comprueba
   **aquí**; en `server.js` está marcado con un comentario el punto exacto donde
   va ese cambio.

Es el mismo salto que ya tienes pendiente para que todos vean el mismo contenido
y para sacar la nómina del código de la app: los tres se resuelven con el mismo
servidor.
