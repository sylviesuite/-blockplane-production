-- Track whether a user has completed the first-time onboarding modal.
-- Defaults to false so all existing and new users see onboarding on first login.
-- Set to true when the user clicks "Get Started" or "Skip" in the modal.
alter table public.user_profiles
  add column if not exists onboarding_complete boolean not null default false;
