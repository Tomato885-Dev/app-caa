# Agregar un apartado nuevo

Ejemplo completo: un módulo **Votaciones** para consultas y elecciones estudiantiles.

Al terminar, el apartado aparecerá solo en el router, en el menú lateral, en el menú "Más" de
móvil y en los accesos directos de Inicio.

---

## 1. Crear la carpeta

```
src/modules/votaciones/
├─ index.tsx            El descriptor del módulo
├─ api.ts               Hooks de datos
├─ VotacionesListPage.tsx
└─ components/
```

## 2. Definir la entidad

En `src/core/types.ts`:

```ts
export interface Poll extends BaseEntity, Moderatable {
  question: string;
  options: string[];
  closesAt: string;
  author: AuthorRef;
}
```

`Moderatable` solo es necesario si el contenido lo crean estudiantes y debe pasar por revisión.

## 3. Registrar la colección

En `src/core/data/repository.ts`:

```ts
export interface DataProvider {
  // …
  polls: Repository<Poll>;
}

export const COLLECTIONS = [
  // …
  'polls',
] as const;
```

Y en `src/core/data/localProvider.ts`:

```ts
export const localProvider: DataProvider = {
  // …
  polls: new LocalRepository('polls', 'pol'),
};
```

Añade también `polls: []` (o contenido de ejemplo) en `src/content/seed/index.ts` y **sube el
número de `version`** para que la base local se vuelva a sembrar.

## 4. Escribir los hooks del módulo

`src/modules/votaciones/api.ts`:

```ts
import { db } from '@/core/data';
import { useCollection, useDataMutation, useEntity } from '@/core/hooks/useData';
import type { ID, Poll } from '@/core/types';

export function usePollList() {
  return useCollection('polls', db.polls);
}

export function usePoll(id: ID | undefined) {
  return useEntity('polls', db.polls, id);
}

export function useCreatePoll() {
  return useDataMutation((input: CreateInput<Poll>) => db.polls.create(input), ['polls']);
}
```

## 5. Construir las páginas

Usa siempre el sistema de diseño, nunca estilos base propios:

```tsx
import { CardListSkeleton, EmptyState, Page, PageHeader } from '@/ui';

export function VotacionesListPage() {
  const { data, isLoading } = usePollList();

  return (
    <Page>
      <PageHeader title="Votaciones" description="Consultas abiertas a la comunidad." />
      {isLoading ? <CardListSkeleton /> : /* … */ null}
    </Page>
  );
}
```

Si el módulo muestra imágenes, decláralas primero en `src/content/images.ts` y úsalas con
`<AppImage imageKey="poll.portada" />`. Nunca escribas rutas de imagen directamente.

## 6. Exportar el descriptor

`src/modules/votaciones/index.tsx`:

```tsx
import { Vote } from 'lucide-react';
import type { AppModule } from '@/core/modules/types';
import { VotacionesListPage } from './VotacionesListPage';

export const votacionesModule: AppModule = {
  id: 'polls',
  title: 'Votaciones',
  description: 'Consultas y elecciones estudiantiles.',
  icon: Vote,
  tone: 'info',
  path: '/votaciones',
  nav: { section: 'secondary', order: 80 },
  routes: [{ index: true, element: <VotacionesListPage /> }],
};
```

> El archivo debe ser `.tsx`, no `.ts`: contiene JSX.

**Campos de `nav`:**

| Valor de `section` | Efecto |
| --- | --- |
| `primary` | Candidato a la barra inferior en móvil (según `bottomNavSlots`) |
| `secondary` | Aparece en "Más" y en el menú lateral |
| `hidden` | Accesible por URL, sin entrada de navegación |

`order` ordena de menor a mayor. Los módulos existentes van de 10 en 10, así que hay espacio para
intercalar.

## 7. Registrarlo

En `src/modules/index.ts`:

```ts
import { votacionesModule } from './votaciones';

export const appModules: AppModule[] = [
  // …
  votacionesModule,
];
```

Y en `src/config/app.config.ts`:

```ts
enabledModules: [
  // …
  'polls',
],
```

Eso es todo. El módulo ya es navegable.

---

## Opcional · Restringir por rol

```ts
minRole: 'moderator',
```

El router aplica la guardia automáticamente. Para restringir solo algunas rutas dentro del módulo,
envuélvelas como hace `modules/admin/index.tsx`:

