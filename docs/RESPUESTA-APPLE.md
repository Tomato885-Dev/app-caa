# La respuesta a Apple

Apple no rechazó la aplicación por un error: pidió información. Es la revisión
que le hacen a toda cuenta de desarrollador nueva, antes de dejarla publicar por
primera vez. No hay que tocar ni una línea de código.

Los textos están escritos en inglés, listos para copiar, y van a **dos lugares
distintos con dos versiones distintas**:

| Dónde | Qué se pega | Por qué |
|---|---|---|
| **Resolution Center** | La versión larga (secciones 2 a 7) | Es la respuesta al mensaje. No tiene límite corto. |
| **App Store Connect → App Review Information → Notes** | La versión corta (sección 8) | **El campo Notes acepta 4.000 caracteres y la versión larga tiene 6.566.** No cabe. |

Apple pidió las dos cosas: responder *y* dejarlo guardado en las notas, para no
tener que volver a explicarlo en cada versión futura.

Lo único que no está aquí es el video: ese tiene que grabarlo una persona con
el teléfono en la mano.

---

## 0 · Antes de grabar nada

Cuatro comprobaciones de un minuto cada una. Si alguna falla, el video hay que
rehacerlo.

**1. Que la cuenta de revisión entre.** Ábrela en TestFlight en tu iPhone y
entra con ella. Si la contraseña no funciona, Apple tampoco va a poder entrar y
te rechazan sin mirar nada más.

**1b. Deja las dos contraseñas copiadas en la app Notas del iPhone.** En el
video se pegan, no se escriben: el teclado muestra una burbuja con cada letra y
la grabación la capta. Está explicado más abajo.

**2. Que el iPhone esté al día.** Ajustes → General → Actualización de
software. Apple pide el video "running the latest operating system".

**3. Que las credenciales estén en el formulario, no solo en las notas.** En
App Store Connect → App Review Information, la casilla **"Sign-in required"**
tiene que estar marcada y con el correo y la contraseña de la cuenta de
revisión escritos ahí. Es un campo aparte del de Notes.

**4. Que tu cuenta personal vuelva a entrar después de borrarte.** En Supabase
→ SQL Editor, con tu correo:

```sql
select correo, rol_inicial, habilitado from public.nomina where correo = 'TU-CORREO@verbo.cl';
```

Tiene que devolver una fila con `habilitado = true`. El `rol_inicial` es el rol
con el que vas a volver a entrar cuando te registres de nuevo en el video.

---

## 1 · El video

Apple lo pide grabado **en un iPhone de verdad** (no en el simulador) y tiene
que **empezar cuando se abre la aplicación**.

Se graba con la propia función del iPhone: Ajustes → Centro de control →
agregar "Grabación de pantalla". Después se desliza desde arriba a la derecha y
se toca el círculo.

### Se usan dos cuentas, y el orden importa

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
| 2 | Pantalla de acceso: escribir el correo y la contraseña de revisión, entrar |
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

El paso 3 es el que Apple llama *"the typical user flow"*, y por eso va con la
cuenta de estudiante: el revisor tiene que ver lo mismo que verá cuando entre
él. Los pasos 8 y 9 son los que más miran: si una app deja crear cuenta, tiene
que dejar borrarla desde adentro, y quieren verlo pasar.

### El video es privado, pero hay que mantenerlo así

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
grabación la capta. Antes de grabar, deja las dos contraseñas copiadas en la
app Notas del teléfono; en el video, toca el campo, mantén apretado y elige
"Pegar". Cero teclas, cero burbujas.

Si prefieres una red más: cámbiale la contraseña a tu cuenta personal por una
temporal antes de grabar, y vuelve a cambiarla desde Mi perfil cuando termines.
Así, aunque el video se filtrara, la contraseña que se ve ya no sirve. Con la
cuenta de revisión esto no se puede hacer: su contraseña tiene que seguir
siendo la misma que está escrita en el formulario de App Store Connect.

---

## 2 · Propósito y a quién va dirigida

Este párrafo va primero en la respuesta, explicando el video:

```
Attached is a screen recording captured on a physical iPhone running the
latest version of iOS. It begins with launching the app and covers the typical
user flow, push notifications, account deletion and account registration.

The recording uses two accounts. The tour of the app is done with the demo
account provided for App Review, so that you see exactly what you will see
when you sign in. Account deletion and registration are then demonstrated with
a second, personal account, because registration requires a confirmation code
sent by e-mail and the demo account has no mailbox of its own. The demo
account is left untouched and working.
```

Y después:

