# La respuesta a Apple

Apple no rechazó la aplicación por un error: pidió información. Es la revisión
que le hacen a toda cuenta de desarrollador nueva, antes de dejarla publicar por
primera vez. No hay que tocar ni una línea de código.

Este archivo tiene los textos ya escritos, en inglés, listos para copiar. Van a
dos lugares, **los mismos textos en los dos**:

1. **Resolution Center** — la respuesta al mensaje de Apple.
2. **App Store Connect → App Review Information → Notes** — para que queden
   guardados y no haya que volver a explicarlo en cada versión futura.

Lo único que no está aquí es el video: ese tiene que grabarlo una persona con
el teléfono en la mano.

---

## 1 · El video

Apple lo pide grabado **en un iPhone de verdad** (no en el simulador), con el
sistema al día, y tiene que **empezar cuando se abre la aplicación**.

Se graba con la propia función del iPhone: Ajustes → Centro de control →
agregar "Grabación de pantalla". Después se desliza desde arriba a la derecha y
se toca el círculo.

**Antes de grabar**, en Supabase → SQL Editor, comprobar que tu correo vuelve a
entrar con tu mismo rol después de borrarte:

```sql
select correo, rol_inicial, habilitado from public.nomina where correo = 'TU-CORREO@verbo.cl';
```

Tiene que decir `habilitado = true`. El `rol_inicial` es el rol con el que vas a
volver a entrar.

### Qué mostrar, en este orden

| # | Qué se hace | Por qué lo pide Apple |
|---|---|---|
| 1 | Abrir la app desde la pantalla de inicio del iPhone, cerrada del todo | "The recording must begin with launching the app" |
| 2 | Pantalla de acceso. Escribir correo y contraseña. Entrar | Flujo de inicio de sesión |
| 3 | Inicio, Comunicados (abrir uno), Noticias, Eventos, Calendario, 365, Proyectos, Colaboradores (abrir uno y que se vea el código de canje), Contactos | "show the typical user flow" |
| 4 | Mi perfil → activar las notificaciones → que se vea el permiso del sistema | Función principal |
| 5 | Mi perfil → Eliminar mi cuenta → confirmar → la app vuelve al acceso | "Account deletion is required" |
| 6 | Crear cuenta → correo @verbo.cl → llega el código → escribirlo → entrar | Flujo de registro |

Con eso queda todo en una sola toma y terminas con tu cuenta igual que antes.

**Que no falte el paso 5.** Es el que Apple revisa con lupa: si una app deja
crear cuenta, tiene que dejar borrarla desde adentro, y quieren verlo.

Si el video pesa mucho para adjuntarlo, se sube a Google Drive o a YouTube como
"no listado" y se pega el enlace en la respuesta.

---

## 2 · Propósito y a quién va dirigida

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

Donde dice `CORREO` y `CONTRASEÑA` van los de la cuenta de revisión. **La
contraseña se escribe directamente en App Store Connect, no queda guardada en
ningún archivo de este proyecto.**

```
HOW ACCESS WORKS
The app is not open to the public. An account can only be created by a person
whose institutional e-mail address (@verbo.cl) is on the school's official
roster. There is no open sign-up: any other address is rejected at
registration.

DEMO ACCOUNT FOR APP REVIEW
We have created a regular student account for the review. It is hidden from
the app's contact directory so it does not appear among the real students.

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
- Contactos (Directory): the school community, so a student can write to
  someone without having to ask around for their e-mail. Any person can hide
  themselves from this directory.
- Mi perfil (My profile): edit your own details, turn push notifications on
  and off, and delete your account.

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
public profiles. The only thing a person can change is their own profile
details. For that reason the app has no reporting or blocking mechanism: there
is no user-to-user content to report or block.

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

## Y después

Cuando la respuesta esté enviada, Apple retoma la revisión sin que haya que
volver a subir nada: la compilación 12 sigue ahí. Lo mismo si piden algo más
por el Resolution Center.

Solo si pidieran un cambio en la aplicación habría que compilar de nuevo, y
eso se hace lanzando otra vez el flujo `ios.yml` en GitHub.
