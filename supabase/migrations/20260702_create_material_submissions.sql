-- Create material_submissions table if it doesn't exist, then patch any
-- missing columns. The schema cache mismatch ("carbon_value not found") is
-- caused by the table having been created manually in the dashboard without
-- a migration, so PostgREST never got a clean schema reload.

create table if not exists material_submissions (
  id               uuid        primary key default gen_random_uuid(),
  name             text        not null,
  category         text        not null,
  description      text,
  carbon_value     numeric,
  functional_unit  text,
  source           text,
  manufacturer     text,
  submitter_name   text,
  submitter_email  text,
  status           text        not null default 'pending',
  reviewer_notes   text,
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now()
);

-- Idempotent column additions — safe to run if table already exists with
-- some columns present and others missing.
do $$ begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'material_submissions'
       and column_name  = 'carbon_value'
  ) then
    alter table public.material_submissions add column carbon_value numeric;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'material_submissions'
       and column_name  = 'reviewer_notes'
  ) then
    alter table public.material_submissions add column reviewer_notes text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'material_submissions'
       and column_name  = 'reviewed_at'
  ) then
    alter table public.material_submissions add column reviewed_at timestamptz;
  end if;
end $$;

create index if not exists idx_material_submissions_status
  on material_submissions (status);

create index if not exists idx_material_submissions_created_at
  on material_submissions (created_at desc);

-- Enable RLS; all operations go through the service-role key on the server
-- so service_role bypasses RLS automatically. No user-facing policies needed.
alter table material_submissions enable row level security;

-- Flush the PostgREST schema cache so carbon_value is immediately visible.
select pg_notify('pgrst', 'reload schema');
