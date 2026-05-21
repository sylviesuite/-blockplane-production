-- get_monthly_footprint_summary()
-- Returns aggregated footprint_log totals for the current calendar month.
-- Not yet wired to the UI — this powers State B of the FootprintOnboarding panel
-- once 30+ days of data have accumulated.
--
-- Usage: select * from get_monthly_footprint_summary();

create or replace function get_monthly_footprint_summary()
returns table (
  total_ai_calls       bigint,
  total_input_tokens   bigint,
  total_output_tokens  bigint,
  total_tokens         bigint,
  period_start         date,
  period_end           date
)
language sql
security definer
stable
as $$
  select
    count(*)::bigint                            as total_ai_calls,
    coalesce(sum(input_tokens),  0)::bigint    as total_input_tokens,
    coalesce(sum(output_tokens), 0)::bigint    as total_output_tokens,
    coalesce(sum(total_tokens),  0)::bigint    as total_tokens,
    date_trunc('month', now())::date           as period_start,
    current_date                               as period_end
  from footprint_log
  where
    feature_name = 'insightbox'
    and created_at >= date_trunc('month', now())
    and created_at <  date_trunc('month', now()) + interval '1 month';
$$;
