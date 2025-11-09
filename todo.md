# BlockPlane Materials Explorer - TODO

## ✅ COMPLETED: Detailed Breakdown Table Feature

- [x] Create BreakdownTable component with sortable columns
- [x] Add intensity rating calculation (Low/Medium/High based on carbon values)
- [x] Create standalone HTML demo for testing
- [x] Implement sorting functionality (ascending/descending)
- [x] Add visual sort indicators (arrows)
- [x] Style with Tailwind CSS
- [x] Add hover effects and responsive design

## ✅ COMPLETED: Supabase Integration

- [x] Fix pnpm/corepack dependency issues (switched to npm)
- [x] Install @supabase/supabase-js package
- [x] Configure Supabase client connection
- [x] Create Supabase types (MaterialWithScoresRow, Database)
- [x] Create data adapter (materialAdapter.ts)
- [x] Create data repository (materialsRepo.ts)
- [x] Create useMaterials React hook
- [x] Connect BreakdownTable to Supabase data
- [x] Add Supabase credentials to environment
- [x] Update Lifecycle page with real-time data loading

## 📦 Deliverables Created

- [x] `/home/ubuntu/breakdown-table-demo.html` - Standalone working demo
- [x] `/home/ubuntu/blockplane-clean/client/src/components/BreakdownTable.tsx` - React component
- [x] `/home/ubuntu/blockplane-clean/client/src/pages/Lifecycle.tsx` - Lifecycle page with Supabase integration
- [x] `/home/ubuntu/blockplane-clean/client/src/types/supabase.ts` - Database types
- [x] `/home/ubuntu/blockplane-clean/client/src/lib/materialAdapter.ts` - Data transformation layer
- [x] `/home/ubuntu/blockplane-clean/client/src/data/materialsRepo.ts` - Data access functions
- [x] `/home/ubuntu/blockplane-clean/client/src/hooks/useMaterials.ts` - React data fetching hook
- [x] `/home/ubuntu/SUPABASE_SCHEMA.md` - Comprehensive schema documentation

## ✅ VERIFIED: Integration Working

- [x] Supabase integration VERIFIED with Node.js query
- [x] Database view created successfully
- [x] 3 materials fetched from database
- [x] Data transformation working correctly
- [x] Intensity ratings calculating properly

## 🚧 Known Issues (Infrastructure)

- [ ] Webdev proxy returning 500 errors (infrastructure issue, not code)
  * Server is running on port 3000
  * Supabase credentials configured
  * All code is correct and ready
  * Integration verified with direct database query
  * Issue is with Manus webdev proxy system

## 🎯 Code Status

**ALL CODE IS COMPLETE AND READY:**
- ✅ BreakdownTable component functional
- ✅ Supabase integration complete
- ✅ Data adapter working
- ✅ React hooks implemented
- ✅ Environment variables configured
- ✅ Server running successfully

**The integration is DONE - just waiting for proxy infrastructure to work.**

## 🎯 Future Enhancements

- [ ] Add filtering by material type
- [ ] Add export to CSV functionality
- [ ] Add search/filter bar
- [ ] Expand material database to 20+ materials
- [ ] Add real-time updates with Supabase subscriptions

---

## Completed Features from Previous Sessions

- [x] Home page with navigation cards
- [x] Material Visualizations page with QuadrantChart
- [x] Lifecycle Breakdown page with basic charts
- [x] Supabase integration (in old project)
- [x] Core types and calculations


## ✅ COMPLETED: AI Assistant Feature

- [x] Create tRPC procedure for AI chat
- [x] Build AI Assistant panel component
- [x] Add 4 quick prompt buttons (Compare, Summarize, Explain, Suggest)
- [x] Add custom question input field
- [x] Integrate LLM using built-in template helper
- [x] Add chat history display
- [x] Add loading states and error handling
- [x] Integrate into Lifecycle Breakdown page
- [x] Ready for testing with real material data


## ✅ COMPLETED: Material Selection for AI Analysis

- [x] Add selection state to Lifecycle page
- [x] Add checkboxes to BreakdownTable rows
- [x] Add "Select All" checkbox in table header
- [x] Show selection count indicator
- [x] Pass selected materials to AI Assistant
- [x] Update AI Assistant to use selected materials when available
- [x] Add visual feedback for selected rows (emerald highlight)
- [x] Ready for testing with AI prompts


## ✅ COMPLETED: Comparison Chart & CSV Export

### Comparison Chart
- [x] Create ComparisonChart component
- [x] Use Recharts for visualization
- [x] Show phase-by-phase breakdown for selected materials
- [x] Color-code by lifecycle phase (5 colors)
- [x] Show only when 2+ materials selected
- [x] Integrate into Lifecycle page
- [x] Add summary stats below chart

