# exterior-mineral-wool-board — Elevation TODOs

Scaffold to bring this material to the same READY standard as hempcrete (documentation-only; no proxy data). All numeric values below must come from real sources, not AI inference.

---

## 1. Basic physical properties (for future schema fields)

- Density: **≈140 kg/m³** (typical range ~120–160 kg/m³ for façade boards)
- Thermal conductivity λ: **≈0.038 W/m·K** (typical range ~0.035–0.045 W/m·K)
- Nominal R-value: **≈R-4.2 per inch** (range ~R-4.0–4.3 per inch for rigid façade boards)

_Note: These are orientation values only. Actual design R-values will depend on product, thickness, and installation quality._

---

## 2. Embodied energy & carbon (documentation only, no schema fields yet)

- Embodied energy per kg: **≈5 MJ/kg** (range ~4–7 MJ/kg from LCA literature)
- Embodied energy per m³: **≈700 MJ/m³** (using 140 kg/m³ × 5 MJ/kg)
- Carbon profile: mineral-based product with **moderate manufacturing energy** but no petrochemical blowing agents; often lower GWP than XPS/polyiso in LCAs when thickness is matched for R-value.

_All figures above are approximate documentation ranges only; they are NOT yet wired into BlockPlane's scoring engine._

---

## 3. Performance notes (for future InsightBox v2 use)

- **Moisture & drying:**
  - Vapor-open, drainable, and tolerant of intermittent wetting when detailed correctly.
  - Helps keep sheathing warmer and promotes outward drying compared with cavity-only insulation.
- **Fire:**
  - Non-combustible, often used as a fire-blocking and façade fire-safety layer.
- **Acoustic:**
  - Good sound-attenuation properties due to fibrous structure.
- **Practical watch-points:**
  - Requires robust cladding attachment strategy (screws/rails/straps) through the insulation.
  - Compression under fasteners can create local thermal bridges if not detailed well.
  - Wind-washing and open joints can reduce real-world performance if not properly sealed and backed.

---

## 4. Gold InsightBox alignment

- Cross-check that the existing Gold cards for mineral wool vs rigid foam and mineral wool vs other insulations:
  - Reflect the density, λ, and R-per-inch values above.
  - Clearly describe mineral wool as:
    - Non-combustible, vapor-open, and resilient under high temperatures.
    - Typically lower GWP than XPS and, in many LCAs, competitive with or better than polyiso when thickness is matched *for the same R-value*.
  - Emphasize field realities:
    - Needs good fastening layout to control deflection.
    - Thickness choices are usually driven by *code-min* vs *high-performance* wall targets.

---

> **No LIS/RIS/CPI values or physical properties are added to the code in this step. Any future numeric fields must be wired into the schema explicitly.**
