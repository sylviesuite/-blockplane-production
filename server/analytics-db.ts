/**
 * Analytics Database Functions
 * 
 * Functions for logging events and calculating KPIs
 */

import { getDb } from "./db";
import { analyticsEvents, type InsertAnalyticsEvent } from "../drizzle/schema";
import { sql, and, gte, count, avg } from "drizzle-orm";

/**
 * Log an analytics event
 */
export async function logAnalyticsEvent(event: InsertAnalyticsEvent) {
  const db = await getDb();
  if (!db) {
    console.warn("[Analytics] Cannot log event: database not available");
    return null;
  }

  try {
    const result = await db.insert(analyticsEvents).values(event);
    return result;
  } catch (error) {
    console.error("[Analytics] Failed to log event:", error);
    return null;
  }
}

/**
 * Get KPI metrics for a time period
 */
export async function getKPIMetrics(daysAgo: number = 30) {
  const db = await getDb();
  if (!db) {
    console.warn("[Analytics] Cannot get KPIs: database not available");
    return null;
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

  try {
    // Get all events in time period
    const events = await db
      .select()
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, cutoffDate));

    // Calculate metrics
    const totalSessions = new Set(events.map(e => e.sessionId)).size;
    const sessionsWithAI = new Set(
      events
        .filter(e => 
          e.eventType === 'ai_suggestion_shown' || 
          e.eventType === 'ai_conversation'
        )
        .map(e => e.sessionId)
    ).size;

    const substitutions = events.filter(e => e.eventType === 'material_substitution');
    const recommendations = events.filter(e => e.eventType === 'ai_recommendation_accepted');
    const suggestions = events.filter(e => e.eventType === 'ai_suggestion_shown');

    const totalCarbonSaved = substitutions.reduce((sum, e) => {
      return sum + (parseFloat(e.carbonSaved || '0'));
    }, 0);

    const conversations = events.filter(e => e.eventType === 'ai_conversation');
    const avgConversationDepth = conversations.length > 0
      ? conversations.reduce((sum, e) => {
          const metadata = e.metadata ? JSON.parse(e.metadata) : {};
          return sum + (metadata.messageCount || 0);
        }, 0) / conversations.length
      : 0;

    return {
      // Primary KPIs
      materialSubstitutionRate: totalSessions > 0 
        ? (substitutions.length / totalSessions) * 100 
        : 0,
      carbonAvoided: totalCarbonSaved,
      aiEngagementRate: totalSessions > 0 
        ? (sessionsWithAI / totalSessions) * 100 
        : 0,

      // Secondary KPIs
      avgConversationDepth,
      recommendationAcceptanceRate: suggestions.length > 0
        ? (recommendations.length / suggestions.length) * 100
        : 0,
      avgTimeToDecision: 0, // TODO: Calculate from session duration

      // Aggregate stats
      totalSessions,
      sessionsWithAI,
      totalSubstitutions: substitutions.length,
      totalRecommendations: recommendations.length,
      totalSuggestions: suggestions.length,
    };
  } catch (error) {
    console.error("[Analytics] Failed to calculate KPIs:", error);
    return null;
  }
}

/**
 * Get top performing material alternatives
 */
export async function getTopAlternatives(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    const alternatives = await db
      .select({
        alternativeMaterialName: analyticsEvents.alternativeMaterialName,
        alternativeMaterialId: analyticsEvents.alternativeMaterialId,
        totalCarbonSaved: sql<number>`SUM(${analyticsEvents.carbonSaved})`,
        adoptionCount: count(),
      })
      .from(analyticsEvents)
      .where(
        and(
          sql`${analyticsEvents.eventType} = 'ai_recommendation_accepted'`,
          sql`${analyticsEvents.alternativeMaterialName} IS NOT NULL`
        )
      )
      .groupBy(analyticsEvents.alternativeMaterialId, analyticsEvents.alternativeMaterialName)
      .orderBy(sql`totalCarbonSaved DESC`)
      .limit(limit);

    return alternatives;
  } catch (error) {
    console.error("[Analytics] Failed to get top alternatives:", error);
    return [];
  }
}