```tsx
routes: [
  { index: true, element: <VotacionesListPage /> },
  {
    element: <RequireRole minimum="admin" />,
    children: [{ path: 'gestionar', element: <GestionPage /> }],
  },
],
```

---

## Opcional · Entrar a la cola de moderación

Si los estudiantes pueden publicar en el módulo, declara una fuente de moderación:

```ts
const pollModeration: ModerationSource = {
  kind: 'poll',                       // añadir a ContentKind en core/types.ts
  label: 'Votación',
  pluralLabel: 'Votaciones',
  fetchAll: async () =>
    (await db.polls.list()).map((poll) => ({
      id: poll.id,
      kind: 'poll' as const,
      title: poll.question,
      excerpt: poll.options.join(' · '),
      author: poll.author,
      createdAt: poll.createdAt,
      status: poll.status,
      href: `/votaciones/${poll.id}`,
    })),
  decide: async ({ id, status, note, moderatorId }) => {
    await db.polls.update(id, {
      status,
      moderatedBy: moderatorId,
      moderatedAt: new Date().toISOString(),
      ...(note?.trim() ? { moderationNote: note.trim() } : {}),
    });
  },
};

export const votacionesModule: AppModule = {
  // …
  moderationSources: [pollModeration],
};
```

Con eso, el contenido del módulo aparece en la cola del panel de administración, con sus filtros y
sus tres decisiones, sin tocar el módulo `admin`.

Recuerda además aplicar la visibilidad en las listas del módulo:

```ts
import { visibleTo } from '@/core/moderation/visibility';

const polls = visibleTo(data ?? [], user);
```

Y usar `initialStatusFor(user)` al crear contenido, para que nazca en revisión.

---

## Opcional · Aparecer en el calendario mensual

Si el módulo tiene contenido con fecha, declara una `CalendarSource` y sus actividades se dibujan
solas en `/calendario`. Es el mismo patrón que la moderación: el módulo de calendario no se toca.

```tsx
import { Vote } from 'lucide-react';
import type { CalendarSource } from '@/core/modules/types';

const pollsCalendar: CalendarSource = {
  id: 'polls',                        // debe coincidir con `sourceId` de las entradas
  label: 'Votaciones',                // etiqueta de la leyenda de colores
  tone: 'info',
  icon: Vote,
  fetch: async () =>
    (await db.polls.list())
      .filter((poll) => poll.status === 'approved')
      .map((poll) => ({
        id: poll.id,
        date: poll.closesAt,
        title: `Cierra la votación: ${poll.question}`,
        detail: 'Votación estudiantil',
        allDay: true,                 // sin hora concreta
        href: `/votaciones/${poll.id}`,
        sourceId: 'polls',
      })),
};

export const votacionesModule: AppModule = {
  // …
  calendarSources: [pollsCalendar],
};
```

**Campos de `CalendarEntry`:**

| Campo | Para qué sirve |
| --- | --- |
| `date` | Fecha de inicio, ISO 8601. Obligatoria |
| `endDate` | Fecha de término. La actividad se marca en todos los días del rango |
| `detail` | Línea de apoyo bajo el título: lugar u observación breve |
| `allDay` | Muestra "Todo el día" en vez de una hora |
| `href` | Hace la entrada pulsable, hacia el detalle en su módulo |
| `sourceId` | Debe coincidir con el `id` de la fuente; determina el color del punto |

Una última pieza: las mutaciones que cambien ese contenido deben invalidar también la caché del
calendario, o el mes quedará desactualizado hasta el próximo refresco.

```ts
export function useCreatePoll() {
  return useDataMutation(
    (input: CreateInput<Poll>) => db.polls.create(input),
    ['polls', 'calendarEntries'],
  );
}
```

---

## Lista de verificación

- [ ] Entidad en `core/types.ts` (con `Moderatable` si corresponde)
- [ ] Colección en `core/data/repository.ts` y `localProvider.ts`
- [ ] Contenido de ejemplo en `content/seed/` y `version` actualizada
- [ ] Imágenes declaradas en `content/images.ts`
- [ ] Hooks en el `api.ts` del módulo
- [ ] Páginas construidas solo con componentes de `@/ui`
- [ ] Descriptor `AppModule` exportado desde `index.tsx`
- [ ] Añadido a `modules/index.ts` y a `appConfig.enabledModules`
- [ ] Si el contenido tiene fecha: `calendarSources` declarada y `'calendarEntries'` en las
      invalidaciones de sus mutaciones
- [ ] `npm run typecheck` sin errores
