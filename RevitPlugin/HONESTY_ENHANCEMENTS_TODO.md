# BlockPlane Revit Plugin - Honesty Enhancements TODO

## Goal
Inject radical honesty and transparency throughout the entire plugin - in code, UI, reports, documentation, and user experience.

## Phase 1: Data Models ✅ COMPLETE
- [x] Add ConfidenceLevel enum (High/Medium/Low/None)
- [x] Add DataQuality class with source, date, limitations
- [x] Enhance Material model with transparency fields
- [x] Add MatchMethod and EpdDataSource enums
- [x] Add DataQualitySummary class for project-wide metrics
- [x] Add VerificationNote class for recommendations
- [x] Enhance MaterialComparison with confidence and warnings

## Phase 2: Service Layer ✅ COMPLETE
- [x] MaterialMapper: Track match method and reasoning
- [x] MaterialMapper: Generate match reasoning explanations
- [x] MaterialMapper: Add verification recommendations
- [x] ProjectAnalyzer: Generate comprehensive data quality summary
- [x] ProjectAnalyzer: Create verification notes for high-impact materials
- [x] ProjectAnalysis model: Add DataQualitySummary property
- [x] ProjectAnalysis model: Add OverallConfidencePercent calculation

## Phase 3: UI Windows
- [ ] MaterialBrowserWindow: Add confidence badges, data age indicators
- [ ] MaterialDetailWindow: Add data quality section, assumptions, verify button
- [ ] MaterialAlternativesWindow: Add match confidence, risk flags, disclaimers
- [ ] CalculatorCommand: Add confidence summary, limitations, export for verification
- [ ] SettingsWindow: Add honesty settings section
- [ ] Add HonestyIndicator user control (reusable component)

## Phase 4: Reports ✅ COMPLETE
- [x] PDF: Add mandatory "Data Quality & Confidence" section
- [x] PDF: Add "Methodology & Limitations" section with 8 limitations
- [x] PDF: Add verification recommendations with priority levels
- [x] PDF: Add legal disclaimer and contact info
- [x] PDF: Color-coded confidence breakdown table
- [x] PDF: Stale EPD warnings
- [x] CSV: Add confidence %, EPD date, data age, verification needed columns
- [x] CSV: Add data quality summary section
- [x] All reports: Include comprehensive honesty signals

## Phase 5: Error Handling ✅ COMPLETE
- [x] Enhanced BlockPlaneException with WhyThisHappened, WhatYouCanDo, Context properties
- [x] Added ToDetailedReport() method for comprehensive error reporting
- [x] Enhanced ApiException with transparent troubleshooting guidance
- [x] Enhanced MaterialMatchException with match details and recommendations
- [x] Updated ErrorHandler with ShowEnhancedErrorDialog() method
- [x] Added BuildEnhancedErrorContent() and BuildExpandedContent() methods
- [x] Transparent error messages with "Why" and "What to do" sections
- [x] Technical details in expandable section

## Phase 6: Documentation
- [ ] User Guide: Add "When NOT to Use This Plugin" section
- [ ] User Guide: Add "How to Verify Our Data" guide
- [ ] User Guide: Add "Common Mistakes" section
- [ ] Developer Guide: Add "Architectural Trade-offs" section
- [ ] Developer Guide: Add "Known Technical Limitations" section
- [ ] Create "Methodology Transparency" document
- [ ] Create "Data Sources Attribution" guide
- [ ] Create "Verification Checklist" for users

## Phase 7: Marketing & Communication
- [ ] Create honest landing page copy
- [ ] Create "Known Limitations" page
- [ ] Create "How It Works" transparency page
- [ ] Create honest feature descriptions
- [ ] Create honest testimonials template
- [ ] Create "Honesty First" manifesto
- [ ] Update installer welcome message with honest expectations

## Testing
- [ ] Add tests for confidence level calculations
- [ ] Add tests for data quality tracking
- [ ] Add tests for honesty signals in UI
- [ ] Add tests for mandatory report sections
- [ ] Add tests for transparent error messages

## Code Quality
- [ ] Add XML documentation comments about limitations
- [ ] Add inline comments explaining trade-offs
- [ ] Add TODO comments for known issues
- [ ] Update all method summaries with honesty notes

---

**Status**: Ready to begin Phase 1
**Priority**: High - Core to product value proposition
**Timeline**: Systematic implementation across all phases
