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
    category: mysqlEnum("category", ["Timber", "Steel", "Concrete", "Earth"]).notNull(),
    functionalUnit: varchar("functionalUnit", { length: 50 }).notNull(), // e.g., "m³", "m²", "linear meter"
    totalCarbon: decimal("totalCarbon", { precision: 10, scale: 2 }).notNull(), // kg CO₂e
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
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
/**
 * EPD (Environmental Product Declaration) metadata
 * Tracks data sources and provenance for transparency
 */
export const epdMetadata = mysqlTable("epdMetadata", {
    id: int("id").autoincrement().primaryKey(),
    materialId: int("materialId").notNull(),
    source: varchar("source", { length: 255 }).notNull(), // e.g., "ICE Database v3.0"
    referenceYear: int("referenceYear"), // e.g., 2019
    createdAt: timestamp("createdAt").defaultNow().notNull(),
});
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
