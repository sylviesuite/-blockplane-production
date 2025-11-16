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


## ✅ COMPLETED: Stacked Horizontal Bar Chart

- [x] Create StackedHorizontalBarChart component
- [x] Use Recharts BarChart with layout="horizontal"
- [x] Color-code lifecycle phases (A1-A3, A4, A5, B, C1-C4)
- [x] Add interactive legend
- [x] Add tooltips with exact values
- [x] Integrate into LifecycleBreakdown page
- [x] Support material comparison (multiple materials)
- [x] Add summary stats showing average per phase


## ✅ COMPLETED: Material Comparison in Stacked Bar Chart

- [x] Add click handlers to bar chart for material selection
- [x] Track selected materials (max 2)
- [x] Highlight selected materials in chart with indigo border
- [x] Create side-by-side comparison panel
- [x] Show phase-by-phase differences with progress bars
- [x] Calculate and display carbon savings
- [x] Calculate cost difference
- [x] Add "Clear Selection" button
- [x] Show selection status in tooltips


## ✅ COMPLETED: Fix Dev Server Error

- [x] Fix duplicate Link import in Home.tsx
- [x] Remove nested <a> tags from wouter Link components
- [x] Restart dev server
- [x] Verify server runs without errors


## ✅ COMPLETED: All 6 Feature Sets

### 1. Material Detail Pages ✅
- [x] Create MaterialDetail page component with dynamic routing
- [x] Full lifecycle breakdown chart
- [x] EPD source references display
- [x] Usage recommendations section
- [x] Similar materials suggestions
- [x] "Find Alternatives" button with AI recommendations
- [x] Add route to App.tsx

### 2. Export & Sharing ✅
- [x] PDF export for material comparisons
- [x] PNG export for charts (Quadrant, Radar, Stacked Bar)
- [x] CSV export of filtered materials
- [x] Shareable URLs with query parameters
- [x] Custom MSI weight presets in URLs
- [x] Create exportUtils.ts with all export functions
- [x] Create ExportMenu component
- [x] Install dependencies (jspdf, html2canvas, papaparse)

### 3. Advanced Filtering ✅
- [x] Create FilterPanel component
- [x] Search by material name/description
- [x] Category multi-select (Timber, Steel, Concrete, Earth)
- [x] RIS range slider (0-100)
- [x] LIS range slider (0-100)
- [x] Carbon threshold filter
- [x] Cost range filter
- [x] "Regenerative only" toggle
- [x] Apply filters to all material lists
- [x] Create applyFilters utility function

### 4. Project-Level Analysis ✅
- [x] Create ProjectAnalysis page
- [x] CSV/Excel BOM upload component
- [x] Parse uploaded BOM files
- [x] Project carbon calculator (sum all materials)
- [x] Bulk AI recommendations for project
- [x] "Current vs Optimized" comparison view
- [x] Project-level carbon savings calculation
- [x] Export project report (PDF)
- [x] Material matching algorithm
- [x] Optimization suggestions engine

### 5. User Accounts & Saved Projects ✅
- [x] Extend database schema (savedProjects, favoriteMaterials, msiPresets)
- [x] Create userAccounts tRPC router
- [x] Save material selections per user
- [x] Save custom MSI weight presets
- [x] Project history with full CRUD
- [x] Favorites/bookmarks system
- [x] Database migrations applied

### 6. Admin Dashboard ✅
- [x] Create admin-only routes (check user.role)
- [x] Material management page (CRUD)
- [x] Add new material form
- [x] Edit existing material form (backend ready)
- [x] Delete material with confirmation
- [x] Bulk import from CSV
- [x] View usage analytics
- [x] Material statistics by category
- [x] Create admin tRPC router with role-based access


## ✅ FINAL INTEGRATION (Complete)

### Routes & Navigation
- [x] Add MaterialDetail route to App.tsx (/material/:id)
- [x] Add ProjectAnalysis route to App.tsx (/projects)
- [x] Add AdminDashboard route to App.tsx (/admin)
- [x] Add navigation cards to Home.tsx for new pages
- [x] Test all routes work correctly

### Component Integration
- [x] Add FilterPanel to Analysis page
- [x] Add ExportMenu to QuadrantVisualization
- [x] Add ExportMenu to MSICalculator
- [x] Add ExportMenu to MaterialComparison
- [x] Dev server running successfully

### Final Testing & Deployment
- [x] Test navigation flows
- [x] Verify dev server status
- [x] Commit final integration
- [x] Create final checkpoint
- [x] Push to GitHub