```
App CAA is the official app of the Student Council (Centro de Alumnos) of
Colegio Del Verbo Divino, a secondary school in Santiago, Chile.

WHO IT IS FOR
The school's own community: around 700 high-school students aged 13 to 18,
plus the teachers and staff of the school. It is not aimed at the general
public.

THE PROBLEM IT SOLVES
Until now, everything the Student Council announced travelled through paper
posters in the hallways, informal WhatsApp groups and word of mouth. News
arrived late, arrived incomplete, or never arrived at all, and there was no
reliable way to tell an official announcement from a rumour. Students missed
sign-up deadlines for events they wanted to attend.

THE VALUE IT PROVIDES
One single official channel. The app gathers the Student Council's
announcements, news, events and sign-ups, the school-year calendar, the
results of the inter-grade competitions, the progress of the Council's
projects, the discounts the Council has negotiated with local businesses, and
a contact directory of the school community.

The app is free. There is no advertising, no in-app purchase, no subscription,
no tracking and no data sold or shared with anyone.
```

---

## 3 · Cómo entrar y qué probar

Donde dice `CORREO` y `CONTRASENA` van los de la cuenta de revisión. **La
contraseña se escribe directamente en App Store Connect; no queda guardada en
ningún archivo de este proyecto.**

```
HOW ACCESS WORKS
The app is not open to the public. An account can only be created by a person
whose institutional e-mail address (@verbo.cl) is on the school's official
roster. There is no open sign-up: any other address is rejected at
registration.

DEMO ACCOUNT FOR APP REVIEW
The account below is a regular student account, the same credentials entered
in the App Review Information section. It is hidden from the app's contact
directory so it does not appear among the real students.

  E-mail:   CORREO
  Password: CONTRASENA

HOW TO SIGN IN
1. Launch the app.
2. On the sign-in screen, enter the e-mail and password above.
3. Tap "Entrar".

A confirmation code by e-mail is required only when CREATING an account, never
when signing in, so the demo account needs no mailbox access.

MAIN FEATURES, AND WHERE THEY ARE
Everything is reachable from the navigation inside the app.

- Inicio (Home): a summary of what is happening right now.
- Comunicados (Announcements): the Student Council's official notices.
- Noticias (News): what has already happened, with photographs.
- Eventos (Events): what is coming, with date, place and sign-up.
- Calendario (Calendar): the whole school year, month by month.
- 365: the results of the competitions between grades.
- Proyectos (Projects): what the Student Council is working on and how each
  item is progressing.
- Colaboradores (Partners): the discounts agreed with local businesses. Open
  any of them to see its redemption code.
- Contactos (Directory): shows the name, school e-mail address and, if the
  person chose to add one, the phone number of the members of the school
  community, so that a student can write to someone without having to ask
  around for their address. It is visible only to signed-in members of the
  same school, and any person can hide themselves from it completely from
  their own profile.
- Mi perfil (My profile): edit your own details, turn push notifications on
  and off, change your password, and delete your account.

PUSH NOTIFICATIONS
Mi perfil, section "Avisos". The app asks for the system permission there.
Notifications are only sent when the Student Council publishes something;
there are no marketing or promotional notifications.

DELETING THE ACCOUNT
Mi perfil, "Eliminar mi cuenta". It is done from inside the app, with no need
to write to anybody. The account and its personal data are erased.

THE APP HAS NO USER-GENERATED CONTENT
Students cannot publish anything. Only the Student Council's elected board and
the teams appointed by the school can publish, and only into the app's own
sections. There are no comments, no private messaging, no photo uploads and no
public profiles.

The only text a student can write anywhere in the app is their own phone
number, which is optional; their name and class come from the school's
official roster and cannot be edited. There is therefore no user-to-user
content that could be reported or blocked, and no mechanism for it is needed.

THERE IS NO PAID CONTENT
Every feature of the app is free and available to every account. There is no
in-app purchase, no subscription and no paywalled section.
```

---

## 4 · Los servicios externos

```
The app relies on two external services, and only two.

1. SUPABASE (https://supabase.com)
   Database, authentication, file storage and serverless functions. This is
   where the app's content and the user accounts live. Supabase is hosted on
   Amazon Web Services. Passwords are stored hashed by Supabase Auth; the
   confirmation e-mails sent at registration go out through Supabase's mail
   service.

2. FIREBASE CLOUD MESSAGING (Google) together with APPLE PUSH NOTIFICATION
   SERVICE
   Used only to deliver push notifications. Firebase receives the device token
   and the text of the notice, nothing else.

The app does NOT use:
   - any analytics or crash-reporting service
   - any advertising network or advertising identifier
   - any payment processor (there is nothing to pay for)
   - any artificial intelligence service
   - any data provider or third-party content feed

No personal data is sold, shared or transferred to any third party for any
purpose.
```

---

## 5 · Diferencias por región

```
There are none. The app behaves exactly the same everywhere: the same
features, the same content, the same screens. There is no region-based
gating, no geolocation, and no content that changes by country.

The app is written in Spanish only, and in practice it is useful only to the
members of one school in Santiago, Chile, but this is a consequence of who is
on the roster, not of any regional restriction in the software.
```

---

## 6 · Industria regulada y material de terceros

