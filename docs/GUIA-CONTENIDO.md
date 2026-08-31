# Guía de contenido

Cómo modificar textos, imágenes, categorías y datos **sin tocar componentes**. Todo lo que
describe este documento vive en `src/config/` y `src/content/`.

---

## 1. Identidad del centro de alumnos

`src/config/app.config.ts`

```ts
organization: {
  shortName: 'Centro de Alumnos',   // barra superior y menú lateral
  fullName: 'Centro de Alumnos',    // pantalla de acceso y perfil
  institution: 'Comunidad Estudiantil',
  term: 'Periodo 2026',
},
```

En la misma configuración:

| Campo | Para qué sirve |
| --- | --- |
| `auth.allowedEmailDomains` | Dominios de correo autorizados para entrar |
| `auth.emailHint` | Texto de ayuda bajo el campo de correo |
| `auth.enableDemoAccounts` | Muestra u oculta las cuentas de demostración |
| `grades` | Lista de cursos disponibles al editar el perfil |
| `enabledModules` | Qué apartados están activos (permite lanzar por etapas) |
| `bottomNavSlots` | Cuántos accesos caben en la barra inferior antes de "Más" |
| `moderation.requireApprovalForStudentContent` | Activa o desactiva la revisión previa |
| `moderation.reportReasons` | Motivos ofrecidos al reportar contenido |

---

## 2. Imágenes

Todas se declaran en `src/content/images.ts`. Mientras una entrada tenga `src: null`, la app
dibuja un marcador con trama diagonal, la etiqueta **IMAGEN PENDIENTE**, la descripción de la foto
que corresponde y la ruta donde dejarla.

### Reemplazar una imagen

```ts
// Antes
'news.asamblea': pending(
  'Foto de la asamblea estudiantil o reunión del Centro de Alumnos',
  'public/images/noticias/asamblea.jpg',
),

// Después
'news.asamblea': {
  src: '/images/noticias/asamblea.jpg',
  alt: 'Estudiantes reunidos en la asamblea de marzo',
  description: 'Foto de la asamblea estudiantil',
  ratio: '16/9',
  suggestedPath: 'public/images/noticias/asamblea.jpg',
},
```

1. Copia el archivo en `public/images/…`, respetando la ruta de `suggestedPath`.
2. Cambia `src: null` por la ruta pública (empieza en `/images/…`, sin `public`).
3. Escribe un `alt` que describa la imagen real: es lo que leen los lectores de pantalla.

### Agregar una imagen nueva

```ts
'news.gala-invierno': pending(
  'Foto de la gala de invierno',
  'public/images/noticias/gala-invierno.jpg',
),
```

Luego referénciala desde el contenido con esa clave (`imageKey: 'news.gala-invierno'`). Al crear
noticias, eventos o convocatorias desde el panel de administración, el selector de imagen ofrece
todas las claves del manifiesto y marca cuáles siguen pendientes.

### Proporciones disponibles

`'16/9'` · `'3/2'` · `'4/3'` · `'1/1'` · `'21/9'`

Conviene mantener la que ya tiene declarada cada entrada: las tarjetas están diseñadas para ella.

### Logo de la app

El logo oficial **ya está incorporado**: `public/icons/icon.png` (512×512). Se usa en la barra
superior, el menú lateral, la pantalla de acceso, la pantalla de carga y como icono de la PWA al
instalarla en el celular.

Para actualizarlo, reemplaza ese archivo conservando el formato cuadrado. Se dibuja desde un único
componente, `src/ui/BrandLogo.tsx`, con cuatro tamaños (`sm`, `md`, `lg`, `xl`); si algún día falta
el archivo, el componente reserva el espacio en vez de sustituirlo por una marca inventada.

---

## 3. Categorías

`src/content/taxonomies.ts` concentra las categorías de todos los módulos. Los filtros de la
interfaz se generan desde estas listas: agregar una categoría la hace aparecer sola.

```ts
export const newsCategories = [
  'Comunicados',
  'Centro de Alumnos',
  'Académico',
  'Deportes',
  'Cultura',
  'Acción social',
  'Medio ambiente',   // ← nueva
] as const;
```

> Al renombrar o eliminar una categoría, revisa que ningún contenido existente siga apuntando al
> valor anterior.

El mismo archivo controla, además de las categorías:

| Lista | Qué define |
| --- | --- |
| `announcementPriorities` | Informativo / Importante / Urgente, y su color |
| `announcementAudiences` | A quién puede dirigirse un comunicado |
| `benefitCategories` | Cómo se agrupan los convenios de la campaña |
| `sportDisciplines` | Las selecciones del colegio (fútbol, básquetbol, tenis, vóleibol, atletismo) |
| `sportLevels` | Las categorías (infantil, intermedia, superior) |
| `outcomeTone` | El color de victoria, empate, derrota y participación |

Agregar una sexta selección es añadir una línea a `sportDisciplines`: el filtro de 365 y el
formulario de administración la recogen solos.

