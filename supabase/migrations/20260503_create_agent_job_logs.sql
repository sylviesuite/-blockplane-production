CREATE TABLE IF NOT EXISTS agent_job_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at   timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  queries_run  integer NOT NULL DEFAULT 0,
  inserted     integer NOT NULL DEFAULT 0,
  skipped      integer NOT NULL DEFAULT 0,
  errors       jsonb NOT NULL DEFAULT '[]'::jsonb,
  status       text NOT NULL DEFAULT 'running'
                 CHECK (status IN ('running', 'completed', 'failed'))
);
