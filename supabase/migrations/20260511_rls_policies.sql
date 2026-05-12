-- ============================================================
-- Row-Level Security: enable RLS and add policies on all
-- Supabase tables for blockplane-materials.
--
-- The server's service_role key bypasses RLS entirely, so all
-- server-side reads/writes continue to work unchanged.
-- These policies govern direct access via the anon/authenticated
-- keys only.
-- ============================================================

-- ── materials ───────────────────────────────────────────────
-- Public material browser: anyone may read, nobody may write
-- directly (all writes go through the server service key).
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "materials_public_read" ON materials;
CREATE POLICY "materials_public_read"
  ON materials FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── carbon_footprints ───────────────────────────────────────
ALTER TABLE carbon_footprints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "carbon_footprints_public_read" ON carbon_footprints;
CREATE POLICY "carbon_footprints_public_read"
  ON carbon_footprints FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── lis_ris_scores ──────────────────────────────────────────
ALTER TABLE lis_ris_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lis_ris_scores_public_read" ON lis_ris_scores;
CREATE POLICY "lis_ris_scores_public_read"
  ON lis_ris_scores FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── regional_data ───────────────────────────────────────────
ALTER TABLE regional_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "regional_data_public_read" ON regional_data;
CREATE POLICY "regional_data_public_read"
  ON regional_data FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── agent_job_logs ──────────────────────────────────────────
-- Internal server table. No access via anon or authenticated key.
ALTER TABLE agent_job_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agent_job_logs_deny_all" ON agent_job_logs;
CREATE POLICY "agent_job_logs_deny_all"
  ON agent_job_logs FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ── material_submissions ────────────────────────────────────
-- All reads and writes go through the Express server (service key).
-- No direct client access permitted.
ALTER TABLE material_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "material_submissions_deny_anon" ON material_submissions;
CREATE POLICY "material_submissions_deny_anon"
  ON material_submissions FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "material_submissions_deny_authenticated" ON material_submissions;
CREATE POLICY "material_submissions_deny_authenticated"
  ON material_submissions FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- ── user_profiles ───────────────────────────────────────────
-- Each authenticated user may read and update their own row.
-- Anon users have no access.
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_profiles_deny_anon" ON user_profiles;
CREATE POLICY "user_profiles_deny_anon"
  ON user_profiles FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "user_profiles_own_profile" ON user_profiles;
CREATE POLICY "user_profiles_own_profile"
  ON user_profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── beta_signups ────────────────────────────────────────────
-- Written by the server (service key) when users register.
-- No direct client access.
ALTER TABLE beta_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "beta_signups_deny_all" ON beta_signups;
CREATE POLICY "beta_signups_deny_all"
  ON beta_signups FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
