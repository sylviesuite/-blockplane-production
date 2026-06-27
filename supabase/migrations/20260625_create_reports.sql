create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  project_id uuid references projects(id) on delete set null,
  title text not null,
  client_name text,
  notes text,
  material_ids text[] not null default '{}',
  report_type text not null default 'client-report',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_reports_user_id on reports(user_id);
create index if not exists idx_reports_project_id on reports(project_id);

alter table reports enable row level security;

create policy "Users can manage their own reports"
  on reports for all
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);
