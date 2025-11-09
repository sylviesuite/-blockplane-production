import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, materials, lifecycleValues, risScores, pricing, epdMetadata } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// MATERIALS DATABASE QUERIES
// ============================================================================

/**
 * Get all materials with their related data (lifecycle, RIS/LIS, pricing)
 */
export async function getAllMaterials() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get materials: database not available");
    return [];
  }

  // Get all materials
  const allMaterials = await db.select().from(materials);

  // Get all related data
  const allLifecycle = await db.select().from(lifecycleValues);
  const allRisScores = await db.select().from(risScores);
  const allPricing = await db.select().from(pricing);
  const allEpd = await db.select().from(epdMetadata);

  // Combine data
  return allMaterials.map(material => {
    const lifecycle = allLifecycle.filter(lc => lc.materialId === material.id);
    const ris = allRisScores.find(r => r.materialId === material.id);
    const price = allPricing.find(p => p.materialId === material.id);
    const epd = allEpd.filter(e => e.materialId === material.id);

    return {
      ...material,
      lifecycle,
      risScore: ris?.risScore || 0,
      lisScore: ris?.lisScore || 0,
      costPerUnit: price?.costPerUnit || "0",
      currency: price?.currency || "USD",
      epdMetadata: epd,
    };
  });
}

/**
 * Get materials by category
 */
export async function getMaterialsByCategory(category: string) {
  const allMaterials = await getAllMaterials();
  return allMaterials.filter(m => m.category === category);
}

/**
 * Get a single material by ID with all related data
 */
export async function getMaterialById(id: number) {
  const allMaterials = await getAllMaterials();
  return allMaterials.find(m => m.id === id);
}