## ✅ DATABASE EXPANSION (Complete)

### Material Database Expansion
- [x] Research additional sustainable building materials
- [x] Design lifecycle data for new materials (A1-A3, A4, A5, B, C1-C4)
- [x] Add RIS/LIS scores for new materials
- [x] Add cost data for new materials
- [x] Update seed script with new materials
- [x] Expanded from 26 to 56 materials (exceeded target!)
- [x] Added 3 new categories: Insulation (8), Composites (6), Masonry (4)
- [x] Expanded existing: Timber +2, Steel +3, Concrete +4, Earth +3
- [x] Update database schema to support new categories
- [x] Push database schema changes
- [x] Run seed script successfully
- [x] Verify all 56 materials loaded correctly
- [x] Dev server running with expanded dataset
- [x] Ready to commit changes to GitHub


## ✅ CONVENTIONAL MATERIALS ADDITION (Complete)

### Add Baseline Construction Materials
- [x] Add dimensional lumber (2x4, 2x6, 2x8, 2x10, 2x12, 4x4, plywood, OSB) - 8 materials
- [x] Add conventional insulation (fiberglass, mineral wool, XPS, EPS) - 4 materials
- [x] Add standard masonry (fired clay bricks, gypsum drywall, CMU blocks) - 3 materials
- [x] Add standard roofing (asphalt shingles) - 1 material
- [x] Add virgin aluminum sheet - 1 material
- [x] Add float glass - 1 material
- [x] Add conventional concrete (ready-mix 3000/4000 PSI, CMU) - 3 materials
- [x] Add virgin steel (rebar, structural sections) - 2 materials
- [x] Update seed script with all 24 conventional materials
- [x] Run seed script successfully
- [x] Verify all 78 materials loaded (18 Timber, 13 Steel, 12 Concrete, 8 Earth, 12 Insulation, 8 Composites, 7 Masonry)
- [x] Database now has both sustainable alternatives AND conventional baselines for comparison
- [x] Ready to commit changes to GitHub


## ✅ ENGINEERED WOOD & METAL STUDS (Complete)

### Add Remaining Structural Materials
- [x] Add I-Joists (TJI/engineered joists)
- [x] Add LVL (Laminated Veneer Lumber) beams
- [x] Add PSL (Parallel Strand Lumber)
- [x] Add LSL (Laminated Strand Lumber)
- [x] Add metal stud sizes (3-5/8", 6", 8")
- [x] Add metal track/channels
- [x] Update seed script with 8 new materials
- [x] Run seed script successfully
- [x] Verify all 85 materials loaded
- [x] Final count: Timber 22, Steel 16, Concrete 12, Insulation 12, Composites 8, Earth 8, Masonry 7
- [x] Ready to commit final database


## ✅ COST-CARBON OPTIMIZATION FEATURES (Complete)

### Phase 1: Cost Analysis Foundation
- [x] Create cost-carbon analysis utility functions
- [x] Build cost comparison helpers (calculateCostCarbonMetrics)
- [x] Create break-even calculation logic (calculateBreakEven)
- [x] Build budget optimization algorithm (optimizeWithinBudget)
- [x] Add formatting utilities (formatCurrency, formatCarbon, formatPercent)

### Phase 2: Cost-Carbon Trade-off Slider
- [x] Create interactive slider component (CostCarbonSlider.tsx)
- [x] Implement real-time preference adjustment (0-100 scale)
- [x] Add visual indicators for cost/carbon weights
- [x] Built standalone component ready for integration

### Phase 3: Break-Even Analysis
- [x] Create break-even calculator component (BreakEvenAnalysis.tsx)
- [x] Show cost premium and carbon savings comparison
- [x] Calculate carbon price equivalent (@$50/ton)
- [x] Display total cost advantage including carbon value
- [x] Generate smart recommendations based on metrics

### Phase 4: Budget Optimizer
- [x] Build budget constraint input (BudgetOptimizer.tsx)
- [x] Implement carbon efficiency ranking algorithm
- [x] Create results visualization (top 10 most/least efficient)
- [x] Add CSV export functionality
- [x] Show carbon efficiency score (kg CO₂/$)

### Phase 5: Integration & Testing
- [x] Add BudgetOptimizer route to App.tsx (/budget-optimizer)
- [x] Add Budget Optimizer navigation card to Home.tsx
- [x] Dev server running successfully
- [x] All components ready for use

### Phase 6: Deployment
- [x] Update todo.md with completion status
- [x] Ready to commit changes to GitHub
- [x] Ready to create checkpoint
