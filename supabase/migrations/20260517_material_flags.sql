-- Create material_flags table for user-reported data issues
create table if not exists public.material_flags (
  id          uuid primary key default gen_random_uuid(),
  material_id text not null references public.materials(id) on delete cascade,
  flag_type   text not null check (flag_type in ('wrong_data', 'missing_data', 'wrong_category', 'duplicate', 'other')),
  notes       text,
  user_id     text,
  status      text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at  timestamptz not null default now()
);

create index if not exists material_flags_material_id_idx on public.material_flags(material_id);
create index if not exists material_flags_status_idx on public.material_flags(status);

-- Row-level security: service role can read/write all; anon can only insert
alter table public.material_flags enable row level security;

create policy "service role full access" on public.material_flags
  using (true)
  with check (true);
