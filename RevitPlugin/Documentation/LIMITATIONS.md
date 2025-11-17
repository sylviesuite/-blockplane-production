# BlockPlane Revit Plugin - Known Limitations

**Last Updated:** 2024-01-15  
**Version:** 1.0.0

---

## 🎯 Purpose of This Document

This document honestly outlines what the BlockPlane Revit Plugin **cannot do** and where it has limitations. We believe in radical transparency - you deserve to know the boundaries of this tool before relying on it for important decisions.

---

## ⚠️ Critical Limitations

### 1. Material Matching is Probabilistic, Not Guaranteed

**What this means:**
- The plugin uses name similarity and category matching to find materials in our database
- There is **no guarantee** that the matched material is the exact one you intended
- Custom, proprietary, or regional material names may not match correctly

**Why this happens:**
- Revit materials use arbitrary names (e.g., "Custom Timber Panel XYZ")
- Our database uses industry-standard names (e.g., "Cross-Laminated Timber")
- There's no universal material naming standard

**What you should do:**
- **Always verify high-impact materials manually**
- Check the match confidence score (High/Medium/Low)
- Review the "Match Reasoning" to understand why a match was chosen
- For structural or critical materials, verify against manufacturer EPDs

**When NOT to trust automatic matching:**
- Structural materials (verify independently)
- Custom or proprietary materials
- Materials with generic names (e.g., "Material 1")
- Low confidence matches (<70%)

---

### 2. EPD Data May Be Outdated

**What this means:**
- Environmental Product Declarations (EPDs) have publication dates
- Our database may contain EPDs that are 2-5 years old
- Newer EPDs may exist that we haven't ingested yet

**Why this happens:**
- EPD databases update periodically, not in real-time
- Manufacturers publish new EPDs constantly
- We batch-update our database quarterly

**What you should do:**
- Check the EPD publication date in material details
- For critical decisions, verify against the latest manufacturer EPD
- Flag materials with EPDs >2 years old for manual verification
- Contact us to request newer EPD data: support@blockplane.com

**When NOT to trust EPD data:**
- EPDs older than 3 years (industry changes fast)
- For regulatory submissions (verify independently)
- When manufacturer has published newer EPD
- For LEED/BREEAM certification (use latest EPDs)

---

### 3. Transport Distances Use Default Assumptions

**What this means:**
- Carbon calculations include transport (A4 lifecycle stage)
- We use **default assumptions** (typically 500km) when specific data unavailable
- Actual transport distance may be significantly different

**Why this happens:**
- Revit doesn't store material source location
- Actual supply chains are complex and project-specific
- Transport data is rarely available in EPDs

**What you should do:**
- Review the "Assumptions" section in reports
- For accurate carbon accounting, input actual transport distances
- Consider regional material sourcing in your analysis
- Use our calculations as **guidance**, not absolute truth

**When NOT to trust transport calculations:**
- Imported materials (may travel 1000s of km)
- Regional projects with local sourcing
- Projects with specific supply chain requirements
- Regulatory carbon reporting (use actual data)

---

### 4. Only Embodied Carbon, Not Operational

**What this means:**
- Plugin calculates **embodied carbon** (materials, construction, end-of-life)
- Does **NOT** calculate operational carbon (heating, cooling, lighting)
- Total building carbon = Embodied + Operational

**Why this limitation exists:**
- Operational carbon requires energy modeling (different tools)
- Depends on building use, climate, systems, occupancy
- Outside the scope of material analysis

**What you should do:**
- Use this plugin for **material decisions only**
- Combine with energy modeling tools for total carbon
- Don't claim "net zero" based on materials alone
- Consider both embodied and operational in design decisions

**When this plugin is NOT sufficient:**
- Whole-building carbon assessments
- Net zero carbon claims
- Energy code compliance
- Operational carbon reduction strategies

---

### 5. Database is Not Exhaustive

**What this means:**
- Our database contains ~15,000 sustainable materials
- Many materials exist that are NOT in our database
- Particularly limited for:
  - Regional/local materials
  - Proprietary products
  - Emerging/innovative materials
  - Non-standard building materials

**Why this happens:**
- Impossible to catalog every material globally
- Focus on sustainable, EPD-documented materials
- Database grows over time through user requests

**What you should do:**
- Request missing materials: support@blockplane.com
- Use similar materials as proxies (with manual verification)
- Flag unmatched materials in your reports
- Don't assume "not in database" = "not sustainable"

**When you'll encounter gaps:**
- Innovative/emerging materials
- Regional specialty materials
- Proprietary manufacturer products
- Non-building materials (furniture, equipment)

---

### 6. Quantity Extraction Depends on BIM Quality

