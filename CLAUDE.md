# App CAA · guía para trabajar en este repositorio

App del Centro de Alumnos del Colegio Del Verbo Divino, publicada en App Store.
La mantiene Mateo Burgos, que no es programador: escríbele en español, simple y
con pasos concretos, y hazle un resumen corto al terminar.

Este archivo existe para que cualquier sesión, desde cualquier dispositivo,
arranque sabiendo lo mismo. **El repositorio es PÚBLICO.** No escribas aquí,
ni en ningún archivo que se suba, datos de alumnos, contraseñas ni llaves.

## Cómo está hecha

- React 18 + TypeScript + Vite 6 + Tailwind v4, empaquetada con Capacitor 7.
- Datos en Supabase: tabla genérica `contenido` (coleccion, id, datos jsonb) para
  todo lo que publica el equipo, `perfiles` y `nomina` para las cuentas.
  Una colección nueva no necesita SQL.
- Cada sección es un módulo en `src/modules/*` registrado en `src/modules/index.ts`
  y activado en `src/config/app.config.ts`.
- Formularios del panel en `src/modules/admin/components/*FormSheet.tsx`.
- Los SQL numerados de `supabase/` los corre Mateo a mano en el SQL Editor.

## Reglas que no se discuten

- **Nunca subir** `src/content/roster.ts`, `supabase/03-nomina.sql`,
  `supabase/05-lanzamiento.sql`, `supabase/vapid.txt`,
  `src/content/seed/contenido.json`, `capturas/`, `scripts/.sesion.json`,
  `.env*`, llaves `.p8/.p12/.jks` ni `android/keystore.properties`.
  Son datos de 694 menores o secretos. Ya están en `.gitignore`: no lo relajes.
- Nunca pedir ni escribir la llave `service_role` / `sb_secret_…` de Supabase.
- Toda compilación pública lleva `VITE_DEMO_ROSTER=true`.
- Probar en **modo demostración** (sin Supabase), no contra la base real.
- En pruebas, **nunca** apretar una campanita de avisos (avisa a todo el colegio)
  ni "Activar avisos" (registra un dispositivo real).
- Los alumnos no publican nada en la app (así se le explicó a Apple).

## Preferencias de Mateo

- El panel **no limita** lo que escribe el equipo: nada de mínimos de caracteres,
  topes de largo ni "escríbelo en una línea". Solo se exige lo que identifica
  (título, nombre) y lo técnico (fechas, enlaces https).
- La app tiene que ser **muy intuitiva**: explicar cada paso en pantalla antes
  de que alguien se pierda.
- Paleta verde y amarilla. Las fotos se ven con su forma original, sin marcos
  borrosos ni recortes.
- Comentarios del código en español, explicando el porqué.

## Publicar

- Subir a `main` publica la versión web (GitHub Pages, `.github/workflows/pages.yml`).
- La app de iPhone se compila a mano: Actions → "Compilar para App Store"
  (`ios.yml`), escribiendo la versión (p. ej. `1.1`). Luego TestFlight, y en
  App Store Connect una versión nueva con los textos de `docs/FICHA-TIENDAS.md`.
- Google Play está congelado hasta que Mateo diga.
- Los cambios del teléfono llegan solo con una versión nueva en la tienda:
  conviene juntar varios y subir una sola.
