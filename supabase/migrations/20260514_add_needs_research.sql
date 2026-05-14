-- Add needs_research flag to materials table.
-- Rows inserted via bulk import without carbon data get this set to true.
-- The MaterialResearchAgent queries needs_research = true on each run and fills in the data.
ALTER TABLE materials ADD COLUMN IF NOT EXISTS needs_research boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_materials_needs_research ON materials(needs_research) WHERE needs_research = true;
