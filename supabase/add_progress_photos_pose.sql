-- ============================================================
-- Rehab Builder — Progress photos: add pose tag
--
-- A pose tag (front | side | back | other) lets the client and
-- trainer compare photos of the same pose taken weeks apart.
-- Optional column — existing rows just stay tagless.
--
-- Safe to run multiple times.
-- ============================================================

alter table public.client_progress_photos
  add column if not exists pose text;

-- Lightweight check so a typo'd value can't sneak in.
alter table public.client_progress_photos
  drop constraint if exists client_progress_photos_pose_check;

alter table public.client_progress_photos
  add constraint client_progress_photos_pose_check
  check (pose is null or pose in ('front', 'side', 'back', 'other'));
