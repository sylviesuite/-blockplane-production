# concrete-masonry-units — Elevation TODOs

Scaffold to bring this material to the same READY standard as hempcrete (documentation-only). Conventional masonry / concrete block (CMU) is documented here; no data invented; Steve to fill from real sources.

---

## Overview / where this material is used

Conventional masonry here means **normal-weight load-bearing concrete masonry units (CMU)** to standards such as ASTM C90—standard concrete blocks (e.g. 8×8×16 in) used for foundation walls, load-bearing walls, and commercial construction. Dense concrete block provides high compressive strength and thermal mass but poor insulation, so it is usually paired with insulation and careful detailing for moisture and thermal performance.

---

## Physical & embodied-energy reference (sourced values)

Use these as the only numeric inputs; do not invent others.

| Property | Value | Doc language |
|----------|--------|---------------|
| **Density** | 2300 kg/m³ | Typical range 2200–2400 kg/m³; we're using ≈2300 kg/m³. |
| **Compressive strength** (normal-weight load-bearing CMU to ASTM C90) | 14 MPa | Minimum code values around 13–14 MPa, with common units in the 13–20 MPa range; we're using ≈14 MPa as a typical reference. |
| **Thermal conductivity** | 1.2 W/m·K | Dense concrete block is typically 1.1–1.3 W/m·K; we're using ≈1.2 W/m·K. |
| **Embodied energy** | 1.0 MJ/kg; 2300 MJ/m³ | Literature values for dense concrete are roughly 0.7–1.1 MJ/kg, which gives ~1600–2500 MJ/m³ at typical densities. BlockPlane currently uses 1.0 MJ/kg (≈2300 MJ/m³) for this material. |

- **Density:** ≈2300 kg/m³ (typical range 2200–2400 kg/m³).
- **Compressive strength:** ≈14 MPa (minimum code values around 13–14 MPa; common units 13–20 MPa).
- **Thermal conductivity:** ≈1.2 W/m·K (dense block typically 1.1–1.3 W/m·K).
- **Embodied energy:** 1.0 MJ/kg (≈2300 MJ/m³ at 2300 kg/m³). Literature ~0.7–1.1 MJ/kg (~1600–2500 MJ/m³); BlockPlane uses 1.0 MJ/kg (≈2300 MJ/m³) for this material.

---

## Comparison context (qualitative only; use only the numbers above)

- **vs compressed earth blocks:** Conventional masonry has much higher embodied energy (~2300 MJ/m³ vs ~750 MJ/m³ for CEB) and much higher compressive strength (~14 MPa vs ~3 MPa). Thermal conductivity is higher (~1.2 W/m·K vs ~0.60 W/m·K), so conventional block is poorer insulation and is usually paired with insulation; both provide thermal mass.
- **vs fired clay brick:** Conventional masonry has lower embodied energy than fired brick (~3315 MJ/m³), but higher than CEB. Strength and durability are high; moisture and detailing remain important for both.

---

## 1. Data audit (LIS / RIS / CPI inputs)

- [ ] Confirm real source for core data (EPD, LCA study, manufacturer, etc.)
- [ ] Replace any generic defaults or category averages
- [ ] Document all assumptions clearly

---

## 2. InsightBox v2

- [ ] At-a-glance summary written
- [ ] LIS / RIS / CPI story (not numbers) clearly explained
- [ ] Tradeoffs vs at least one real alternative named (e.g. compressed earth blocks, fired brick)
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

## Where the numbers came from

- Density, compressive strength, and thermal conductivity are **code and literature values** for normal-weight load-bearing concrete block (e.g. ASTM C90).
- Embodied energy is from **literature ranges for dense concrete** (≈0.7–1.1 MJ/kg); BlockPlane uses 1.0 MJ/kg (≈2300 MJ/m³) as a reference until manufacturer- or EPD-specific data are available.
- Exact performance depends on **aggregate, cement content, and production**; BlockPlane treats these as **conservative reference numbers**.

---

> **NOTE:** No LIS/RIS/CPI values or physical properties in this doc were invented by AI. Any numeric fields not listed here must be filled by Steve from real sources.
