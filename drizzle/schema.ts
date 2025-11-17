import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// ANALYTICS SCHEMA
// ============================================================================

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

// ============================================================================
// MATERIALS DATABASE SCHEMA
// ============================================================================

/**
 * Core materials table
 * Stores building materials with their basic properties and total carbon footprint
 */
export const materials = mysqlTable("materials", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  category: mysqlEnum("category", ["Timber", "Steel", "Concrete", "Earth", "Insulation", "Composites", "Masonry"]).notNull(),
  functionalUnit: varchar("functionalUnit", { length: 50 }).notNull(), // e.g., "m³", "m²", "linear meter"
  totalCarbon: decimal("totalCarbon", { precision: 10, scale: 2 }).notNull(), // kg CO₂e
  description: text("description"),
  
  // Data quality and transparency fields for "radical honesty"
  confidenceLevel: mysqlEnum("confidenceLevel", ["High", "Medium", "Low", "None"]).default("Medium").notNull(),
  dataQuality: text("dataQuality"), // JSON string with quality metadata
  lastVerified: timestamp("lastVerified"), // When data was last verified
  verificationNotes: text("verificationNotes"), // Notes about verification status
  isRegenerative: int("isRegenerative").default(0).notNull(), // 1 = regenerative, 0 = not
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

/**
 * Lifecycle carbon values by phase
 * Stores detailed carbon breakdown across lifecycle stages
 */
export const lifecycleValues = mysqlTable("lifecycleValues", {
  id: int("id").autoincrement().primaryKey(),
  materialId: int("materialId").notNull(),
  phase: mysqlEnum("phase", [
    "A1-A3",
    "A4",
    "A5",
    "B",
    "C1-C4"
  ]).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(), // kg CO₂e
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LifecycleValue = typeof lifecycleValues.$inferSelect;
export type InsertLifecycleValue = typeof lifecycleValues.$inferInsert;

/**
 * Regenerative and Life Impact Scores
 * RIS: Regenerative Impact Score (0-100, higher = more regenerative)
 * LIS: Life Impact Score (0-100, lower = less environmental damage)
 */
export const risScores = mysqlTable("risScores", {
  id: int("id").autoincrement().primaryKey(),
  materialId: int("materialId").notNull().unique(),
  risScore: int("risScore").notNull(), // 0-100
  lisScore: int("lisScore").notNull(), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RisScore = typeof risScores.$inferSelect;
export type InsertRisScore = typeof risScores.$inferInsert;

/**
 * Pricing information
 * Stores cost per functional unit for economic analysis
 */
export const pricing = mysqlTable("pricing", {
  id: int("id").autoincrement().primaryKey(),
  materialId: int("materialId").notNull().unique(),
  costPerUnit: decimal("costPerUnit", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Pricing = typeof pricing.$inferSelect;
export type InsertPricing = typeof pricing.$inferInsert;

/**
 * EPD (Environmental Product Declaration) metadata
 * Tracks data sources and provenance for transparency
 */
export const epdMetadata = mysqlTable("epdMetadata", {
  id: int("id").autoincrement().primaryKey(),
  materialId: int("materialId").notNull(),
  source: varchar("source", { length: 255 }).notNull(), // e.g., "ICE Database v3.0"
  referenceYear: int("referenceYear"), // e.g., 2019
  
  // Additional EPD transparency fields
  epdUrl: varchar("epdUrl", { length: 512 }), // Link to original EPD document
  epdDate: timestamp("epdDate"), // Publication date of EPD
  manufacturer: varchar("manufacturer", { length: 255 }), // Manufacturer name
  region: varchar("region", { length: 100 }), // Geographic region (e.g., "North America")
  standard: varchar("standard", { length: 100 }), // e.g., "EN 15804", "ISO 14025"
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EpdMetadata = typeof epdMetadata.$inferSelect;
export type InsertEpdMetadata = typeof epdMetadata.$inferInsert;

// ============================================================================
// USER ACCOUNTS & SAVED DATA SCHEMA
// ============================================================================

/**
 * Saved projects table
 * Stores user projects with BOM data and analysis results
 */
export const savedProjects = mysqlTable("savedProjects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  bomData: text("bomData").notNull(), // JSON string of BOM items
  totalCarbon: decimal("totalCarbon", { precision: 10, scale: 2 }),
  totalCost: decimal("totalCost", { precision: 10, scale: 2 }),
  avgRIS: decimal("avgRIS", { precision: 5, scale: 2 }),
  avgLIS: decimal("avgLIS", { precision: 5, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedProject = typeof savedProjects.$inferSelect;
export type InsertSavedProject = typeof savedProjects.$inferInsert;

/**
 * Favorite materials table
 * Stores user's favorite materials for quick access
 */
export const favoriteMaterials = mysqlTable("favoriteMaterials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  materialId: int("materialId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FavoriteMaterial = typeof favoriteMaterials.$inferSelect;
export type InsertFavoriteMaterial = typeof favoriteMaterials.$inferInsert;

/**
 * Saved MSI presets table
 * Stores user's custom MSI weight configurations
 */
export const msiPresets = mysqlTable("msiPresets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  impactWeight: int("impactWeight").notNull(), // 0-100
  carbonWeight: int("carbonWeight").notNull(), // 0-100
  costWeight: int("costWeight").notNull(), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MsiPreset = typeof msiPresets.$inferSelect;
export type InsertMsiPreset = typeof msiPresets.$inferInsert;

// ============================================================================
// RELATIONS
// ============================================================================

export const materialsRelations = relations(materials, ({ many, one }) => ({
  lifecycleValues: many(lifecycleValues),
  risScore: one(risScores, {
    fields: [materials.id],
    references: [risScores.materialId],
  }),
  pricing: one(pricing, {
    fields: [materials.id],
    references: [pricing.materialId],
  }),
  epdMetadata: many(epdMetadata),
}));

export const lifecycleValuesRelations = relations(lifecycleValues, ({ one }) => ({
  material: one(materials, {
    fields: [lifecycleValues.materialId],
    references: [materials.id],
  }),
}));

export const risScoresRelations = relations(risScores, ({ one }) => ({
  material: one(materials, {
    fields: [risScores.materialId],
    references: [materials.id],
  }),
}));

export const pricingRelations = relations(pricing, ({ one }) => ({
  material: one(materials, {
    fields: [pricing.materialId],
    references: [materials.id],
  }),
}));

export const epdMetadataRelations = relations(epdMetadata, ({ one }) => ({
  material: one(materials, {
    fields: [epdMetadata.materialId],
    references: [materials.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  savedProjects: many(savedProjects),
  favoriteMaterials: many(favoriteMaterials),
  msiPresets: many(msiPresets),
}));

export const savedProjectsRelations = relations(savedProjects, ({ one }) => ({
  user: one(users, {
    fields: [savedProjects.userId],
    references: [users.id],
  }),
}));

export const favoriteMaterialsRelations = relations(favoriteMaterials, ({ one }) => ({
  user: one(users, {
    fields: [favoriteMaterials.userId],
    references: [users.id],
  }),
  material: one(materials, {
    fields: [favoriteMaterials.materialId],
    references: [materials.id],
  }),
}));

export const msiPresetsRelations = relations(msiPresets, ({ one }) => ({
  user: one(users, {
    fields: [msiPresets.userId],
    references: [users.id],
  }),
}));


// ============================================================================
// CONVERSATION HISTORY SCHEMA
// ============================================================================

/**
 * Conversation history table
 * Stores AI Swap Assistant conversations for users
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: text("title"), // Auto-generated from first query
  query: text("query").notNull(), // Original user query
  region: varchar("region", { length: 64 }).default("national"),
  projectArea: int("projectArea").default(1000),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Conversation recommendations table
 * Stores the materials recommended in each conversation
 */
export const conversationRecommendations = mysqlTable("conversationRecommendations", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  materialId: int("materialId").notNull(),
  rank: int("rank").notNull(), // 1, 2, 3 for top 3 recommendations
  carbonSavings: decimal("carbonSavings", { precision: 10, scale: 2 }),
  costDifference: decimal("costDifference", { precision: 10, scale: 2 }),
  explanation: text("explanation"), // AI-generated explanation
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConversationRecommendation = typeof conversationRecommendations.$inferSelect;
export type InsertConversationRecommendation = typeof conversationRecommendations.$inferInsert;

// Relations
export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  recommendations: many(conversationRecommendations),
}));

export const conversationRecommendationsRelations = relations(conversationRecommendations, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationRecommendations.conversationId],
    references: [conversations.id],
  }),
  material: one(materials, {
    fields: [conversationRecommendations.materialId],
    references: [materials.id],
  }),
}));

// Update users relations to include conversations
export const usersRelationsExtended = relations(users, ({ many }) => ({
  savedProjects: many(savedProjects),
  favoriteMaterials: many(favoriteMaterials),
  msiPresets: many(msiPresets),
  conversations: many(conversations),
}));


// ============================================================================
// GLOBAL IMPACT TRACKING SCHEMA
// ============================================================================

/**
 * Global impact metrics table
 * Aggregates platform-wide carbon savings and material substitutions
 */
export const globalImpact = mysqlTable("globalImpact", {
  id: int("id").autoincrement().primaryKey(),
  
  // Tracking period
  date: timestamp("date").notNull(), // Daily aggregation
  
  // Aggregate metrics
  totalCarbonSaved: decimal("totalCarbonSaved", { precision: 12, scale: 2 }).default("0"), // kg CO₂e
  totalSubstitutions: int("totalSubstitutions").default(0),
  totalProjectsOptimized: int("totalProjectsOptimized").default(0),
  totalAIRecommendations: int("totalAIRecommendations").default(0),
  totalAIAcceptances: int("totalAIAcceptances").default(0),
  
  // Material performance
  topMaterialId: int("topMaterialId"), // Most recommended material
  topMaterialCount: int("topMaterialCount").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GlobalImpact = typeof globalImpact.$inferSelect;
export type InsertGlobalImpact = typeof globalImpact.$inferInsert;

/**
 * User impact tracking table
 * Tracks individual user contributions to carbon savings
 */
export const userImpact = mysqlTable("userImpact", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // User metrics
  totalCarbonSaved: decimal("totalCarbonSaved", { precision: 12, scale: 2 }).default("0"),
  totalSubstitutions: int("totalSubstitutions").default(0),
  totalProjectsOptimized: int("totalProjectsOptimized").default(0),
  
  // Engagement
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserImpact = typeof userImpact.$inferSelect;
export type InsertUserImpact = typeof userImpact.$inferInsert;

// Relations
export const userImpactRelations = relations(userImpact, ({ one }) => ({
  user: one(users, {
    fields: [userImpact.userId],
    references: [users.id],
  }),
}));
