# BlockPlane Revit Plugin - Data Verification Guide

**Last Updated:** 2024-01-15  
**Version:** 1.0.0

---

## 🎯 Purpose

This guide explains **how to verify** the data and recommendations provided by the BlockPlane Revit Plugin. Use this when making critical decisions or preparing regulatory submissions.

**Key principle: Trust, but verify.** Our plugin provides guidance, but you should independently verify results for important decisions.

---

## 📋 Quick Verification Checklist

**For every analysis, verify:**

1. **Match Confidence** - Are matches high confidence (>90%)?
2. **EPD Freshness** - Are EPDs recent (<2 years old)?
3. **Quantity Accuracy** - Do quantities match manual takeoffs?
4. **Assumptions** - Are default assumptions appropriate for your project?
5. **Lifecycle Completeness** - Are all required stages included?

---

## 🔍 Step-by-Step Verification Process

### Step 1: Review Data Quality Summary

**Where to find it:**
- PDF Report: "Data Quality & Confidence" section
- CSV Export: "Data Quality Summary" rows

**What to check:**
```
Overall Confidence: 78.2%
- High confidence: 30 materials (67%)
- Medium confidence: 12 materials (27%)
- Low confidence: 2 materials (4%)
- Unmatched: 1 material (2%)
```

**Red flags:**
- Overall confidence <70%
- More than 10% low confidence materials
- Any unmatched high-impact materials

**Action:**
- If overall confidence >80%: Spot-check high-impact materials
- If 70-80%: Verify all medium/low confidence materials
- If <70%: Consider manual material selection

---

### Step 2: Verify High-Impact Materials

**Identify high-impact materials:**
- Top 10 carbon contributors (in PDF report)
- Materials representing >5% of total carbon
- Structural materials (regardless of carbon impact)

**For each high-impact material:**

#### A. Check Match Confidence

**In Material Details window:**
```
Match Confidence: High (92%)
Match Score: 92/100

Match Reasoning:
- Name similarity: 87%
  Revit: 'CLT Panel - Structural'
  BlockPlane: 'Cross-Laminated Timber (CLT)'
- Category: Match (Timber)
- Revit Material Class: Wood
```

**Verification steps:**
1. Read the match reasoning
2. Confirm the BlockPlane material makes sense
3. Check if Revit name and BlockPlane name align
4. Verify category is correct

**When to manually verify:**
- Match score <90%
- Name similarity <80%
- Category mismatch
- Structural or critical materials

#### B. Verify EPD Data

**In Material Details window:**
```
EPD Information:
- Source: Manufacturer EPD (StructureCraft)
- Publication Date: 2022-03-15
- Age: 1.8 years
- Standard: EN 15804+A2
```

**Verification steps:**
1. **Check EPD age**: <2 years = good, >3 years = verify
2. **Verify EPD source**: Manufacturer > Industry Average > Generic
3. **Cross-check EPD**: Search manufacturer website for newer EPD
4. **Compare values**: Do carbon values seem reasonable?

