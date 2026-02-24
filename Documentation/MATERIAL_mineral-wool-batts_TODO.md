# Mineral wool batts — Elevation TODOs

Scaffold to bring **mineral wool batts** (stone wool cavity insulation, e.g. ROCKWOOL COMFORTBATT) to the same READY standard as hempcrete. Documentation only; no data invented; all numeric values below are from agreed sources — Steve to fill or confirm from real sources.

**What this material is:** Stone (rock) or mineral wool cavity insulation in batt form for stud walls. Not rigid boards; used in the same cavity applications as fiberglass batts.

---

## Numeric values used

Use these as the only numeric inputs for mineral wool batts in documentation and narrative. Do not introduce other densities, conductivities, R-values, or embodied-energy figures.

| Property                | Value used              | Notes |
|-------------------------|-------------------------|-------|
| Density                 | ≈ 40 kg/m³              | Range 30–50 kg/m³ (cavity stone wool). |
| Thermal conductivity (λ)| ≈ 0.037 W/m·K           | Range 0.035–0.040 W/m·K. |
| R-value per inch        | ≈ 4.0 per inch          | Range 3.8–4.3 per inch. Typical examples: 3.5 in batt ≈ R-15, 5.5 in batt ≈ R-23. Do not add other R-values beyond what follows from 4.0 per inch. |
| Embodied energy (per kg)| ≈ 18 MJ/kg              | Range 16–20 MJ/kg. |
| Embodied energy (per m³)| ≈ 700 MJ/m³             | **Only allowed derived value:** 18 MJ/kg × 40 kg/m³. Do not derive or use other MJ/m³ values. |

All numeric values used in BlockPlane for this material must come from real sources (manufacturer datasheets, EPDs, ICE/EDGE-type LCA datasets). No LIS/RIS/CPI, density per board foot, or other numeric fields should be added in code or schema in this step; keep them in this doc until explicitly added from trusted sources.

---

## Narrative hooks

Use these for future InsightBox v2 and at-a-glance content. Do not add new numbers.

- **Cavity insulation role vs. fiberglass** — Same application (stud cavity); mineral wool at roughly R-4 per inch vs. fiberglass ~R-3 per inch; durability and install tolerance; no extra comparison numbers beyond the table above.
- **Performance in wet walls** — Drain/dry vs. absorb; mineral wool sheds water and stays dimensionally stable; vapor-open; mold and long-term risk.
- **Airflow / convective looping** — Batts in cavities; importance of air sealing; mineral wool’s stiffness and friction-fit vs. fiberglass gaps; no invented R-value penalties.
- **Fire and acoustic benefits** — Non-combustible; fire-stop use; sound absorption; qualitative only.
- **Embodied-energy comparison vs. fiberglass and foam** — Mineral wool batts in the ~16–20 MJ/kg band (≈700 MJ/m³); compare qualitatively to fiberglass and foam; no new embodied-energy numbers.

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
