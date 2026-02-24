# xps-rigid-foam — Elevation TODOs

Scaffold to bring **XPS rigid foam** (extruded polystyrene) to the same READY standard as the other Batch 1 materials. Documentation only; no data invented; all numeric values below are from agreed sources — Steve to fill or confirm from real sources.

---

## Overview / where it's used

**What this material is:** Extruded polystyrene (XPS) rigid foam board insulation. Used as **exterior rigid insulation** over sheathing or below-grade, in **below-grade** foundation and slab applications, **roof** insulation (e.g. protected membrane or above-deck), and similar continuous-insulation or envelope applications. Closed-cell; vapor-resistant; typically higher density and compressive strength than EPS.

---

## Numeric properties

Use these as the **only** numeric inputs for XPS in documentation and narrative. Do not introduce other densities, conductivities, R-values, or embodied-energy figures.

| Property                  | Value used                                         |
|---------------------------|----------------------------------------------------|
| Density                   | ≈ **35 kg/m³** (typical XPS board; range **30–45 kg/m³**) |
| Thermal conductivity, λ   | ≈ **0.030 W/m·K** (range **0.029–0.036 W/m·K**)          |
| R-value per inch          | ≈ **R-5.0 per inch** (range **R-4.5–R-5.6 per inch**)   |
| Embodied energy per kg    | ≈ **90 MJ/kg** (range **80–100 MJ/kg**; polystyrene stock material) |

**Derived value (only if needed):**  
- Embodied energy per m³: **≈ 3,100–3,600 MJ/m³** (from density and embodied energy per kg ranges above; e.g. 90 MJ/kg × 35–40 kg/m³). Do not introduce any other derived numbers.

Do **not** introduce: extra R-values (per thickness or assembly), additional λ or density, embodied-energy figures outside the table, or carbon-per-kg / carbon-per-m³ (those belong in a later LIS/RIS pass).

---

## Environmental + performance notes (qualitative only)

- **Carbon intensity** — XPS is petrochemical-based; manufacturing and blowing agents contribute to embodied carbon and, historically, to high-GWP potential; newer blowing agents reduce but do not eliminate that profile.
- **Moisture behavior** — Closed-cell; resists bulk water but can trap moisture against sheathing or below-grade surfaces if vapor paths are poor; can impede outward drying in vapor-closed assemblies.
- **Blowing agents** — Historically HFCs; newer products use lower-GWP blends; gas diffusion over time can reduce effective R-value and add to long-term carbon impact.
- **Comparison** — Higher embodied energy per unit R than mineral wool and wood fiberboard; often higher than EPS; similar or lower R per inch than polyiso in many specs. Keep comparisons qualitative unless using only the table above.

---

## What to watch (builders)

- **Fasteners** — Mechanical attachments can create thermal bypass and moisture paths; follow manufacturer guidance for type and spacing.
- **UV exposure** — XPS degrades in sunlight; protect with cladding, membrane, or coating; do not leave exposed.
- **Insects** — Foam can be targeted by pests; seal edges and transitions; consider protective layers where required.
- **Code notes** — Fire ratings and ignition barriers vary by jurisdiction; confirm thermal and fire requirements for application (exterior, below-grade, roof).
- **Below-grade** — Compressive strength and long-term creep matter; drainage and protection from bulk water and backfill damage are critical.

---

## Sources (name only)

- Manufacturer datasheets and EPDs for XPS board products.
- ICE (Inventory of Carbon & Energy) or equivalent LCA datasets for polystyrene / XPS.
- Industry or regional EPDs for extruded polystyrene insulation.

(No extra numbers in this section; fill specific references when sourcing.)

---

## 1. Data audit (LIS / RIS / CPI inputs)

- [ ] Confirm real source for core data (EPD, LCA study, manufacturer, etc.)
- [ ] Replace any generic defaults or category averages
- [ ] Document all assumptions clearly

---

## 2. InsightBox v2

- [ ] At-a-glance summary written
- [ ] LIS / RIS / CPI story (not numbers) clearly explained
- [ ] Tradeoffs vs at least one real alternative named
- [ ] Builder-practical "what to watch" bullets

---

## 3. Documentation parity with hempcrete

- [ ] Short narrative description (use hempcrete's level as reference)
- [ ] Notes on sources + limitations
- [ ] Any caveats about regional data or uncertainty

---

## 4. UI & comparisons

- [ ] Appears correctly in Materials Explorer
- [ ] CPI and alternatives do not mislead
- [ ] Charts render as expected

---

> **No LIS/RIS/CPI or physical-property values were invented by AI. Any new numbers must be added by Steve from trusted sources.**
