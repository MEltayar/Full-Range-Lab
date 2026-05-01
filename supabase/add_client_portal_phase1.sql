-- ============================================================
-- Rehab Builder — Client Portal Phase 1 Schema
-- Adds the fields and tables clients will contribute data into.
--
-- Phase 1 = trainer enters this on behalf of clients (no client login yet).
-- Phase 2 will add client auth + rewrite RLS so the linked client can
-- read their own row and write to logs/photos/measurements.
--
-- Safe to run multiple times (all `if not exists`).
-- ============================================================

-- ── 1. Extend `clients` with preference + invite-link fields ───
alter table public.clients
  add column if not exists exercise_preferences text,
  add column if not exists exercise_dislikes    text,
  add column if not exists allergies            text,
  -- Phase 2: set when the client accepts an invite and creates their auth account.
  -- on delete set null = removing their auth user keeps the trainer's record intact.
  add column if not exists client_user_id uuid references auth.users(id) on delete set null;

-- One client = at most one auth user (only when linked).
create unique index if not exists idx_clients_client_user_id_unique
  on public.clients(client_user_id)
  where client_user_id is not null;

-- ── 2. Extend `client_check_ins` with extra body data + weekly mood ───
alter table public.client_check_ins
  add column if not exists thigh_cm     numeric,
  add column if not exists arm_cm       numeric,
  add column if not exists mood         text,    -- 'great' | 'good' | 'okay' | 'tired' | 'bad'
  add column if not exists energy_level integer, -- 1..5
  add column if not exists weekly_notes text;

-- ── 3. New table: client_progress_photos ───────────────────────
-- One row per uploaded photo. `photo_url` will point to Supabase Storage in Phase 2.
create table if not exists public.client_progress_photos (
  id           text primary key,
  client_id    text not null references public.clients(id) on delete cascade,
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  check_in_id  text references public.client_check_ins(id) on delete set null,
  photo_url    text not null,
  taken_at     text not null,
  caption      text,
  created_at   text not null
);

alter table public.client_progress_photos enable row level security;

drop policy if exists "progress_photos_own" on public.client_progress_photos;
create policy "progress_photos_own" on public.client_progress_photos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_progress_photos_client on public.client_progress_photos(client_id);

-- ── 4. New table: client_session_logs ──────────────────────────
-- One row per logged training session.
-- `exercises` jsonb shape:
--   [{ "exercise_id": "...", "sets": [{ "weight_kg": 50, "reps": 10, "rpe": 8 }, ...], "notes": "..." }, ...]
-- program_id / program_session_id link the log back to the trainer's plan when available.
create table if not exists public.client_session_logs (
  id                  text primary key,
  client_id           text not null references public.clients(id) on delete cascade,
  user_id             uuid not null default auth.uid() references auth.users(id) on delete cascade,
  program_id          text references public.programs(id) on delete set null,
  program_session_id  text,
  logged_at           text not null,
  exercises           jsonb not null default '[]',
  notes               text,
  created_at          text not null
);

alter table public.client_session_logs enable row level security;

drop policy if exists "session_logs_own" on public.client_session_logs;
create policy "session_logs_own" on public.client_session_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_session_logs_client on public.client_session_logs(client_id);
create index if not exists idx_session_logs_logged_at on public.client_session_logs(logged_at);
