# polyiso — Elevation TODOs

Scaffold to bring polyisocyanurate (polyiso) insulation to the same READY standard as hempcrete (documentation-only). Polyiso is documented here; no data invented; Steve to fill from real sources.

---

## Physical & embodied-energy reference (sourced values)

Use these as the only numeric inputs; do not invent others.

- **Density:** ~30 kg/m³ (typical range ~28–32 kg/m³).
- **Thermal conductivity:** ~0.027 W/m·K (range ~0.025–0.03 W/m·K).
- **R-value:** ~6.5 per inch (range ~6–7 per inch).
- **Embodied energy:** ~100 MJ/kg (range ~90–110 MJ/kg).

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

## Data notes

- The values above (density, thermal conductivity, R-value, embodied energy) are **representative values from published studies**.
- Polyiso R-value can drop at cold temperatures; use documented values as reference and confirm with manufacturer data for cold-climate applications.
- BlockPlane treats them as **conservative reference numbers** until manufacturer- or project-specific data are available.

---

> **NOTE:** No LIS/RIS/CPI values or physical properties were invented by AI. Any numeric fields not listed here must be filled by Steve from real sources.
