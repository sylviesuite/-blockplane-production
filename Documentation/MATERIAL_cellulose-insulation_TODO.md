# cellulose-insulation — Elevation TODOs

Scaffold to bring **cellulose insulation** (loose-fill and dense-pack for walls and attics) to the same READY standard as hempcrete (documentation-only). No data invented; all numeric values below are typical ranges from literature and EPDs, not guarantees.

---

## Overview / where it's used

**What this material is:** Cellulose insulation made from recycled paper (often newsprint and other post-consumer fiber), treated with fire retardants (e.g. borates). Installed as **loose-fill** in attics or as **dense-pack** in wall cavities. Vapor-open; typically higher recycled content and lower embodied energy than foam or fiberglass when sourced from real EPDs.

**Typical use:** Attic loose-fill; dense-pack in stud and joist cavities; retrofit and new construction where blown-in or dense-pack is specified.

---

## Physical properties table (sourced values only)

Use these as the **only** numeric inputs for cellulose in documentation and narrative. Values are typical ranges from literature and EPDs, not guarantees.

| Property                              | Value used / range                                  | Notes |
|--------------------------------------|-----------------------------------------------------|-------|
| Density (loose-fill attic)           | ~30 kg/m³ (25–40 kg/m³)                             | typical installed density |
| Density (dense-pack walls)           | ~55 kg/m³ (45–65 kg/m³)                             | typical installed density |
| Thermal conductivity λ               | ~0.040 W/m·K (0.038–0.042 W/m·K)                    | |
| R-value per inch (US framing)       | ~3.5 per inch (3.2–3.8 per inch)                   | |
| Embodied energy per kg               | ~3 MJ/kg (2–4 MJ/kg)                                | cradle-to-gate type ranges |
| Embodied energy per m³ (dense-pack)  | ~170 MJ/m³                                          | from ~3 MJ/kg × 55 kg/m³; no other EE/m³ values |

The embodied energy per m³ value (~170 MJ/m³) is derived as ~3 MJ/kg × 55 kg/m³ for dense-pack; do not introduce any other embodied-energy figures.

---

## Embodied energy & carbon notes (qualitative)

- Cellulose typically has **high recycled content** and **relatively low embodied energy** compared with rigid foam and many fiberglass products when normalized per unit R or per volume.
- Comparisons to fiberglass or foam (e.g. “often lower embodied energy than XPS”) are **qualitative only** in this doc; no new comparison numbers.
- Carbon profile depends on feedstock, transport, and treatment; use manufacturer or regional EPDs when quantifying.

---

## Moisture & fire performance (qualitative)

- **Moisture:** Vapor-open; can absorb and release moisture. When detailed correctly (drying potential, vapor control appropriate to climate), it supports moisture-tolerant assemblies. Poor detailing or bulk wetting can reduce performance or require remediation.
- **Fire:** Treated with borates or similar; fire resistance depends on product and coverage. Not a structural or ignition-barrier substitute; follow code and manufacturer guidance.

---

## What to watch / builder takeaways

- Install quality and density (especially dense-pack) affect in-situ R-value and settling; follow manufacturer specs and blower settings.
- Air sealing is critical; cellulose does not act as an air barrier.
- Moisture management: allow drying where possible; avoid trapping moisture against vapor-closed layers.
- Recycled content and fire treatment vary by product; check EPDs and datasheets for project-specific claims.

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

> **Important:** "All numeric values shown here come from real sources and are used as typical ranges, not guarantees. No LIS/RIS/CPI scores or structural properties were invented for this doc."
