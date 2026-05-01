-- ============================================================
-- Rehab Builder — Hard-enforce per-client subscription expiry
--
-- Until now, the expiry wall was UI-only. A determined client could
-- bypass it by hitting the Supabase REST API directly. This migration
-- moves the date check into the policies themselves so that when
-- `clients.subscription_end_date` is in the past, the database itself
-- rejects every read/write the client tries to make on their data.
--
-- Trainer access is unchanged.
-- The client's own `clients` row stays readable so the expiry wall
-- can still tell them WHY they're locked out (otherwise they'd just
-- see "Not a portal client" and be confused).
--
-- Safe to run multiple times.
-- ============================================================

-- ── 1. Helper: active = linked client AND not expired ─────────
create or replace function public.is_active_client_of(p_client_id text)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.clients c
    where c.id = p_client_id
      and c.client_user_id = auth.uid()
      and (c.subscription_end_date is null
           or c.subscription_end_date::date >= current_date)
  );
$$;

grant execute on function public.is_active_client_of(text) to authenticated;

-- ── 2. clients (self-update only — self-select stays open so the
--      wall component can read the row to render the expiry message)
drop policy if exists "clients_self_update" on public.clients;
create policy "clients_self_update" on public.clients
  for update using (
    client_user_id = auth.uid()
    and (subscription_end_date is null
         or subscription_end_date::date >= current_date)
  )
  with check (
    client_user_id = auth.uid()
    and (subscription_end_date is null
         or subscription_end_date::date >= current_date)
  );

-- ── 3. programs (read-only for clients) ───────────────────────
drop policy if exists "programs_client_read" on public.programs;
create policy "programs_client_read" on public.programs
  for select using (public.is_active_client_of(client_id));

-- ── 4. diet_plans (read-only for clients) ─────────────────────
drop policy if exists "diet_plans_client_read" on public.diet_plans;
create policy "diet_plans_client_read" on public.diet_plans
  for select using (public.is_active_client_of(client_id));

-- ── 5. client_check_ins ───────────────────────────────────────
drop policy if exists "check_ins_client_all" on public.client_check_ins;
create policy "check_ins_client_all" on public.client_check_ins
  for all using (public.is_active_client_of(client_id))
  with check (public.is_active_client_of(client_id));

-- ── 6. client_progress_photos ─────────────────────────────────
drop policy if exists "progress_photos_client_all" on public.client_progress_photos;
create policy "progress_photos_client_all" on public.client_progress_photos
  for all using (public.is_active_client_of(client_id))
  with check (public.is_active_client_of(client_id));

-- ── 7. client_session_logs ────────────────────────────────────
drop policy if exists "session_logs_client_all" on public.client_session_logs;
create policy "session_logs_client_all" on public.client_session_logs
  for all using (public.is_active_client_of(client_id))
  with check (public.is_active_client_of(client_id));

-- ── 8. diet_logs ──────────────────────────────────────────────
drop policy if exists "diet_logs_client_all" on public.diet_logs;
create policy "diet_logs_client_all" on public.diet_logs
  for all using (public.is_active_client_of(client_id))
  with check (public.is_active_client_of(client_id));

-- ── 9. Storage: progress-photos bucket ────────────────────────
-- See add_progress_photos_storage.sql for why we qualify
-- `storage.objects.name` explicitly inside the EXISTS subquery.
drop policy if exists "progress_photos_storage_select_client" on storage.objects;
drop policy if exists "progress_photos_storage_insert_client" on storage.objects;
drop policy if exists "progress_photos_storage_update_client" on storage.objects;
drop policy if exists "progress_photos_storage_delete_client" on storage.objects;

create policy "progress_photos_storage_select_client" on storage.objects
  for select using (
    bucket_id = 'progress-photos'
    and public.is_active_client_of((storage.foldername(storage.objects.name))[2])
  );

create policy "progress_photos_storage_insert_client" on storage.objects
  for insert with check (
    bucket_id = 'progress-photos'
    and public.is_active_client_of((storage.foldername(storage.objects.name))[2])
  );

create policy "progress_photos_storage_update_client" on storage.objects
  for update using (
    bucket_id = 'progress-photos'
    and public.is_active_client_of((storage.foldername(storage.objects.name))[2])
  ) with check (
    bucket_id = 'progress-photos'
    and public.is_active_client_of((storage.foldername(storage.objects.name))[2])
  );

create policy "progress_photos_storage_delete_client" on storage.objects
  for delete using (
    bucket_id = 'progress-photos'
    and public.is_active_client_of((storage.foldername(storage.objects.name))[2])
  );
