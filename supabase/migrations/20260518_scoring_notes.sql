-- Add scoring_notes column for admin-facing notes on materials that require
-- special handling (e.g. MEP equipment, proprietary products, pending category decisions).
-- Separate from description so human-readable product text is not polluted with admin metadata.
alter table public.materials
  add column if not exists scoring_notes text;

-- Once this migration is applied, move the interim notes that were appended to
-- description for pending_category_review materials into this column and strip
-- the "[Scoring note: ...]" suffix from those descriptions.
