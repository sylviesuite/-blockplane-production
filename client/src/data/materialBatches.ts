// AUTO-GENERATED from scripts/seed-materials.mjs — run: node scripts/generate-material-batches.mjs
// Internal work batches (25 / 25 / rest). Do not edit by hand.

export const MATERIAL_BATCHES = {
  1: ["asphalt-shingles","bamboo-composite-decking","bio-resin-composite-panels","fiber-cement-boards","flax-fiber-composite-panels","float-glass","recycled-plastic-lumber","recycled-rubber-flooring","alkali-activated-concrete","carbon-cured-concrete","fly-ash-concrete","geopolymer-concrete","hempcrete","high-strength-concrete","pervious-concrete","ready-mix-concrete","ready-mix-concrete","recycled-aggregate-concrete","standard-portland-cement-concrete","ultra-high-performance-concrete","adobe-bricks","compressed-earth-blocks","earth-bag-construction","earth-plaster","mycelium-composite-panels"] as const,
  2: ["rammed-earth","stabilized-earth-blocks","straw-bale","aerogel-insulation","cellulose-insulation","cork-insulation-boards","eps-foam-board","fiberglass-batt-insulation","hemp-fiber-insulation","mineral-wool-insulation","mycelium-insulation-panels","recycled-denim-insulation","sheep-wool-insulation","wood-fiber-insulation-boards","xps-foam-board","autoclaved-aerated-concrete","calcium-silicate-bricks","concrete-masonry-units","fired-clay-bricks","gypsum-drywall-1-2","natural-stone","recycled-brick","cold-formed-steel-studs-3-5-8","cold-formed-steel-studs-6","cold-formed-steel-studs-8"] as const,
  3: ["galvanized-steel-decking","hot-rolled-steel-beams","metal-track-channels","pre-weathered-steel-cladding","recycled-steel-rebar","recycled-steel-sections","stainless-steel","steel-mesh","structural-steel","virgin-aluminum-sheet","virgin-steel-rebar","virgin-steel-structural-sections","weathering-steel","2x10-joists","2x12-joists","2x4-studs","2x6-studs","2x8-joists","4x4-posts","cork-panels","cross-laminated-timber","engineered-bamboo","fsc-certified-hardwood","fsc-certified-softwood","glulam","i-joists","lsl-studs","lvl-beams","mass-timber-panels","osb-sheathing-7-16","plywood-sheathing","psl-beams","reclaimed-wood","timber-frame-system","wood-fiber-cement-boards"] as const,
} as const;

/** Batch 1 material ids that pass the full "ready" audit (data + InsightBox v2 + doc, no proxy). See Documentation/MATERIAL_BATCH1_STATUS.md. */
export const MATERIAL_BATCH1_READY = ["hempcrete"] as const;

export type MaterialBatchId = keyof typeof MATERIAL_BATCHES;
