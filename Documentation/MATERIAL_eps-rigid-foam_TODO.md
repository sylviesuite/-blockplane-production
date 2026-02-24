# eps-rigid-foam — Elevation TODOs

Scaffold to bring this material to the same READY standard as hempcrete (fully sourced data, InsightBox v2, and narrative — no proxy).

---

## 1. Summary (builder view)

- **What it is** — Molded expanded polystyrene (EPS) rigid foam board; beads expanded with steam/heat, not extruded.
- **Typical use** — Above-grade walls (continuous insulation over sheathing), foundation exterior insulation, roof decks, under slabs where allowed by code.
- **Key strengths** — Light weight, decent R per inch, low water absorption compared with fiberglass, stable over time if protected from UV and solvents; vapor-permeable enough to allow drying in many assemblies.
- **Key watch-outs** — Petrochemical feedstock, relatively high embodied energy per kg, fire behavior and ignition barriers, blowing agent and recycling issues; lower compressive strength than XPS or polyiso.

---

## 2. Numeric reference table (real ranges)

Use these as the **only** numeric inputs for EPS in documentation and narrative. Do not introduce other densities, conductivities, R-values, or embodied-energy/carbon figures.

| Property                              | Value used (BlockPlane)                            | Notes |
|---------------------------------------|----------------------------------------------------|-------|
| Density                               | ~20 kg/m³ (range 10–35 kg/m³)                      | molded EPS insulation board |
| Thermal conductivity λ                | ~0.036 W/m·K (range 0.032–0.040 W/m·K)            | near 24°C mean temp |
| R-value per inch                      | ~R-3.8 to R-4.2 per inch (R-4 typical)             | 25.4 mm thickness |
| Embodied energy per kg                | ~90 MJ/kg (range 80–110 MJ/kg)                     | cradle-to-gate, incl. feedstock |
| Embodied carbon per kg                | ~2.5 kg CO₂e/kg (range 2–3 kg CO₂e/kg)            | cradle-to-gate |
| Embodied energy per m³ (20 kg/m³)     | ~1800 MJ/m³                                        | derived from 90 MJ/kg × 20 kg/m³ |

> **Important:** These values are placeholders until we map them to specific EPDs and code-recognized data sources. Any future LIS/RIS/CPI math must reference the underlying sources directly.

---

## 3. Narrative notes for Gold InsightBox (future)

Bullet out, in plain text, what the EPS vs XPS / mineral wool / polyiso narratives should emphasize:

- **Where EPS is usually a “good enough” choice** — Cost-sensitive exterior insulation; under slabs where moisture is controlled; above-grade sheathing and continuous insulation when drying capacity and long-term R-value stability matter more than maximum R per inch.
- **Where XPS or polyiso usually wins** — Higher compressive strength; higher R per inch in many specs; tighter moisture exposure (e.g. some below-grade applications where vapor closure is required); applications where maximum rigidity is specified.
- **RIS-style concerns** — Feedstock (petrochemical); fire behavior and need for ignition barriers; recyclability (EPS beads easier to recycle than XPS in some regions); microplastics risk and landfill persistence; blowing agents (pentane/CO₂ for EPS typically lower-GWP than historical XPS HFCs).

No new numbers in this section; refer back to the table for any figures.

---

## 4. Data audit & schema (later)

- [ ] Confirm real source for core data (EPD, LCA study, manufacturer, etc.)
- [ ] Replace any generic defaults or category averages
- [ ] Document all assumptions clearly
- [ ] Wire into schema only when data is sourced and approved

---

> **No LIS/RIS/CPI or structural properties are updated by this TODO. Those come later when data is wired into the schema.**
