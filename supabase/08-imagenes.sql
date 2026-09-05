-- ============================================================================
-- APP CAA · SUBIR IMÁGENES DESDE LA APLICACIÓN
-- ----------------------------------------------------------------------------
-- Pegar en el SQL Editor de Supabase y ejecutar. Se puede repetir sin romper.
--
-- QUÉ CREA
-- Un depósito llamado `imagenes` donde van las fotos que el equipo sube al
-- publicar una noticia, un evento o un proyecto.
--
-- POR QUÉ EL DEPÓSITO ES PÚBLICO
-- Las fotos se muestran dentro de la app a gente con sesión iniciada, pero la
-- dirección de cada archivo es una cadena larga e impredecible. Hacerlo
-- privado obligaría a pedirle permiso al servidor por CADA imagen de CADA
-- pantalla, y a que esos permisos caduquen y haya que renovarlos.
--
-- Es la misma decisión que toma cualquier colegio al publicar fotos en su
-- sitio: no se ponen ahí datos que no puedan verse. Para lo sensible —la
-- nómina, los perfiles— seguimos con las reglas por fila, que no se tocan.
--
-- SUBIR Y BORRAR SÍ ESTÁN CERRADOS: solo moderadores y administradores.
-- ============================================================================


-- ============================================================================
-- 1. EL DEPÓSITO
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'imagenes',
  'imagenes',
  true,
  -- 5 MB de tope. La aplicación ya reduce las fotos antes de mandarlas, así
  -- que esto es solo una red por si algo se salta ese paso.
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;


-- ============================================================================
-- 2. QUIÉN PUEDE QUÉ
-- ============================================================================

-- Ver: cualquiera. Es lo que permite que la etiqueta <img> cargue la foto.
drop policy if exists "imagenes: ver" on storage.objects;
create policy "imagenes: ver"
  on storage.objects for select
  using (bucket_id = 'imagenes');

-- Subir: solo el equipo que publica.
drop policy if exists "imagenes: subir el equipo" on storage.objects;
create policy "imagenes: subir el equipo"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'imagenes' and public.es_editor());

-- Reemplazar y borrar: también solo el equipo.
drop policy if exists "imagenes: actualizar el equipo" on storage.objects;
create policy "imagenes: actualizar el equipo"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'imagenes' and public.es_editor())
  with check (bucket_id = 'imagenes' and public.es_editor());

drop policy if exists "imagenes: borrar el equipo" on storage.objects;
create policy "imagenes: borrar el equipo"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'imagenes' and public.es_editor());


-- ============================================================================
-- 3. COMPROBAR
-- ============================================================================

select id, public, file_size_limit from storage.buckets where id = 'imagenes';
