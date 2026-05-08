-- Prevent duplicate materials with the same name + category.
-- Run after dedup-materials.ts has removed existing duplicates.
ALTER TABLE materials
  ADD CONSTRAINT materials_name_category_unique UNIQUE (name, category);
