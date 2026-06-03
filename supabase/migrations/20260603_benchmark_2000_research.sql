-- ============================================================
-- benchmark_2000_research — EC3 industry average research
-- results for the Benchmark 2000 reference home assemblies.
--
-- Written once by scripts/benchmark-research.js.
-- All writes use the service_role key (bypasses RLS).
-- ============================================================

create table if not exists benchmark_2000_research (
  id                       uuid        primary key default gen_random_uuid(),
  assembly_name            text        not null,
  material_name            text        not null,
  ec3_avg_kgco2e_per_unit  numeric     not null,
  unit                     text        not null,
  quantity_estimate        numeric     not null,
  total_kgco2e             numeric     not null,
  confidence               text        not null check (confidence in ('high', 'medium', 'low')),
  source_notes             text,
  researched_at            timestamptz not null default now()
);

-- Server-only table — no direct client access.
alter table benchmark_2000_research enable row level security;

drop policy if exists "benchmark_2000_research_deny_anon" on benchmark_2000_research;
create policy "benchmark_2000_research_deny_anon"
  on benchmark_2000_research for all
  to anon
  using (false)
  with check (false);

drop policy if exists "benchmark_2000_research_deny_authenticated" on benchmark_2000_research;
create policy "benchmark_2000_research_deny_authenticated"
  on benchmark_2000_research for all
  to authenticated
  using (false)
  with check (false);
