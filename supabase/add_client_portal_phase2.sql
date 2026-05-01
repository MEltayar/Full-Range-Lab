-- ============================================================
-- Rehab Builder — Client Portal Phase 2
-- Adds the auth/invite plumbing and rewrites RLS so clients
-- can read their plans + write their own logs/photos/check-ins.
--
-- Trainer side keeps full read/write on everything they own.
-- Client side: read plans + read/write their own contributions.
--
-- Safe to run multiple times.
-- ============================================================

-- ── 1. Track invite status on `clients` ────────────────────────
-- `client_user_id` was added in phase1; here we add the lifecycle stamps.
alter table public.clients
  add column if not exists invited_at         text,
  add column if not exists invite_accepted_at text;

-- ── 2. Helper: is the current user the linked client of <client_id>? ───
-- security definer so the function bypasses RLS when checking the link.
create or replace function public.is_client_of(p_client_id text)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.clients
    where id = p_client_id
      and client_user_id = auth.uid()
  );
$$;

-- ── 3. Trigger fn: when a client inserts a contributor row, force
-- user_id to point at the trainer who owns the client. This keeps
-- the trainer's existing `auth.uid() = user_id` policy working
-- regardless of whether the trainer or the client did the insert.
create or replace function public.set_user_id_from_client()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.user_id is null or new.user_id <> auth.uid() or public.is_client_of(new.client_id) then
    select user_id into new.user_id
    from public.clients
    where id = new.client_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_session_logs_user_id on public.client_session_logs;
create trigger trg_session_logs_user_id
before insert on public.client_session_logs
for each row execute function public.set_user_id_from_client();

drop trigger if exists trg_progress_photos_user_id on public.client_progress_photos;
create trigger trg_progress_photos_user_id
before insert on public.client_progress_photos
for each row execute function public.set_user_id_from_client();

drop trigger if exists trg_check_ins_user_id on public.client_check_ins;
create trigger trg_check_ins_user_id
before insert on public.client_check_ins
for each row execute function public.set_user_id_from_client();

-- ── 4. Trigger fn: link a new auth user to their pending client invite.
-- Fires after Supabase auth.users insert; matches by lower(email).
-- Also removes the auto-created trainer subscription (if any) since
-- portal clients aren't trainers.
create or replace function public.link_invited_client()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  matched_client_id text;
begin
  update public.clients
  set client_user_id      = new.id,
      invite_accepted_at  = now()::text
  where lower(email) = lower(new.email)
    and client_user_id is null
    and invited_at    is not null
  returning id into matched_client_id;

  if matched_client_id is not null then
    delete from public.subscriptions where user_id = new.id;
  end if;

  return new;
end;
$$;

-- z_ prefix so this fires after handle_new_user_subscription (alphabetical order).
drop trigger if exists z_link_invited_client on auth.users;
create trigger z_link_invited_client
after insert on auth.users
for each row
execute function public.link_invited_client();

-- ── 5. RLS rewrite ─────────────────────────────────────────────
-- Pattern: keep the trainer-owns-everything policy, then add
-- client-side policies that read from `is_client_of(client_id)`.

-- ── 5a. clients ────────────────────────────────────────────────
drop policy if exists "clients_own"           on public.clients;
drop policy if exists "clients_trainer_all"   on public.clients;
drop policy if exists "clients_self_select"   on public.clients;
drop policy if exists "clients_self_update"   on public.clients;

create policy "clients_trainer_all" on public.clients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "clients_self_select" on public.clients
  for select using (client_user_id = auth.uid());

-- Self-update: the linked client can update their own row. The app
-- only sends preference/dislike fields; trainer-owned columns
-- (user_id, invited_at, etc.) are protected at the application layer.
create policy "clients_self_update" on public.clients
  for update using (client_user_id = auth.uid())
  with check (client_user_id = auth.uid());

-- ── 5b. programs (read-only for the linked client) ─────────────
drop policy if exists "programs_own"          on public.programs;
drop policy if exists "programs_trainer_all"  on public.programs;
drop policy if exists "programs_client_read"  on public.programs;

create policy "programs_trainer_all" on public.programs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "programs_client_read" on public.programs
  for select using (public.is_client_of(client_id));

-- ── 5c. diet_plans (read-only for the linked client) ───────────
drop policy if exists "diet_plans_select"     on public.diet_plans;
drop policy if exists "diet_plans_insert"     on public.diet_plans;
drop policy if exists "diet_plans_update"     on public.diet_plans;
drop policy if exists "diet_plans_delete"     on public.diet_plans;
drop policy if exists "diet_plans_trainer_all" on public.diet_plans;
drop policy if exists "diet_plans_client_read" on public.diet_plans;

create policy "diet_plans_trainer_all" on public.diet_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "diet_plans_client_read" on public.diet_plans
  for select using (public.is_client_of(client_id));

-- ── 5d. client_check_ins (linked client can read + write own) ──
drop policy if exists "check_ins_own"          on public.client_check_ins;
drop policy if exists "check_ins_trainer_all"  on public.client_check_ins;
drop policy if exists "check_ins_client_all"   on public.client_check_ins;

create policy "check_ins_trainer_all" on public.client_check_ins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "check_ins_client_all" on public.client_check_ins
  for all using (public.is_client_of(client_id))
  with check (public.is_client_of(client_id));

-- ── 5e. client_progress_photos (linked client can read + write own) ──
drop policy if exists "progress_photos_own"         on public.client_progress_photos;
drop policy if exists "progress_photos_trainer_all" on public.client_progress_photos;
drop policy if exists "progress_photos_client_all"  on public.client_progress_photos;

create policy "progress_photos_trainer_all" on public.client_progress_photos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "progress_photos_client_all" on public.client_progress_photos
  for all using (public.is_client_of(client_id))
  with check (public.is_client_of(client_id));

-- ── 5f. client_session_logs (linked client can read + write own) ──
drop policy if exists "session_logs_own"         on public.client_session_logs;
drop policy if exists "session_logs_trainer_all" on public.client_session_logs;
drop policy if exists "session_logs_client_all"  on public.client_session_logs;

create policy "session_logs_trainer_all" on public.client_session_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "session_logs_client_all" on public.client_session_logs
  for all using (public.is_client_of(client_id))
  with check (public.is_client_of(client_id));

-- ── 5g. exercises read access for clients ──────────────────────
-- Clients need to see exercise names/descriptions for plans and logs.
-- Built-ins are already public (is_custom = false). Custom exercises
-- created by the client's trainer also need to be readable.
drop policy if exists "exercises_select"        on public.exercises;
drop policy if exists "exercises_select_for_clients" on public.exercises;

create policy "exercises_select" on public.exercises
  for select using (
    is_custom = false
    or user_id = auth.uid()
    or exists (
      select 1 from public.clients c
      where c.client_user_id = auth.uid()
        and c.user_id = public.exercises.user_id
    )
  );

-- ── 5h. food_items read access for clients ─────────────────────
drop policy if exists "food_items_select"        on public.food_items;
drop policy if exists "food_items_select_for_clients" on public.food_items;

create policy "food_items_select" on public.food_items
  for select using (
    is_custom = false
    or user_id = auth.uid()
    or exists (
      select 1 from public.clients c
      where c.client_user_id = auth.uid()
        and c.user_id = public.food_items.user_id
    )
  );

-- ── 6. Lock down search_path on the new functions ──────────────
alter function public.is_client_of(text)         set search_path = public, pg_temp;
alter function public.set_user_id_from_client()  set search_path = public, pg_temp;
alter function public.link_invited_client()      set search_path = public, pg_temp;
