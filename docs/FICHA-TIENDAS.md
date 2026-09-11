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
• Colaboradores — Los convenios y descuentos vigentes, con sus requisitos.
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
```

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

## Antes de enviar: una pregunta que hay que responder bien

Las dos tiendas preguntan a qué edades va dirigida la aplicación, y **esa
respuesta cambia las reglas que se aplican**.

Si entre los 694 de la nómina hay estudiantes **menores de 13 años**, Google
aplica su Política de Familias y Apple su categoría de apps para niños, que
traen exigencias adicionales.

Si la nómina es solo de enseñanza media, la respuesta es 13 o más y no hay
nada extra que hacer.

Hay que responderlo según la nómina real, no según lo que sea más cómodo:
declarar de menos aquí es de las cosas por las que una app se retira después
de publicada.
