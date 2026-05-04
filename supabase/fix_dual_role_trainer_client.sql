-- ============================================================
-- Rehab Builder — Allow trainer + client dual identity
--
-- Problem: the original Phase 2 logic assumed an auth user is
-- *either* a trainer *or* a client. When trainer A invited trainer B
-- as a client (same email), the link function deleted trainer B's
-- subscription row, destroying their trainer account.
--
-- Fix: keep the link (so the client portal works) but never touch
-- the subscriptions table. A user who is both a trainer and a
-- client now keeps their trainer subscription; the app picks which
-- "view" to render via an active-role flag in localStorage.
--
-- Safe to run multiple times.
-- ============================================================

-- ── 1. Trigger fn: link new auth user to pending client invite ─────
-- Removed the `delete from subscriptions` line that was clobbering
-- trainers who happened to share an email with a pending invite.
create or replace function public.link_invited_client()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.clients
  set client_user_id      = new.id,
      invite_accepted_at  = now()::text
  where lower(email) = lower(new.email)
    and client_user_id is null
    and invited_at    is not null;

  return new;
end;
$$;

-- ── 2. Deferred-link RPC for users who already had auth.users ──────
-- Same change: keep the link, never delete the subscription.
create or replace function public.link_self_to_client()
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email           text;
  matched_client_id text;
begin
  select email into v_email from auth.users where id = auth.uid();
  if v_email is null then return false; end if;

  update public.clients
  set client_user_id     = auth.uid(),
      invite_accepted_at = coalesce(invite_accepted_at, now()::text)
  where lower(email) = lower(v_email)
    and client_user_id is null
    and invited_at    is not null
  returning id into matched_client_id;

  return matched_client_id is not null;
end;
$$;

grant execute on function public.link_self_to_client() to authenticated;

-- ── 3. Lock down search_path on the rewritten functions ────────────
alter function public.link_invited_client() set search_path = public, pg_temp;
alter function public.link_self_to_client() set search_path = public, pg_temp;
