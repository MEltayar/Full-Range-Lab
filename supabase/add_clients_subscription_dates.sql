-- ============================================================
-- Rehab Builder — Client engagement window
--
-- Adds an optional start/end date so trainers can mark when a
-- client's paid engagement begins and ends. When `subscription_end_date`
-- is in the past, the client portal shows an "expired" wall instead of
-- the dashboard. Both columns are nullable; clients without dates set
-- are treated as open-ended (current behavior preserved).
--
-- Safe to run multiple times.
-- ============================================================

alter table public.clients
  add column if not exists subscription_start_date date,
  add column if not exists subscription_end_date   date;
