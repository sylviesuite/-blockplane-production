/**
 * Analytics Database Schema
 * 
 * Stores AI interaction events for KPI calculation
 */

import { int, mysqlTable, text, timestamp, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

/**
 * Analytics events table
 * Stores all tracked events for KPI measurement
 */
export const analyticsEvents = mysqlTable("analyticsEvents", {
  id: int("id").autoincrement().primaryKey(),
  
  // Event identification
  eventType: mysqlEnum("eventType", [
    "ai_suggestion_shown",
    "ai_recommendation_accepted",
    "material_substitution",
    "ai_conversation",
    "material_viewed"
  ]).notNull(),
  
  // Session tracking
  sessionId: text("sessionId").notNull(),
  userId: text("userId"), // Optional, for authenticated users
  
  // Material references
  materialId: text("materialId"),
  materialName: text("materialName"),
  alternativeMaterialId: text("alternativeMaterialId"),
  alternativeMaterialName: text("alternativeMaterialName"),
  
  // Impact metrics
  carbonSaved: decimal("carbonSaved", { precision: 10, scale: 2 }), // kg CO₂e
  costDelta: decimal("costDelta", { precision: 10, scale: 2 }), // $
  risDelta: int("risDelta"), // RIS improvement
  
  // Context
  context: text("context"), // 'quadrant', 'comparison', 'msi_calculator', etc.
  source: text("source"), // 'ai_suggestion', 'manual_comparison', etc.
  
  // Additional data (JSON)
  metadata: text("metadata"), // JSON string for flexible additional data
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;
