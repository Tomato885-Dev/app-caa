# Arquitectura

Este documento explica cómo está organizada la aplicación y por qué. La regla que gobierna todas
las decisiones es la del documento de requisitos (§5): *"una estructura modular que permita ir
incorporando nuevas funcionalidades de forma progresiva"*.

---

## 1. Las cuatro capas

```
┌──────────────────────────────────────────────────────────────┐
│  app/        Chasis: providers, router, layout, tema          │
├──────────────────────────────────────────────────────────────┤
│  modules/    Un directorio por apartado. Se auto-describen.   │
├──────────────────────────────────────────────────────────────┤
│  ui/  shared/   Sistema de diseño y piezas transversales      │
├──────────────────────────────────────────────────────────────┤
│  core/       Tipos, datos, sesión, moderación, registro       │
└──────────────────────────────────────────────────────────────┘
        ↑ content/ y config/ alimentan todas las capas
```

Las dependencias apuntan **hacia abajo**: un módulo puede usar `core` y `ui`, pero `core` nunca
importa de `modules`. Eso es lo que permite borrar o añadir un módulo sin romper nada.

---

## 2. El registro de módulos

Un módulo es una carpeta que exporta un objeto `AppModule` describiéndose a sí mismo:

```ts
export const eventsModule: AppModule = {
  id: 'events',
  title: 'Eventos',
  description: 'Calendario de actividades de la comunidad.',
  icon: CalendarDays,
  tone: 'brand',
  path: '/eventos',
  nav: { section: 'primary', order: 30 },
  routes: [
    { index: true, element: <EventsListPage /> },
    { path: ':id', element: <EventDetailPage /> },
  ],
  minRole: 'student',          // opcional
  moderationSources: [...],    // opcional: entra a la cola de revisión
  calendarSources: [...],      // opcional: se dibuja en el calendario mensual
};
```

`src/core/modules/registry.ts` responde preguntas derivadas de esa lista, y **seis partes de la
app se alimentan de él**:

| Consumidor | Qué obtiene |
| --- | --- |
| `app/router/AppRouter.tsx` | Las rutas, ya envueltas en su guardia de rol |
| `app/layout/BottomNav.tsx` + `MoreSheet` | Barra inferior y menú "Más" en móvil |
| `app/layout/SideNav.tsx` | Menú lateral en escritorio |
| `modules/home/HomePage.tsx` | Accesos directos de la pantalla de inicio |
| `modules/admin/ModerationQueuePage.tsx` | Fuentes de contenido moderable |
| `modules/calendar/CalendarPage.tsx` | Fuentes de contenido fechado |

Registrar un módulo nuevo lo hace aparecer en los seis lugares. No hay listas paralelas que
mantener sincronizadas.

### La barra inferior no crece

`getNavGroups()` reparte los módulos: los primeros `appConfig.bottomNavSlots` marcados como
`primary` van a la barra, y **todo el resto cae en "Más"**. Añadir el décimo módulo no rompe el
diseño móvil.

---

## 3. Acceso a datos

```
Componente  →  hook del módulo (api.ts)  →  useCollection / useDataMutation
                                                    │
                                                    ▼
                                          db: DataProvider
                                                    │
                                       localProvider  │  supabaseProvider…
```

`DataProvider` (en `core/data/repository.ts`) declara un repositorio por entidad, con la misma
forma en todas: `list`, `get`, `create`, `update`, `remove`.

La implementación incluida guarda en `localStorage` y se siembra desde `content/seed`. Migrar a un
servidor real es escribir otra implementación del mismo contrato y cambiar una línea en
`core/data/index.ts`.

Cada módulo expone sus propios hooks en su `api.ts`, así que la interfaz nunca habla directamente
con el almacenamiento y las claves de caché quedan en un solo sitio.

---

## 4. Sesión y roles

Tres roles con jerarquía (§8): `student` < `moderator` < `admin`.

- `core/auth/AuthContext.tsx` mantiene la sesión y expone `useAuth()`.
- `core/auth/guards.tsx` aporta `<RequireAuth />` y `<RequireRole minimum="…" />`, que el router
  aplica automáticamente según el `minRole` de cada módulo.
- El acceso exige un correo de los dominios declarados en `appConfig.auth.allowedEmailDomains`, y
  cada cuenta queda asociada a nombre real y curso.

Para conectar el SSO institucional basta con cambiar el cuerpo de `signIn`. La app entera depende
solo de `useAuth()`.

---

## 5. Moderación transversal