```
The app does not operate in a regulated industry. It offers no financial,
medical, health, gambling, dating or age-restricted services of any kind.

It contains no protected third-party material. Every text, photograph, logo
and name shown in the app belongs to Colegio Del Verbo Divino and to its
Student Council, which is the body that commissioned and operates this app.
The logos of the partner businesses shown in the "Colaboradores" section are
displayed with the agreement of each business, as part of the discount
arrangement made with the Student Council.
```

---

## 7 · Por qué va en la App Store pública y no en distribución privada

Apple no lo preguntó, pero nombró la pauta 3.2 en la lista de problemas
frecuentes, y es la que más se le parece a esta app. Conviene adelantarse: si
lo van a preguntar, mejor que ya esté respondido.

```
A note on Guideline 3.2, since the app's audience is a defined community:

App CAA is not a business or employee app. Its users are secondary-school
students who install it on their own personal iPhones, which the school
neither owns nor manages. There is no MDM, no managed Apple Accounts and no
device enrolment, so Apple Business Manager custom distribution would leave
the intended users unable to install the app at all.

The app is free, has no commercial purpose and does not serve a company's
internal operations. It is the equivalent of a school or university community
app, published on the App Store so that each student can install it on their
own device in the ordinary way.
```

---

## 8 · La versión corta, para el campo Notes

Lo de arriba no cabe en Notes: ese campo acepta 4.000 caracteres. Esta versión
dice lo mismo en menos, y es la que hay que pegar ahí.

```
APP CAA - NOTES FOR APP REVIEW

WHAT THE APP IS
App CAA is the official app of the Student Council (Centro de Alumnos) of
Colegio Del Verbo Divino, a secondary school in Santiago, Chile. Its audience
is the school's own community: around 700 students aged 13 to 18, plus the
teachers and staff. It replaces paper posters in the hallways and informal
WhatsApp groups with one official channel for announcements, news, events,
the school calendar, inter-grade competition results, Student Council
projects, the discounts negotiated with local businesses, and a contact
directory. The app is free: no advertising, no purchases, no subscriptions,
no tracking.

ACCESS IS CLOSED
An account can only be created by someone whose institutional e-mail address
(@verbo.cl) is on the school's official roster. There is no open sign-up. The
demo account provided in the sign-in fields above is a regular student
account, hidden from the contact directory. A code sent by e-mail is required
only when CREATING an account, never when signing in, so the demo account
needs no mailbox access.

WHERE THINGS ARE
Inicio (home), Comunicados (announcements), Noticias (news), Eventos (events
and sign-ups), Calendario, 365 (inter-grade competition results), Proyectos,
Colaboradores (partner discounts, each with its redemption code), Contactos
(directory), Mi perfil.
- Push notifications: Mi perfil, section "Avisos". Sent only when the Student
  Council publishes something; never marketing.
- Account deletion: Mi perfil, "Eliminar mi cuenta", done inside the app.

NO USER-GENERATED CONTENT
Students cannot publish anything. Only the Student Council's elected board and
the teams appointed by the school can publish, and only into the app's own
sections. There are no comments, no private messaging, no photo uploads and no
public profiles. The only text a student can write anywhere in the app is
their own optional phone number; their name and class come from the official
roster and cannot be edited, and anyone can hide themselves from the directory
entirely. There is therefore no user-to-user content to report or block.

NO PAID CONTENT
Every feature is free for every account. No in-app purchase, no subscription,
no paywall.

EXTERNAL SERVICES, AND ONLY TWO
1. Supabase - database, authentication, file storage, serverless functions,
   and the confirmation e-mails sent at registration. Hosted on AWS.
2. Firebase Cloud Messaging with APNs - push notification delivery only.
No analytics, no crash reporting, no advertising network or identifier, no
payment processor, no AI service, no third-party data provider. No personal
data is sold, shared or transferred to anyone.

REGIONS
No regional differences: the same features and the same content everywhere,
no geolocation, no region gating. Spanish only.

REGULATION AND THIRD-PARTY MATERIAL
Not a regulated industry: no financial, medical, health, gambling or dating
services. All text, photographs and logos belong to the school and its Student
Council. Partner logos are shown with each business's agreement.

GUIDELINE 3.2
This is not a business or employee app. Its users are students who install it
on their own personal iPhones, which the school neither owns nor manages.
There is no MDM and no managed Apple Accounts, so custom distribution through
Apple Business Manager would leave the intended users unable to install it. It
is a school community app, free and with no commercial purpose.
```

---

## Y después

Cuando la respuesta esté enviada, Apple retoma la revisión sin que haya que
volver a subir nada: la compilación 12 sigue ahí. Lo mismo si piden algo más
por el Resolution Center.

Solo si pidieran un cambio en la aplicación habría que compilar de nuevo, y
eso se hace lanzando otra vez el flujo `ios.yml` en GitHub.
