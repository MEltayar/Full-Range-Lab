-- ============================================================
-- Rehab Builder — Trainer message to client
--
-- A short note the trainer types into the profile that the
-- linked client will read on their portal. Distinct from
-- `general_notes`, which is private to the trainer.
--
-- Safe to run multiple times.
-- ============================================================

alter table public.clients
  add column if not exists trainer_message text;
