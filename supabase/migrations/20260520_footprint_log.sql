-- ============================================================
-- footprint_log — platform self-measurement table.
-- Tracks AI API usage (tokens, calls) and other platform
-- activity events for BlockPlane's own lifecycle accounting.
--
-- All writes go through the Express server (service_role key),
-- which bypasses RLS. No direct client access permitted.
-- ============================================================

create table if not exists footprint_log (
  id                       uuid        primary key default gen_random_uuid(),
  created_at               timestamptz not null default now(),
  session_id               text        null,
  feature_name             text        not null,
  provider                 text        null,
  model                    text        null,
  input_tokens             integer     null,
  output_tokens            integer     null,
  total_tokens             integer     null,
  api_call_count           integer     default 1,
  project_id               uuid        null,
  user_id                  uuid        null,
  report_id                uuid        null,
  estimated_energy_kwh_min numeric     null,
  estimated_energy_kwh_max numeric     null,
  estimated_emissions_kg_min numeric   null,
  estimated_emissions_kg_max numeric   null,
  estimate_method          text        null,
  confidence_level         text        default 'unestimated',
  notes                    text        null
);

-- ── RLS ─────────────────────────────────────────────────────
alter table footprint_log enable row level security;

drop policy if exists "footprint_log_deny_anon" on footprint_log;
create policy "footprint_log_deny_anon"
  on footprint_log for all
  to anon
  using (false)
  with check (false);

drop policy if exists "footprint_log_deny_authenticated" on footprint_log;
create policy "footprint_log_deny_authenticated"
  on footprint_log for all
  to authenticated
  using (false)
  with check (false);
