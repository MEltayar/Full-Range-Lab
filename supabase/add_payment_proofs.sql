-- ============================================================
-- Rehab Builder — Manual-payment proof submissions
--
-- Trainers don't have an automated payment provider; they pay
-- by Vodafone Cash or Instapay and message a receipt. This
-- table + bucket lets them upload the receipt directly from
-- the expired-wall UI so admins can review and approve in-app
-- instead of going through WhatsApp.
--
-- Path scheme for the storage bucket:
--   <user_id>/<proof_id>.<ext>
--
-- Safe to run multiple times.
-- ============================================================

-- ── 1. Table ──────────────────────────────────────────────────
create table if not exists public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  method text not null check (method in ('vodafone_cash', 'instapay', 'other')),
  amount_paid numeric,
  reference_note text,                                       -- free-text from trainer (txn id, sender, etc.)
  requested_plan text not null check (requested_plan in ('pro_monthly', 'pro_yearly')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz not null default now()
);

create index if not exists payment_proofs_user_idx on public.payment_proofs (user_id);
create index if not exists payment_proofs_status_idx on public.payment_proofs (status);

alter table public.payment_proofs enable row level security;

-- Trainers see their own submissions
drop policy if exists "payment_proofs_self_select" on public.payment_proofs;
create policy "payment_proofs_self_select" on public.payment_proofs
  for select using (auth.uid() = user_id);

-- Trainers can submit a new proof for themselves, but only as 'pending' —
-- they can't pre-approve their own payment.
drop policy if exists "payment_proofs_self_insert" on public.payment_proofs;
create policy "payment_proofs_self_insert" on public.payment_proofs
  for insert with check (
    auth.uid() = user_id
    and status = 'pending'
    and reviewed_by is null
    and reviewed_at is null
  );

-- Admins (super_admin, staff) can read all submissions
drop policy if exists "payment_proofs_admin_select" on public.payment_proofs;
create policy "payment_proofs_admin_select" on public.payment_proofs
  for select using (public.is_admin());

-- Admins can update any submission (approve / reject / annotate)
drop policy if exists "payment_proofs_admin_update" on public.payment_proofs;
create policy "payment_proofs_admin_update" on public.payment_proofs
  for update using (public.is_admin()) with check (public.is_admin());

-- Admins can delete a submission if it was filed in error
drop policy if exists "payment_proofs_admin_delete" on public.payment_proofs;
create policy "payment_proofs_admin_delete" on public.payment_proofs
  for delete using (public.is_admin());

-- ── 2. Storage bucket ─────────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('payment-proofs', 'payment-proofs', false)
  on conflict (id) do update set public = false;

-- See add_progress_photos_storage.sql for why we qualify
-- `storage.objects.name` explicitly inside policy expressions.
drop policy if exists "payment_proofs_storage_select_self" on storage.objects;
drop policy if exists "payment_proofs_storage_insert_self" on storage.objects;
drop policy if exists "payment_proofs_storage_select_admin" on storage.objects;
drop policy if exists "payment_proofs_storage_delete_admin" on storage.objects;

create policy "payment_proofs_storage_select_self" on storage.objects
  for select using (
    bucket_id = 'payment-proofs'
    and (storage.foldername(storage.objects.name))[1] = auth.uid()::text
  );

create policy "payment_proofs_storage_insert_self" on storage.objects
  for insert with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(storage.objects.name))[1] = auth.uid()::text
  );

create policy "payment_proofs_storage_select_admin" on storage.objects
  for select using (
    bucket_id = 'payment-proofs'
    and public.is_admin()
  );

create policy "payment_proofs_storage_delete_admin" on storage.objects
  for delete using (
    bucket_id = 'payment-proofs'
    and public.is_admin()
  );

-- ── 3. Approval RPC ───────────────────────────────────────────
-- Approving a proof must do two writes: flip the proof to 'approved'
-- AND extend the subscription. Doing it from the client would race
-- (and force two policies to align). One SECURITY DEFINER RPC keeps
-- it atomic and lets the admin call a single function.
create or replace function public.approve_payment_proof(
  p_proof_id uuid,
  p_period_end timestamptz,
  p_admin_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_plan text;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select user_id, requested_plan
    into v_user_id, v_plan
    from public.payment_proofs
    where id = p_proof_id
      and status = 'pending'
    for update;

  if v_user_id is null then
    raise exception 'proof not found or already reviewed';
  end if;

  update public.payment_proofs
    set status = 'approved',
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        admin_notes = coalesce(p_admin_notes, admin_notes)
    where id = p_proof_id;

  insert into public.subscriptions (user_id, plan, status, current_period_end)
    values (v_user_id, v_plan, 'active', p_period_end)
    on conflict (user_id) do update
      set plan = excluded.plan,
          status = 'active',
          current_period_end = excluded.current_period_end;
end;
$$;

grant execute on function public.approve_payment_proof(uuid, timestamptz, text) to authenticated;

create or replace function public.reject_payment_proof(
  p_proof_id uuid,
  p_admin_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  update public.payment_proofs
    set status = 'rejected',
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        admin_notes = coalesce(p_admin_notes, admin_notes)
    where id = p_proof_id
      and status = 'pending';
end;
$$;

grant execute on function public.reject_payment_proof(uuid, text) to authenticated;
