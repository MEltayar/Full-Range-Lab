-- ============================================================
-- Rehab Builder — Storage RLS for `progress-photos` bucket
--
-- Path scheme: <uploader_uid>/<client_id>/<photo_id>.<ext>
--   (storage.foldername(name))[1] = the auth user that uploaded
--   (storage.foldername(name))[2] = the rehab-builder client id
--
-- Access is keyed off the client_id segment so the same row works
-- whether the trainer or the linked client did the upload.
--
-- Trainer:        full read/write/delete on photos belonging to
--                 any of their clients.
-- Linked client:  full read/write/delete on photos for the client
--                 row their auth user is bound to (is_client_of).
--
-- Safe to run multiple times.
--
-- IMPORTANT: inside the EXISTS subqueries we must reference the storage
-- object's path as `storage.objects.name`, not bare `name`. The clients
-- table also has a `name` column, and Postgres' inner-scope resolution
-- would silently bind unqualified `name` to `clients.name` (the client's
-- display name), making `storage.foldername(name)` always return NULL
-- and the policy reject every read.
-- ============================================================

-- Make sure the bucket exists and stays private.
insert into storage.buckets (id, name, public)
  values ('progress-photos', 'progress-photos', false)
  on conflict (id) do update set public = false;

-- Drop our own policies so re-running is idempotent. If the project
-- has policies under different names, those need to be removed
-- manually from the Supabase dashboard.
drop policy if exists "progress_photos_storage_select_trainer" on storage.objects;
drop policy if exists "progress_photos_storage_insert_trainer" on storage.objects;
drop policy if exists "progress_photos_storage_update_trainer" on storage.objects;
drop policy if exists "progress_photos_storage_delete_trainer" on storage.objects;
drop policy if exists "progress_photos_storage_select_client"  on storage.objects;
drop policy if exists "progress_photos_storage_insert_client"  on storage.objects;
drop policy if exists "progress_photos_storage_update_client"  on storage.objects;
drop policy if exists "progress_photos_storage_delete_client"  on storage.objects;

-- ── Trainer policies ────────────────────────────────────────────
create policy "progress_photos_storage_select_trainer" on storage.objects
  for select using (
    bucket_id = 'progress-photos'
    and exists (
      select 1 from public.clients c
      where c.id = (storage.foldername(storage.objects.name))[2]
        and c.user_id = auth.uid()
    )
  );

create policy "progress_photos_storage_insert_trainer" on storage.objects
  for insert with check (
    bucket_id = 'progress-photos'
    and exists (
      select 1 from public.clients c
      where c.id = (storage.foldername(storage.objects.name))[2]
        and c.user_id = auth.uid()
    )
  );

create policy "progress_photos_storage_update_trainer" on storage.objects
  for update using (
    bucket_id = 'progress-photos'
    and exists (
      select 1 from public.clients c
      where c.id = (storage.foldername(storage.objects.name))[2]
        and c.user_id = auth.uid()
    )
  ) with check (
    bucket_id = 'progress-photos'
    and exists (
      select 1 from public.clients c
      where c.id = (storage.foldername(storage.objects.name))[2]
        and c.user_id = auth.uid()
    )
  );

create policy "progress_photos_storage_delete_trainer" on storage.objects
  for delete using (
    bucket_id = 'progress-photos'
    and exists (
      select 1 from public.clients c
      where c.id = (storage.foldername(storage.objects.name))[2]
        and c.user_id = auth.uid()
    )
  );

-- ── Linked-client policies ──────────────────────────────────────
create policy "progress_photos_storage_select_client" on storage.objects
  for select using (
    bucket_id = 'progress-photos'
    and public.is_client_of((storage.foldername(name))[2])
  );

create policy "progress_photos_storage_insert_client" on storage.objects
  for insert with check (
    bucket_id = 'progress-photos'
    and public.is_client_of((storage.foldername(name))[2])
  );

create policy "progress_photos_storage_update_client" on storage.objects
  for update using (
    bucket_id = 'progress-photos'
    and public.is_client_of((storage.foldername(name))[2])
  ) with check (
    bucket_id = 'progress-photos'
    and public.is_client_of((storage.foldername(name))[2])
  );

create policy "progress_photos_storage_delete_client" on storage.objects
  for delete using (
    bucket_id = 'progress-photos'
    and public.is_client_of((storage.foldername(name))[2])
  );
