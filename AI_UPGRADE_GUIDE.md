# BlockPlane AI Upgrade - Implementation Guide

## 🎯 Overview

This document describes the AI-powered recommendations system and analytics tracking built into BlockPlane Materials Explorer.

---

## ✅ Phase 1: Backend & Analytics (COMPLETE)

### **Analytics Tracking System**

**Database Schema** (`drizzle/schema.ts`):
- `analyticsEvents` table tracks all AI interactions
- Event types: `ai_suggestion_shown`, `ai_recommendation_accepted`, `material_substitution`, `ai_conversation`, `material_viewed`
- Captures: material IDs, carbon savings, cost deltas, RIS improvements, context

**KPI Calculations** (`server/analytics-db.ts`):
- **Material Substitution Rate**: % of users who switch materials after AI recommendation
- **Carbon Avoided**: Total kg CO₂e saved through substitutions
- **AI Engagement Rate**: % of sessions with AI interaction
- **Recommendation Acceptance Rate**: % of suggestions that users explore
- **Top Alternatives**: Most frequently adopted materials

**tRPC API Endpoints** (`server/routers.ts`):
```typescript
// Log an analytics event
trpc.analytics.logEvent.useMutation()

// Get KPI metrics
trpc.analytics.getKPIs.useQuery({ daysAgo: 30 })

// Get top performing alternatives
trpc.analytics.getTopAlternatives.useQuery({ limit: 10 })
```

---

### **Material Recommendations Engine**

**Algorithm** (`server/recommendations.ts`):
- Finds better alternatives within same material category
- Scores based on:
  - **Carbon savings** (up to +30 points)
  - **RIS improvement** (up to +25 points)
  - **LIS reduction** (up to +20 points)
  - **Cost consideration** (up to ±15 points)
- Generates confidence scores (0-100)
- Provides human-readable reasons for each recommendation

**tRPC API**:
```typescript
trpc.recommendations.getAlternatives.useQuery({
  materialId: 123,
  maxResults: 5,
  prioritizeCarbon: true,
  prioritizeCost: false,
  prioritizeRIS: true,
})
```

**Response Format**:
```typescript
{
  material: Material,
  carbonSavings: number,      // kg CO₂e saved
  costDelta: number,           // $ difference
  risDelta: number,            // RIS improvement
  score: number,               // 0-100 recommendation score
  confidence: number,          // 0-100 confidence level
  reasons: string[],           // Why this is recommended
  summary: string              // One-sentence explanation
}
```

---

### **AI Assistant Dialog Component**

**Component** (`client/src/components/AIAssistantDialog.tsx`):
- Reusable dialog for AI interactions
- Material-context aware (auto-includes material name in questions)
- Quick prompts for common questions
- Conversation history with markdown rendering
- Streamdown support for formatted responses

**Usage**:
```tsx
import { AIAssistantDialog } from '@/components/AIAssistantDialog';

const [aiOpen, setAiOpen] = useState(false);
const [material, setMaterial] = useState<Material>();

<AIAssistantDialog
  open={aiOpen}
  onOpenChange={setAiOpen}
  material={material}
  context="You are viewing the Quadrant Visualization..."
  initialPrompt="What are better alternatives?"
/>
```

---

## 🚧 Phase 2: Frontend Integration (IN PROGRESS)

### **Ask AI Buttons** (Partial)

**✅ Completed:**
- Quadrant Visualization - Click any material point to open AI dialog

**⏳ To Do:**
- Material Comparison - Add "Ask AI" button to comparison tool
- MSI Calculator - Add "Ask AI" button for ranking explanations

---

### **Proactive Suggestions Panel** (NOT STARTED)

**Goal**: Auto-suggest better alternatives as users browse materials

**Component to Build** (`MaterialSuggestionsPanel.tsx`):
```tsx
// Watches viewed materials and fetches recommendations
// Shows top 3 alternatives with:
// - Carbon savings highlighted
// - Cost delta with context
// - "Why this is better" explanation
// - Quick "Compare" and "View Details" actions
```

**Integration Points**:
- Analysis page (sidebar)
- Lifecycle page (bottom panel)
- Material detail views (inline)

---

### **KPI Dashboard** (NOT STARTED)

**Goal**: Visualize the real-world impact of BlockPlane recommendations

**Page to Build** (`client/src/pages/KPIDashboard.tsx`):

**Metrics to Display**:
1. **Hero Numbers** (top cards):
   - Total Carbon Avoided (kg CO₂e)
   - Materials Substituted (count)
   - AI Engagement Rate (%)

2. **Charts**:
   - Material Substitution Rate over time (line chart)
   - Top 10 Recommended Alternatives (bar chart)
   - Carbon Savings by Category (pie chart)
   - Recommendation Acceptance Rate (gauge)

3. **Leaderboard**:
   - Most impactful material swaps
   - Highest carbon savings per substitution
   - Most frequently recommended materials

**Data Source**:
```typescript
const { data: kpis } = trpc.analytics.getKPIs.useQuery({ daysAgo: 30 });
const { data: topAlts } = trpc.analytics.getTopAlternatives.useQuery({ limit: 10 });
```

---

### **Recommendation Cards** (NOT STARTED)

**Goal**: Show "Better alternatives" prominently on material pages