---

## 4. Contenido inicial

`src/content/seed/` contiene los datos con los que arranca la app, un archivo por módulo:
`users.ts`, `announcements.ts`, `news.ts`, `events.ts`, `signups.ts`, `community.ts`,
`marketplace.ts`, `benefits.ts` y `sports.ts`.

**Después de editar cualquiera de ellos, sube la versión** en `src/content/seed/index.ts`:

```ts
export const seedData = {
  version: '2026-08-15.2',   // ← cambiar
  // …
};
```

Ese cambio hace que la base local del navegador se vuelva a sembrar. También puedes forzarlo desde
*Perfil → Restaurar contenido de ejemplo*.

### Cuentas

`src/content/seed/users.ts` define las cuentas de demostración. En producción, este archivo se
reemplaza por la sincronización con el directorio institucional. Los correos deben pertenecer a un
dominio de `appConfig.auth.allowedEmailDomains`.

### Preguntas de una convocatoria

Cada actividad con inscripción puede pedir información propia:

```ts
questions: [
  {
    id: 'q_disponibilidad',
    label: '¿Qué sábados tienes disponibilidad?',
    type: 'select',            // 'text' · 'textarea' · 'select'
    required: true,
    options: ['Primer y tercer sábado', 'Segundo y cuarto sábado'],
  },
],
```

El formulario de inscripción se construye solo a partir de esta lista.

---

## 5. Colores y apariencia

`src/styles/theme.css`. La paleta oficial es de tres colores:

| Color | Token | Uso |
| --- | --- | --- |
| `#11673C` verde | `--color-brand-500` | Dominante: encabezados, navegación, botones principales |
| `#FFFFFF` blanco | `--sf-surface` | Superficies: tarjetas, barras, hojas modales |
| `#FFD101` amarillo | `--color-accent-500` | Acento: elementos seleccionados, indicadores, destacados |

Cambiar la escala `brand` re-marca la aplicación completa, en tema claro y oscuro:

```css
@theme {
  --color-brand-50:  #ebf5f0;
  --color-brand-500: #11673c;   /* color principal */
  --color-brand-600: #0e5632;   /* estado activo */
  /* … */
}
```

Las superficies (`--sf-canvas`, `--sf-surface`, `--sf-ink`…) están definidas dos veces: en `:root`
para el tema claro y en `[data-theme='dark']` para el oscuro. Si ajustas una, ajusta su par.

### Regla de contraste que no se debe romper

- Texto **blanco sobre el verde** `#11673C` → 6.93:1, cumple WCAG AA. ✅
- Texto **blanco sobre el amarillo** `#FFD101` → 1.46:1, ilegible. ❌

Por eso el amarillo lleva **siempre** texto oscuro. Para un fondo amarillo pleno usa la constante
`accentSolid` de `@/ui`, que aplica el token `--color-on-accent` (fijo en ambos temas). Para
amarillo suave, `toneSoft.accent` ya usa `accent-700` como color de texto.

### Por qué la paleta es corta

`success` comparte la escala del verde, `warning` la del amarillo, y tanto `danger` como `info` son
neutros. Así la interfaz se sostiene con verde, amarillo, blanco y grises, sin introducir ningún
cuarto color.

`danger` merece una nota: rechazar o eliminar no puede compartir el verde de aprobar, y la paleta no
contempla un rojo. Se resuelve con un carboncillo de alto contraste (`#263029`), inconfundible
junto al verde y al amarillo.

---

## 6. Textos de la interfaz

Los títulos y descripciones de cada pantalla están en su propio componente, junto al contenido que
describen. Los más visibles:

| Texto | Archivo |
| --- | --- |
| Título y bajada de cada sección | `PageHeader` de la página correspondiente |
| Nombre y descripción en menús | Campos `title` y `description` del `AppModule` |
| Aviso del marketplace | `modules/marketplace/MarketplaceListPage.tsx` |
| Texto de la pantalla de acceso | `app/pages/LoginPage.tsx` |
| Bloque "Acerca de" | `modules/profile/ProfilePage.tsx` |

---

## 7. Qué se edita desde la propia app

No todo requiere tocar archivos. Con sesión de administrador, desde **Administración → Contenidos**
se publican y editan comunicados, noticias, eventos, convocatorias de inscripción, beneficios y
resultados de las selecciones, incluida la elección de su imagen entre las claves del manifiesto.

Desde **Administración → Cuentas y permisos** se asignan roles, se activan o desactivan cuentas y
se completa el teléfono que aparece en la base de contactos.

Dos apartados no se cargan a mano porque leen lo que ya existe:

- **Calendario** — reúne los eventos y los cierres de inscripción publicados. Para que algo
  aparezca en el mes, se publica en su módulo.
- **Contactos** — es una vista sobre las cuentas. Cada persona decide si figura, desde
  *Mi perfil → Editar perfil*.
