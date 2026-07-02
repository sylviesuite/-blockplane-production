-- Add columns that were missing from the manually-created material_submissions
-- table. The prior migration (20260702_create_material_submissions.sql) only
-- added carbon_value, reviewer_notes, and reviewed_at; source and
-- submitter_name were present in the CREATE TABLE definition but missing
-- from the live table because CREATE TABLE IF NOT EXISTS was a no-op.

alter table public.material_submissions
  add column if not exists source         text,
  add column if not exists submitter_name text;

-- Flush PostgREST schema cache.
select pg_notify('pgrst', 'reload schema');