El documento (§7.1) exige que toda publicación de estudiantes se revise **antes** de ser visible.
Eso se resuelve en dos piezas, no módulo por módulo:

**a) Visibilidad** — `core/moderation/visibility.ts` aplica una regla única:

- la comunidad ve solo lo aprobado;
- cada persona ve además lo suyo, con su estado;
- moderadores y administradores ven todo.

Los módulos la aplican con `visibleTo(items, user)` o `approvedOnly(items)`.

**b) Cola de revisión** — cada módulo con contenido moderable declara una `ModerationSource`:

```ts
{
  kind: 'news',
  label: 'Noticia',
  pluralLabel: 'Noticias',
  fetchAll: () => …,   // normaliza sus datos a ModerationItem
  decide: ({ id, status, note, moderatorId }) => …,
}
```

El panel de administración lee `getModerationSources()` y no sabe nada de cada módulo. Uno
futuro con contenido de estudiantes entra a la cola declarando su fuente.

Las decisiones posibles son las tres del documento: aprobar, rechazar o solicitar cambios, con
comentario obligatorio en los dos últimos casos.

---

## 5 bis. Calendario agregado

Mismo patrón que la moderación, aplicado al tiempo en vez de a la revisión. El módulo
`modules/calendar` **no guarda datos propios**: dibuja lo que aportan los demás.

Cada módulo con contenido fechado declara una `CalendarSource`:

```ts
{
  id: 'events',
  label: 'Eventos',      // etiqueta de la leyenda
  tone: 'brand',         // color del punto en la rejilla
  icon: CalendarDays,
  fetch: () => …,        // normaliza sus datos a CalendarEntry[]
}
```

`core/calendar/useCalendarEntries.ts` reúne todas las fuentes, expande los rangos de varios días
(`daysBetween`) y devuelve las entradas indexadas por día, listas para pintar la rejilla.

La decisión de fondo: **una actividad se carga una sola vez**, en su propio módulo. Un calendario
con su propia colección habría obligado a digitar cada evento dos veces y a convivir con dos
listas que pueden terminar contradiciéndose.

Contrapartida honesta: solo aparece en el calendario lo que algún módulo publique. Si el Centro de
Alumnos quiere agendar algo que no es un evento ni una convocatoria, hoy debe publicarlo como
evento. Cuando aparezca un tipo de contenido con fecha propia, se resuelve declarando su fuente.

---

## 6. Contenido separado del código

| Archivo | Qué controla |
| --- | --- |
| `config/app.config.ts` | Identidad, dominios de correo, cursos, módulos activos, moderación |
| `content/taxonomies.ts` | Categorías de noticias, eventos, proyectos y colaboradores; prioridades de comunicados; disciplinas y categorías de las selecciones |
| `content/images.ts` | Manifiesto de imágenes y sus marcadores |
| `content/seed/*` | Contenido inicial de cada módulo |
| `styles/theme.css` | Colores, radios y sombras |

Ningún componente contiene textos de catálogo ni rutas de imagen escritas a mano.

---

## 7. Sistema de diseño

`src/ui/` es un sistema cerrado: los módulos importan desde `@/ui` y nunca escriben estilos base
propios. Los colores se consumen como tokens semánticos (`bg-surface`, `text-ink-2`, `border-line`),
que cambian solos entre tema claro y oscuro.

Principios aplicados en toda la app:

- **Móvil primero.** Áreas táctiles de 44px, barra inferior alcanzable con el pulgar, hojas
  modales que suben desde abajo, respeto de las zonas seguras del dispositivo.
- **Jerarquía clara.** Un solo título grande por pantalla, bajada de contexto, y bloques con
  encabezado propio.
- **Densidad contenida.** Tarjetas con aire, sombras suaves, bordes sutiles; el color fuerte se
  reserva para el estado y la acción principal.
- **Accesibilidad.** Foco visible unificado, etiquetas asociadas a cada control, textos alternativos
  en imágenes y marcadores, y respeto de `prefers-reduced-motion`.

---

## 8. Qué falta para producción

La app está completa a nivel de funcionalidad y experiencia. Para un despliegue real quedan tres
integraciones, todas aisladas tras una interfaz:

1. **Backend** — implementar `DataProvider` contra el servicio elegido.
2. **Identidad institucional** — conectar el SSO dentro de `signIn`.
3. **Carga de imágenes** — hoy las fotos se referencian por clave del manifiesto; con backend, esa
   misma clave puede resolverse contra un servicio de archivos sin cambiar los componentes.