**Component to Build** (`RecommendationCard.tsx`):
```tsx
interface RecommendationCardProps {
  recommendation: MaterialRecommendation;
  onCompare: () => void;
  onViewDetails: () => void;
}

// Visual design:
// - Large carbon savings number (green if positive)
// - Cost delta with icon (↓ cheaper, ↑ more expensive)
// - Confidence badge (High/Medium/Low)
// - List of improvement reasons
// - Action buttons: "Compare" and "View Details"
```

**Integration**:
- Add to material detail pages
- Show in lifecycle breakdown view
- Display in comparison tool sidebar

---

## 📊 Analytics Event Logging (Frontend)

**Helper Functions** (`shared/analytics.ts`):
```typescript
import { getOrCreateSessionId } from '@shared/analytics';

// Log when AI shows suggestions
trpc.analytics.logEvent.mutate({
  eventType: 'ai_suggestion_shown',
  sessionId: getOrCreateSessionId(),
  materialId: material.id.toString(),
  materialName: material.name,
  metadata: JSON.stringify({
    suggestedAlternatives: recommendations.map(r => r.material.name),
    carbonSavingsPotential: totalSavings,
  }),
});

// Log when user accepts recommendation
trpc.analytics.logEvent.mutate({
  eventType: 'ai_recommendation_accepted',
  sessionId: getOrCreateSessionId(),
  materialId: original.id.toString(),
  materialName: original.name,
  alternativeMaterialId: chosen.id.toString(),
  alternativeMaterialName: chosen.name,
  carbonSaved: carbonSavings,
  costDelta: costDifference,
  risDelta: risImprovement,
  source: 'ai_suggestion',
});
```

**When to Log**:
- `material_viewed`: Every time a material card/page is opened
- `ai_suggestion_shown`: When recommendations are displayed
- `ai_recommendation_accepted`: When user clicks "View Details" or "Compare" on a recommendation
- `material_substitution`: When user confirms switching materials
- `ai_conversation`: When AI dialog closes (log message count and duration)

---

## 🎯 KPI Targets

### **Primary KPIs**:
- **Material Substitution Rate**: 30% (users who switch after AI recommendation)
- **Carbon Avoided**: 1M kg CO₂e in first 6 months
- **AI Engagement Rate**: 60% of sessions

### **Secondary KPIs**:
- **Avg Conversation Depth**: 3+ messages
- **Recommendation Acceptance Rate**: 40%
- **Time to Decision**: 30% reduction with AI

### **North Star Metric**:
- **Carbon Impact per Active User**: 500 kg CO₂e per user per month

---

## 🚀 Next Steps

### **Immediate (Phase 2 Completion)**:
1. Add "Ask AI" buttons to Material Comparison and MSI Calculator
2. Build MaterialSuggestionsPanel component
3. Create KPI Dashboard page
4. Build RecommendationCard component
5. Add analytics logging to all user interactions

### **Future Enhancements**:
1. **AI-Powered Search**: Natural language queries ("best low-carbon concrete for residential")
2. **Personalized Recommendations**: Learn user preferences over time
3. **Project-Level Analysis**: Upload BOM, get full project carbon assessment
4. **Comparison Explainer**: Auto-generate "Why A is better than B" summaries
5. **Export Reports**: PDF/PNG export of recommendations with carbon savings

---

## 📁 File Structure

```
client/src/
  components/
    AIAssistantDialog.tsx          ✅ Reusable AI dialog
    QuadrantVisualization.tsx      ✅ Updated with AI button
    MaterialComparison.tsx         ⏳ Needs AI button
    MSICalculator.tsx              ⏳ Needs AI button
    MaterialSuggestionsPanel.tsx   ❌ To be created
    RecommendationCard.tsx         ❌ To be created
  pages/
    KPIDashboard.tsx               ❌ To be created

server/
  analytics-db.ts                  ✅ KPI calculation functions
  recommendations.ts               ✅ Material alternatives algorithm
  routers.ts                       ✅ Analytics + recommendations APIs

shared/
  analytics.ts                     ✅ Type definitions and helpers

drizzle/
  schema.ts                        ✅ Analytics events table
```

---

## 🔗 API Reference

### **Analytics Endpoints**:
- `trpc.analytics.logEvent.useMutation()` - Log an event
- `trpc.analytics.getKPIs.useQuery({ daysAgo })` - Get KPI metrics
- `trpc.analytics.getTopAlternatives.useQuery({ limit })` - Top materials

### **Recommendations Endpoints**:
- `trpc.recommendations.getAlternatives.useQuery({ materialId, ... })` - Get alternatives

### **AI Endpoints** (Existing):
- `trpc.ai.ask.useMutation({ question })` - Ask AI a question

---

## 💡 Design Principles

1. **Proactive, Not Reactive**: Show suggestions before users ask
2. **Carbon-First**: Always highlight environmental impact
3. **Transparent**: Show confidence scores and reasoning
4. **Actionable**: Every recommendation has clear next steps
5. **Measurable**: Track everything for continuous improvement

---

## 🎓 Key Learnings

- **Material substitution is the killer feature** - Not just data, but actionable guidance
- **Carbon savings must be prominent** - It's the North Star metric
- **Confidence matters** - Users need to trust recommendations
- **Context is everything** - AI should know what page/tool user is in
- **Track everything** - Can't improve what you don't measure

---

**Last Updated**: 2025-01-09
**Status**: Phase 1 Complete, Phase 2 In Progress
