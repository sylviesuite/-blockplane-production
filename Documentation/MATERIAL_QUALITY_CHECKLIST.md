# Material quality checklist (internal)

Use this checklist to decide when a material is **ready to ship**. The bar matches the quality of the five materials that already ship in the app. If any item fails, the material stays in a future batch.

---

## A. Data integrity

- [ ] **LIS, RIS, CPI** are present and consistent (no missing or obviously wrong values).
- [ ] **Units** are correct and non-confusing (e.g. m², m³, per functional unit — no “per kg” where it would mislead).
- [ ] **Lifecycle phases** are populated (A1–A3, A4, A5, B, C1–C4), even if simplified or partially estimated.

---

## B. InsightBox v2

- [ ] **InsightBox v2** exists for this material (mapping and content in place).
- [ ] **Tone** is calm and builder-practical; no fluff or marketing speak.
- [ ] **Content** explains *why the choice matters* (trade-offs, context, implications), not only what the material is.

---

## C. Comparison readiness

- [ ] **At least one meaningful alternative** is identified and wired (for comparisons and “better alternatives”).
- [ ] **CPI comparison** is not obviously misleading or broken (cost vs. impact makes sense for the use case).

---

## D. UI sanity

- [ ] **Charts** render correctly (no NaN, no extreme or nonsensical values).
- [ ] **Explorer → detail** works: clicking the material in the Materials Explorer opens the detail page and shows the right data.

---

If any checklist item fails, this material waits for a future batch. We do not ship partial or placeholder materials.