**What this means:**
- Plugin extracts quantities from Revit geometry
- Accuracy depends on how well your BIM model is built
- Incomplete or incorrect modeling = incorrect quantities

**Why this happens:**
- Revit elements must have proper geometry
- Material assignments must be complete
- Model must be at appropriate level of detail

**What you should do:**
- Verify quantity calculations against manual takeoffs
- Ensure materials are properly assigned in Revit
- Model to appropriate LOD for carbon analysis (LOD 300+)
- Review "Unmatched Materials" in analysis reports

**When quantities may be wrong:**
- Early-stage models (LOD 100-200)
- Elements without material assignments
- Conceptual massing models
- Incomplete or placeholder geometry

---

### 7. No Real-Time EPD Updates

**What this means:**
- EPD data is updated **quarterly**, not in real-time
- New EPDs published today won't appear immediately
- Database reflects state at last update

**Why this limitation exists:**
- EPD ingestion requires validation and quality checks
- Real-time updates would compromise data quality
- Quarterly updates balance freshness with accuracy

**What you should do:**
- Check "Last Database Update" in Settings
- For cutting-edge materials, verify EPD directly
- Request priority updates for important materials
- Subscribe to update notifications

**When to verify independently:**
- New products launched in last 3 months
- Manufacturer claims newer EPD exists
- Regulatory submissions requiring latest data
- Critical material decisions

---

### 8. Lifecycle Stages May Be Incomplete

**What this means:**
- Not all EPDs include all lifecycle stages (A1-A5, B, C1-C4)
- Some materials may only have A1-A3 (product stage)
- Missing stages shown as "Data not available"

**Why this happens:**
- EPD standards vary by region and program
- Not all manufacturers provide full lifecycle data
- Some stages are project-specific (e.g., B4 replacement)

**What you should do:**
- Check which stages are included in material details
- Use conservative assumptions for missing stages
- For whole-life carbon, supplement with industry averages
- Flag incomplete EPDs in your reports

**When this matters most:**
- Whole-life carbon assessments
- EN 15978 compliance
- Circular economy analysis
- End-of-life planning

---

## 🔍 Verification Checklist

**Before using plugin results in important decisions:**

- [ ] Verify high-confidence matches (>90%) for critical materials
- [ ] Manually verify medium/low confidence matches (<90%)
- [ ] Check EPD publication dates (flag if >2 years old)
- [ ] Review assumptions (transport, service life, etc.)
- [ ] Cross-check quantities against manual takeoffs
- [ ] Verify lifecycle stage completeness
- [ ] Check database update date
- [ ] Review "Unmatched Materials" list
- [ ] Read "Data Quality Summary" in reports
- [ ] Follow verification recommendations in reports

---

## 📊 When to Use This Plugin

**✅ Good use cases:**
- Early-stage material exploration
- Comparing alternative materials
- Identifying high-carbon materials
- Guiding sustainable material selection
- Educational purposes
- Preliminary carbon assessments

**❌ NOT suitable for:**
- Regulatory carbon reporting (without verification)
- LEED/BREEAM submissions (verify independently)
- Legal/contractual carbon claims
- Whole-building net zero claims
- Replacing professional carbon consultants
- Final carbon accounting (use as guidance)

---

## 🤝 Our Commitment

**We commit to:**
- ✅ Honest communication about limitations
- ✅ Transparent data sources and assumptions
- ✅ Clear confidence indicators on all matches
- ✅ Regular database updates (quarterly minimum)
- ✅ Responsive support for verification questions
- ✅ Continuous improvement based on user feedback

**We will NEVER:**
- ❌ Claim 100% accuracy
- ❌ Hide limitations or uncertainties
- ❌ Overstate plugin capabilities
- ❌ Guarantee regulatory compliance
- ❌ Replace professional judgment with automation

---

## 📞 Questions or Concerns?

**If you're unsure whether to trust a result:**
- Email us: support@blockplane.com
- Include the material name and match confidence
- We'll help you verify

**If you find an error:**
- Report it: feedback@blockplane.com
- We want to know! Honesty includes admitting mistakes.

**If you need a material added:**
- Request it: support@blockplane.com
- Include EPD link if available
- We prioritize user-requested materials

---

## 📚 Related Documentation

- [Verification Guide](VERIFICATION_GUIDE.md) - How to verify our data
- [Methodology](METHODOLOGY.md) - How we calculate carbon
- [User Guide](UserGuide/USER_GUIDE.md) - How to use the plugin
- [FAQ](FAQ.md) - Common questions

---

**Remember: This plugin is a guidance tool, not a replacement for professional judgment. When in doubt, verify independently.** ✨

