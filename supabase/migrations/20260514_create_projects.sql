create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  project_data jsonb not null default '{}'::jsonb
);

create index if not exists idx_projects_user_id on projects(user_id);

alter table projects enable row level security;

create policy "Users can manage their own projects"
  on projects for all
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);