**How to find original EPD:**
- Google: "[Material name] EPD [Manufacturer]"
- Check manufacturer website technical documents
- Search EPD databases:
  - [Ökobaudat](https://www.oekobaudat.de/) (Germany)
  - [EPD Hub](https://www.epd-hub.com/) (International)
  - [EC3](https://buildingtransparency.org/) (North America)

**What to verify in EPD:**
- GWP (Global Warming Potential) values match
- Lifecycle stages included (A1-A5, B, C1-C4)
- Functional unit (per m³, m², kg, etc.)
- Geographic validity (region)

#### C. Verify Quantities

**In Element Details (CSV export):**
```
Element ID: 12345
Type: Wall
Material: CLT Panel
Quantity: 125.5 m³
```

**Verification steps:**
1. **Manual spot-check**: Select 5-10 elements in Revit
2. **Check element properties**: Verify material assignment
3. **Calculate quantity**: Use Revit schedules or manual calculation
4. **Compare**: Plugin quantity vs. manual calculation

**Acceptable variance:**
- ±5%: Good
- ±10%: Acceptable for early-stage
- >10%: Investigate discrepancy

**Common quantity issues:**
- Elements without material assignments (counted as zero)
- Incorrect material assignments in Revit
- Incomplete geometry (early-stage models)
- Nested families not extracted

---

### Step 3: Verify Assumptions

**Where to find assumptions:**
- PDF Report: "Methodology & Limitations" section
- Material Details: "Assumptions" field

**Common assumptions to verify:**

#### Transport Distance (A4 Stage)
**Default assumption:** 500km

**How to verify:**
1. Identify actual material source location
2. Calculate distance to project site
3. If significantly different (>200km variance), adjust manually

**When this matters:**
- Imported materials (may be 1000s of km)
- Local sourcing initiatives
- Carbon offset calculations
- LEED Material Sourcing credits

#### Service Life (B Stage)
**Default assumption:** 50 years (varies by material)

**How to verify:**
1. Check material technical specifications
2. Review project design life
3. Consider maintenance and replacement schedules

**When this matters:**
- Whole-life carbon assessments
- Circular economy analysis
- Long-life buildings (>50 years)
- Materials with known shorter life (<25 years)

#### End-of-Life Scenarios (C Stages)
**Default assumption:** Varies by material (landfill, recycling, reuse)

**How to verify:**
1. Check local waste management practices
2. Review project end-of-life strategy
3. Consider circular economy goals

**When this matters:**
- Circular economy commitments
- Waste reduction targets
- Deconstruction vs. demolition
- Material reuse strategies

---

### Step 4: Cross-Check Carbon Values

**Sanity check carbon values:**

**Typical ranges (kg CO₂e per functional unit):**
- **Timber (CLT, Glulam)**: -100 to 300 kg/m³ (can be negative due to carbon storage)
- **Concrete (Standard)**: 200-400 kg/m³
- **Concrete (Low-carbon)**: 100-250 kg/m³
- **Steel (Virgin)**: 1,800-2,500 kg/tonne
- **Steel (Recycled)**: 500-1,200 kg/tonne
- **Aluminum (Virgin)**: 8,000-12,000 kg/tonne
- **Aluminum (Recycled)**: 500-800 kg/tonne
- **Brick (Clay)**: 200-300 kg/m³
- **Insulation (Mineral Wool)**: 1-3 kg/m²
- **Insulation (EPS)**: 3-6 kg/m²

**Red flags:**
- Values outside typical ranges
- Negative values for non-biogenic materials
- Extremely low values (<10% of typical)
- Extremely high values (>200% of typical)

**If values seem wrong:**
1. Check EPD source and date
2. Verify functional unit (m³ vs. m² vs. kg)
3. Check lifecycle stages included
4. Contact support: support@blockplane.com

---

### Step 5: Verify Lifecycle Stage Completeness

**Required stages depend on assessment scope:**

**For embodied carbon (cradle-to-gate):**
- A1: Raw material extraction ✅ Required
- A2: Transport to manufacturer ✅ Required
- A3: Manufacturing ✅ Required

**For embodied carbon (cradle-to-site):**
- A4: Transport to site ✅ Required
- A5: Construction/installation ✅ Required

**For whole-life carbon:**
- B1-B5: Use stage (maintenance, repair, replacement) ⚠️ Often incomplete
- C1-C4: End-of-life (deconstruction, transport, processing, disposal) ⚠️ Often incomplete

**How to check:**
```
Lifecycle Breakdown:
A1-A3 (Product): 245 kg CO₂e ✅
A4 (Transport): 12 kg CO₂e ✅
A5 (Construction): 8 kg CO₂e ✅
B (Use): Data not available ⚠️
C1-C4 (End-of-life): 5 kg CO₂e ✅
```

**If stages are missing:**
1. Check if EPD includes those stages
2. Use industry averages for missing stages (with disclaimer)
3. Flag as limitation in your report
4. Consider conservative assumptions

---

## 🎯 Verification for Specific Use Cases

### For LEED/BREEAM Certification

**Additional verification required:**
1. ✅ Verify EPDs are third-party verified
2. ✅ Check EPD program compliance (ISO 14025, EN 15804)
3. ✅ Verify geographic validity (EPD region matches project)
4. ✅ Confirm EPD is current (<5 years for LEED)
5. ✅ Document all assumptions and data sources
6. ✅ Have verification reviewed by LEED/BREEAM consultant

**Don't rely solely on plugin for:**
- Material Sourcing credits (verify distances)
- EPD documentation requirements
- Regional material requirements
- Certification-specific calculations

### For Regulatory Carbon Reporting

**Additional verification required:**
1. ✅ Verify methodology matches regulatory requirements
2. ✅ Check if default assumptions are acceptable
3. ✅ Confirm lifecycle stages match reporting scope
4. ✅ Verify data sources are approved by regulator
5. ✅ Document all deviations from defaults
6. ✅ Have calculations reviewed by carbon consultant

**Regulations may require:**
- Specific EPD programs or databases
- Particular lifecycle stages
- Regional or national carbon factors
- Third-party verification

### For Client Reporting

**Additional verification required:**
1. ✅ Verify match confidence for all materials
2. ✅ Check EPD dates are acceptable to client
3. ✅ Confirm assumptions align with project requirements
4. ✅ Review "Data Quality Summary" with client
5. ✅ Explain limitations and uncertainties
6. ✅ Provide verification documentation

**Include in client reports:**
- Data quality summary
- Verification notes for high-impact materials
- Assumptions and limitations
- Recommendations for further verification

---

## 📊 Documentation Best Practices

**For every verified analysis, document:**

1. **Verification Date**: When verification was performed
2. **Verified By**: Who performed verification
3. **Materials Verified**: List of manually verified materials
4. **EPD Sources**: Links to original EPDs
5. **Assumptions Confirmed**: Which defaults were verified/adjusted
6. **Deviations**: Any changes from plugin recommendations
7. **Confidence Assessment**: Overall confidence in results
8. **Limitations**: Known limitations for this specific analysis

**Example verification note:**
```
Verification performed: 2024-01-15
Verified by: Jane Smith, Sustainability Consultant

High-impact materials verified:
- CLT Panels: Manufacturer EPD verified (StructureCraft, 2022)
- Structural Steel: Industry average EPD, conservative estimate
- Concrete: Regional EPD verified (Local Supplier, 2023)

Assumptions adjusted:
- Transport distance: Changed from 500km to 150km (local sourcing)
- Service life: Confirmed 50 years appropriate for project

Overall confidence: High (verified materials = 85% of total carbon)

Limitations:
- B-stage data not available for 3 materials (flagged in report)
- Used industry average for 2 specialty materials (low impact)
```

---

## 🚨 When to Seek Expert Help

**Consult a carbon/sustainability expert if:**

- Overall confidence <70%
- High-impact materials have low confidence matches
- Regulatory submission required
- Client requires third-party verification
- Unusual materials or construction methods
- Whole-life carbon assessment needed
- Carbon offsetting calculations required
- Results seem inconsistent or unreasonable

**We can help:**
- Email: support@blockplane.com
- Include: Project name, material list, specific questions
- We'll review and provide guidance (usually within 48 hours)

---

## ✅ Verification Checklist Template

**Copy this checklist for each analysis:**

```
□ Reviewed Data Quality Summary
  - Overall confidence: ____%
  - High confidence materials: ____%
  - Action required: Yes / No

□ Verified high-impact materials (top 10)
  1. Material: ________ | Confidence: ___% | EPD verified: Y/N
  2. Material: ________ | Confidence: ___% | EPD verified: Y/N
  3. Material: ________ | Confidence: ___% | EPD verified: Y/N
  ... (continue for all top 10)

□ Verified quantities
  - Spot-checked elements: ___ (minimum 10)
  - Variance: ±___% (acceptable if <10%)
  - Issues found: Yes / No

□ Verified assumptions
  - Transport distance: Default / Adjusted to ___km
  - Service life: Default / Adjusted to ___years
  - End-of-life: Default / Adjusted to ________

□ Cross-checked carbon values
  - Values within typical ranges: Yes / No
  - Outliers investigated: Yes / No / N/A

□ Verified lifecycle completeness
  - A1-A3: Complete / Incomplete
  - A4-A5: Complete / Incomplete
  - B: Complete / Incomplete / Not required
  - C1-C4: Complete / Incomplete / Not required

□ Documentation prepared
  - Verification notes: Yes / No
  - EPD sources documented: Yes / No
  - Limitations documented: Yes / No

Verified by: ________________
Date: ________________
Overall confidence: High / Medium / Low
```

---

## 📞 Support

**Questions about verification?**
- Email: support@blockplane.com
- Include: Material name, match confidence, specific concern
- Response time: Usually within 48 hours

**Found an error?**
- Email: feedback@blockplane.com
- We want to know! Include details so we can investigate.

---

**Remember: Verification is not optional for critical decisions. Trust our plugin as a starting point, but always verify independently for important work.** ✨

