# cellulose-insulation — Elevation TODOs

Scaffold to bring **loose-fill / dense-pack cellulose insulation** (walls and attics) to the same READY standard as hempcrete, fiberglass, polyiso, XPS, and other Batch 1 materials. Documentation-only; all numeric values below are from published ranges and EPDs — no invented numbers.

**What this material is:** Cellulose insulation is made from recycled paper (newsprint, cardboard, and other post-consumer fiber), treated with fire and pest retardants (e.g. borates). It is installed as **loose-fill** in attics or **dense-pack** in wall cavities. Vapor-open; typically high recycled content and low embodied energy compared with foam and many fiberglass products when sourced from real EPDs.

---

## Physical properties (real ranges only)

Use these as the **only** numeric inputs for cellulose in documentation and narrative.

| Property                  | Value (used in doc)                                                                 |
|---------------------------|-------------------------------------------------------------------------------------|
| Density                   | ~60 kg/m³ (range 50–80 kg/m³; loose-fill / dense-pack typical)                    |
| Thermal conductivity λ   | ~0.040 W/m·K (range 0.038–0.045 W/m·K for blown cellulose)                         |
| R-value per inch          | ~3.5 per inch (range 3.2–3.8 per inch for cellulose insulation)                    |
| Embodied energy per kg    | ~4.5 MJ/kg (range 4–5 MJ/kg; non-renewable + process energy)                       |
| Embodied energy per m³    | ~270 MJ/m³ (derived from 4.5 MJ/kg × 60 kg/m³; approximate)                        |
| GWP (cradle-to-gate)      | ~0.19 kg CO₂e per kg (range 0.15–0.20 kg CO₂e/kg from EPDs)                        |

---

## Notes on sources (for Steve)

- **Density and λ** — Ranges from peer-reviewed studies on loose-fill cellulose and manufacturer data.
- **R per inch** — From DOE / insulation guidance for cellulose.
- **Embodied energy** — From cellulose EPDs (non-renewable primary energy ~4–5 MJ/kg).
- **GWP** — From recent cellulose blow-in EPDs (A1–A3 ≈ 0.18–0.19 kg CO₂e/kg).

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

> **Important:** All LIS/RIS/CPI or structural properties must use real values from these or future sources. No invented numbers allowed.