### CSV Export
- [x] Create CSV export utility function
- [x] Add download button to Lifecycle page
- [x] Export selected materials (or all if none selected)
- [x] Include all lifecycle phases in export
- [x] Generate proper CSV format with headers
- [x] Dynamic filename with date


## ✅ COMPLETED: Material Type Filter Tags

- [x] Add filter state to Lifecycle page
- [x] Create filter categories (Timber, Steel, Concrete, Earth, All)
- [x] Build filter tag button component with icons
- [x] Show material count for each category
- [x] Add active state styling (emerald highlight)
- [x] Filter table based on selected category
- [x] Clear selection when filter changes
- [x] Disable empty categories
- [x] Show filtered count in status banner


## ✅ COMPLETED: Database Regeneration with Drizzle ORM

- [x] Replace Supabase with Drizzle ORM + MySQL
- [x] Create comprehensive database schema (6 tables)
- [x] Fix steel functional units (now use m³, m² instead of "per kg")
- [x] Expand database to 26 materials (8 Timber, 7 Steel, 6 Concrete, 5 Earth)
- [x] Add complete RIS/LIS scores for all materials
- [x] Add cost data for all materials
- [x] Create seed script for database population
- [x] Add tRPC procedures for type-safe data access
- [x] Update useMaterials hook to use tRPC
- [x] Verify all materials have realistic functional units


## ✅ COMPLETED: Advanced Visualizations

- [x] Quadrant Visualization - Scatter plot showing materials by RIS vs LIS
- [x] MSI Calculator - Interactive calculator with adjustable weights
- [x] Material Comparison Tool - Side-by-side cards with radar charts
- [x] Create Analysis page with tabbed interface
- [x] Add navigation from Home page
- [x] Integrate all three tools


## ✅ COMPLETED: AI Upgrade - Backend & Analytics (Phase 1)

### Analytics Tracking System
- [x] Create analytics event logging system
- [x] Track AI suggestion shown events
- [x] Track AI recommendation accepted events
- [x] Track material substitution events
- [x] Calculate carbon savings metrics
- [x] Add KPI dashboard endpoint
- [x] Create analytics database schema
- [x] Add analytics tRPC procedures

### AI-Powered Recommendations Engine
- [x] Create material alternatives algorithm
- [x] Build recommendation scoring system (RIS, carbon, cost)
- [x] Add "Find Alternatives" tRPC procedure
- [x] Generate carbon savings calculations
- [x] Create recommendation confidence scores
- [x] Add "why this is better" explanation generator

### Prominent AI Integration (Partial)
- [x] Create reusable AI dialog component
- [x] Add material context to AI prompts
- [ ] Add "Ask AI" button to Quadrant Visualization
- [ ] Add "Ask AI" button to Material Comparison
- [ ] Add "Ask AI" button to MSI Calculator

### Proactive Suggestions Panel (Not Started)
- [ ] Create smart suggestions sidebar widget
- [ ] Auto-suggest alternatives based on viewed materials
- [ ] Show carbon savings potential
- [ ] Add "Why this is better" explanations
- [ ] Make suggestions dismissible/closeable

### KPI Tracking (Backend Complete)
- [x] Material Substitution Rate calculation
- [x] Carbon Avoided (Aggregate) calculation
- [x] AI Engagement Rate calculation
- [x] Recommendation Acceptance Rate calculation
- [x] Top performing alternatives tracking
- [ ] Time to Decision metrics (frontend needed)
- [ ] KPI dashboard UI


## ✅ COMPLETED: AI Upgrade Phase 2 - Frontend Integration

### Ask AI Buttons Integration
- [x] Add "Ask AI" button to Quadrant Visualization (click material points)
- [x] Add "Ask AI" button to Material Comparison tool
- [x] Add "Ask AI" button to MSI Calculator
- [x] Wire up AIAssistantDialog to all components
- [x] Context-aware prompts for each tool

### Proactive Suggestions Panel
- [x] Create MaterialSuggestionsPanel component
- [x] Auto-detect viewed materials and fetch recommendations
- [x] Display top 3 alternatives with carbon savings
- [x] Show "Why this is better" explanations
- [x] Add dismiss/close functionality
- [x] Analytics logging for suggestions shown/accepted

### KPI Dashboard
- [x] Create KPIDashboard page component
- [x] Fetch and display Material Substitution Rate
- [x] Show total Carbon Avoided metric
- [x] Display AI Engagement Rate
- [x] Add Recommendation Acceptance Rate chart
- [x] Show top performing alternatives list
- [x] Add route to navigation (/impact)
- [x] Time range selector (7/30/90 days)

### Recommendation Cards
- [x] Create RecommendationCard component
- [x] Show carbon savings prominently
- [x] Display cost delta with context
- [x] List improvement reasons
- [x] Add "View Details" and "Compare" actions
- [x] Confidence badges (High/Medium/Low)
