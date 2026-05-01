-- ============================================================
-- Rehab Builder — Fix client invite linking
--
-- Problem: the original Phase 2 trigger `link_invited_client` only
-- fires AFTER INSERT on auth.users. The client app's `inviteClient`
-- used to call `signInWithOtp` (which creates auth.users) BEFORE
-- stamping `invited_at` on the clients row, so the trigger saw
-- `invited_at IS NULL` and skipped the link. The client then clicked
-- the email link, signed in, and landed on the "Not a portal client"
-- page because no row matched their `client_user_id`.
--
-- Fix: app code now stamps `invited_at` first, but legacy auth users
-- created before this fix won't ever fire the trigger again. This RPC
-- lets the portal page deferred-link them on next sign-in.
--
-- Safe to run multiple times.
-- ============================================================

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

  if matched_client_id is not null then
    -- Same cleanup as the auth.users INSERT trigger: portal clients
    -- aren't trainers, so drop any auto-created trainer subscription.
    delete from public.subscriptions where user_id = auth.uid();
    return true;
  end if;
  return false;
end;
$$;

grant execute on function public.link_self_to_client() to authenticated;
