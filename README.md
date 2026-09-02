# App CAA · Plataforma para Centros de Alumnos

Aplicación para centros de estudiantes: centraliza comunicados, noticias, un calendario mensual,
eventos, inscripciones, resultados de las selecciones, beneficios con código QR, organizaciones de
los proyectos del colegio, los colaboradores de la campaña y una base de contactos,
con acceso por correo
institucional, roles diferenciados y moderación previa de todo el contenido de estudiantes.

Está construida como **PWA mobile-first**: un solo código para Android, iOS y escritorio,
instalable desde el navegador y envolvible en una app nativa con Capacitor sin reescribir nada.

---

## Puesta en marcha

```bash
npm install
```

```bash
npm run dev
```

Abre `http://localhost:5173`. El servidor también queda disponible en la red local, así que puedes
abrirlo desde el celular con la IP que imprime Vite (ideal para probar la experiencia móvil real).

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run preview` | Sirve la compilación de producción |
| `npm run typecheck` | Verificación de tipos sin generar archivos |

### Cuentas de demostración

La pantalla de acceso ofrece tres perfiles para recorrer la app:

| Perfil | Correo | Qué puede hacer |
| --- | --- | --- |
| Administrador | `centrodealumnos@verbo.cl` | Todo: contenidos, cuentas, moderación |
| Moderador | `moderacion@verbo.cl` | Cola de revisión y reportes |
| Estudiante | `camila.rojas@verbo.cl` | Participar, publicar y reportar |

Se desactivan poniendo `auth.enableDemoAccounts: false` en `src/config/app.config.ts`.

---

## Estructura del proyecto

```
src/
├─ config/            Configuración del centro de alumnos (nombre, dominios, cursos, módulos)
├─ content/           Todo el texto, las taxonomías, el manifiesto de imágenes y el contenido inicial
│  ├─ images.ts       Manifiesto de imágenes → aquí se reemplazan los marcadores
│  ├─ taxonomies.ts   Categorías de cada módulo
│  └─ seed/           Contenido de ejemplo por módulo
├─ core/              Núcleo independiente de la interfaz
│  ├─ auth/           Sesión, roles y guardias de ruta
│  ├─ data/           Contrato de datos + proveedor local intercambiable
│  ├─ moderation/     Reglas de visibilidad y cola agregada
│  ├─ modules/        Contrato de módulo y registro
│  └─ utils/          Fechas y texto
├─ ui/                Sistema de diseño (botones, tarjetas, formularios, hojas modales…)
├─ shared/            Piezas transversales usadas por varios módulos
├─ modules/           Un directorio por apartado de la app
│  ├─ home/  announcements/  news/  calendar/  events/  signups/
│  ├─ sports/  benefits/  projects/  directory/
│  └─ profile/  admin/
├─ app/               Chasis: providers, router, layout, tema, páginas públicas
└─ styles/theme.css   Tokens de diseño (colores, radios, sombras)
```

**¿No programas?** Empieza por [`MANUAL.md`](MANUAL.md): explica cómo publicar
noticias y poner imágenes sin tocar código.

Documentación técnica complementaria en [`docs/`](docs/):

- [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) — cómo encajan las piezas y por qué.
- [`docs/CREAR-MODULO.md`](docs/CREAR-MODULO.md) — agregar un apartado nuevo, paso a paso.
- [`docs/GUIA-CONTENIDO.md`](docs/GUIA-CONTENIDO.md) — editar textos, imágenes y categorías.

---

## Los tres puntos de personalización

Adaptar la app a cualquier centro de estudiantes se hace desde tres archivos, sin tocar componentes:

1. **`src/config/app.config.ts`** — nombre, institución, dominios de correo autorizados, cursos,
   módulos activos y reglas de moderación.
2. **`src/content/images.ts`** — manifiesto de imágenes. Mientras una entrada tenga `src: null`, la
   app dibuja un marcador visible con la descripción de la foto que falta y la ruta donde dejarla.
3. **`src/styles/theme.css`** — paleta, radios y sombras. Cambiar la escala `brand` re-marca la app
   completa, en tema claro y oscuro.

---

## Imágenes: todos los marcadores están señalizados

No hay ninguna imagen inventada. Cada lugar que debe llevar una foto muestra un recuadro con trama
diagonal, la etiqueta **IMAGEN PENDIENTE**, la descripción de qué debe ir ahí y la ruta sugerida.

Para reemplazar una:

1. Copia el archivo en `public/images/…` (usa la ruta que indica el marcador).
2. En `src/content/images.ts`, cambia `src: null` por `src: '/images/…'`.
3. Ajusta el `alt` para describir la imagen real.

El logo oficial **ya está incorporado** y se dibuja desde un único componente, `src/ui/BrandLogo.tsx`.
Son dos archivos: `public/icons/logo.png` (horizontal, el que se ve en la barra superior, el menú
lateral, el acceso y la carga) y `public/icons/icon.png` (cuadrado, el icono al instalar la app).

---

## Decisiones técnicas

| Tema | Decisión | Por qué |
| --- | --- | --- |
| Plataforma | React 18 + TypeScript + Vite, como PWA | Un código para todos los dispositivos; migrable a nativo con Capacitor |
| Estilos | Tailwind CSS v4 con tokens en CSS | Re-marcar la app es cambiar variables, no clases repartidas por el código |
| Navegación | Registro de módulos | Un módulo nuevo aparece solo en router, menús, inicio y moderación |
| Datos | Patrón repositorio (`DataProvider`) | Cambiar de almacenamiento local a un backend real no toca la interfaz |
| Estado servidor | TanStack Query | Caché, estados de carga e invalidación resueltos de forma estándar |
| Moderación | Estado transversal + fuentes declaradas por módulo | La revisión previa se aplica igual en todos los apartados |
| Calendario | Vista agregada, sin datos propios | Una actividad se publica una vez y aparece sola en el mes |
| Códigos QR | `qrcode-generator` dibujado como SVG | Nítido a cualquier tamaño y sin depender de un servicio externo |
| Base de contactos | Vista sobre las cuentas existentes | Un solo lugar con datos personales, no dos listas que se desincronizan |
| Iconos | lucide-react | Set coherente y ligero, sin recursos externos |

### Sobre la persistencia actual

El proveedor de datos incluido (`src/core/data/localProvider.ts`) guarda en el `localStorage` del
navegador. Es suficiente para desarrollar, demostrar y validar la app completa, pero **los datos no
se comparten entre dispositivos**.

Cuando el proyecto cuente con servidor, se crea un `supabaseProvider.ts` (o el backend que se
elija) que implemente la interfaz `DataProvider` y se cambia **una línea** en
`src/core/data/index.ts`. Ningún componente necesita modificarse.

Lo mismo aplica al acceso: la verificación real de identidad institucional se conecta dentro de
`signIn` en `src/core/auth/AuthContext.tsx`.

---

## Cobertura del documento de requisitos

| Sección | Dónde está implementada |
| --- | --- |
| §6.1 Inicio | `modules/home` — destacados, próximos eventos, inscripciones abiertas y accesos directos |
| §6.2 Noticias | `modules/news` — publicación exclusiva de administradores |
| §6.3 Eventos | `modules/events` — calendario con fecha, horario, ubicación, requisitos y contacto |
| §6.4 Inscripciones | `modules/signups` — cupos, lista de espera y formulario configurable por convocatoria |
| Proyectos | `modules/projects` — iniciativas del colegio, vigentes e históricas |
| §6.8 Perfil | `modules/profile` — datos, inscripciones y publicaciones propias con su estado |
| §7 Seguridad y moderación | `core/auth`, `core/moderation`, `shared/ReportSheet` |
| §8 Administración y gobernanza | `modules/admin` — cola de revisión, reportes, contenidos y cuentas |

### Apartados añadidos sobre el documento base

| Apartado | Dónde está | Cómo se alimenta |
| --- | --- | --- |
| Comunicados | `modules/announcements` | Administración → Contenidos → Comunicados |
| Calendario mensual | `modules/calendar` | Automático: reúne las `calendarSources` de los demás módulos |
| 365 · Selecciones | `modules/sports` | Administración → Contenidos → 365 |
| Beneficios con QR | `modules/benefits` | Administración → Contenidos → Beneficios |
| Base de contactos | `modules/directory` | Vista sobre `users`; el teléfono se edita en Cuentas o en el perfil |

El calendario introduce un segundo contrato transversal, hermano de la moderación:
un módulo con contenido fechado declara una `CalendarSource` y aparece en el mes
sin tocar el módulo de calendario. Ver [`docs/CREAR-MODULO.md`](docs/CREAR-MODULO.md).
