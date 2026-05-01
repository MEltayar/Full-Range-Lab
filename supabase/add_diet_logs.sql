-- ============================================================
-- Rehab Builder — Diet adherence logs (Phase 2.5)
-- One row per (client_id, plan_id, day_id, meal_id, date).
-- Client toggles "eaten" + writes a per-meal note;
-- trainer reads everything for that client.
-- Safe to run multiple times.
-- ============================================================

create table if not exists public.diet_logs (
  id         text primary key,
  client_id  text not null references public.clients(id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  plan_id    text not null references public.diet_plans(id) on delete cascade,
  day_id     text not null,
  meal_id    text not null,
  date       text not null,                    -- YYYY-MM-DD
  eaten      boolean not null default false,
  notes      text,
  created_at text not null,
  updated_at text not null,
  unique (client_id, plan_id, day_id, meal_id, date)
);

alter table public.diet_logs enable row level security;

-- Trainer (owns user_id) full access
drop policy if exists "diet_logs_trainer_all" on public.diet_logs;
create policy "diet_logs_trainer_all" on public.diet_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Linked client full access to their own rows
drop policy if exists "diet_logs_client_all" on public.diet_logs;
create policy "diet_logs_client_all" on public.diet_logs
  for all using (public.is_client_of(client_id))
  with check (public.is_client_of(client_id));

-- Stamp user_id with the trainer's id (works whether trainer or client inserts)
drop trigger if exists trg_diet_logs_user_id on public.diet_logs;
create trigger trg_diet_logs_user_id
before insert on public.diet_logs
for each row execute function public.set_user_id_from_client();

create index if not exists idx_diet_logs_client_date on public.diet_logs(client_id, date desc);
create index if not exists idx_diet_logs_plan        on public.diet_logs(plan_id);
