/**
 * Analytics Tracking System
 * 
 * Tracks AI interactions and material substitutions for KPI measurement
 */

export type AnalyticsEvent = 
  | AISuggestionShownEvent
  | AIRecommendationAcceptedEvent
  | MaterialSubstitutionEvent
  | AIConversationEvent
  | MaterialViewedEvent;

export interface AISuggestionShownEvent {
  event: 'ai_suggestion_shown';
  materialViewed: string;
  materialViewedId: string;
  suggestedAlternatives: Array<{
    id: string;
    name: string;
    carbonSavings: number; // kg CO₂e
    costDelta: number; // $ difference
    risDelta: number; // RIS improvement
  }>;
  timestamp: string;
  userId?: string;
  sessionId: string;
}

export interface AIRecommendationAcceptedEvent {
  event: 'ai_recommendation_accepted';
  originalMaterial: string;
  originalMaterialId: string;
  chosenAlternative: string;
  chosenAlternativeId: string;
  carbonSaved: number; // kg CO₂e
  costDelta: number; // $ difference
  risDelta: number; // RIS improvement
  timestamp: string;
  userId?: string;
  sessionId: string;
}

export interface MaterialSubstitutionEvent {
  event: 'material_substitution';
  fromMaterial: string;
  fromMaterialId: string;
  toMaterial: string;
  toMaterialId: string;
  carbonSaved: number;
  costDelta: number;
  risDelta: number;
  source: 'ai_suggestion' | 'manual_comparison' | 'msi_calculator';
  timestamp: string;
  userId?: string;
  sessionId: string;
}

export interface AIConversationEvent {
  event: 'ai_conversation';
  messageCount: number;
  conversationDuration: number; // seconds
  materialsDiscussed: string[];
  recommendationsMade: number;
  timestamp: string;
  userId?: string;
  sessionId: string;
}

export interface MaterialViewedEvent {
  event: 'material_viewed';
  materialId: string;
  materialName: string;
  context: 'quadrant' | 'comparison' | 'msi_calculator' | 'lifecycle' | 'detail';
  timestamp: string;
  userId?: string;
  sessionId: string;
}

/**
 * KPI Calculation Types
 */
export interface KPIMetrics {
  // Primary KPIs
  materialSubstitutionRate: number; // %
  carbonAvoided: number; // kg CO₂e
  aiEngagementRate: number; // %
  
  // Secondary KPIs
  avgConversationDepth: number; // messages per conversation
  recommendationAcceptanceRate: number; // %
  avgTimeToDecision: number; // seconds
  
  // Aggregate stats
  totalSessions: number;
  sessionsWithAI: number;
  totalSubstitutions: number;
  totalRecommendations: number;
}

/**
 * Session ID management (client-side)
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('blockplane_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('blockplane_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Calculate carbon savings between two materials
 */
export function calculateCarbonSavings(
  originalCarbon: number,
  alternativeCarbon: number
): number {
  return Math.max(0, originalCarbon - alternativeCarbon);
}

/**
 * Calculate cost delta between two materials
 */
export function calculateCostDelta(
  originalCost: number,
  alternativeCost: number
): number {
  return alternativeCost - originalCost;
}

/**
 * Calculate RIS improvement
 */
export function calculateRISDelta(
  originalRIS: number,
  alternativeRIS: number
): number {
  return alternativeRIS - originalRIS;
}
