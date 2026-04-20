import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
// MATERIALS DATABASE QUERIES (Supabase REST API)
// ============================================================================
//
// Runtime reads the Supabase view `materials_with_scores` (see getAllMaterials).
// If the view is empty or credentials are missing, set USE_LOCAL_MATERIALS_FALLBACK=1
// to load server/data/materials-dev-fallback.json for local development.

async function supabaseFetch(path: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_KEY is not set");
  }
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase fetch failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

function deriveConfidenceLevel(score: number | null): "High" | "Medium" | "Low" | "None" {
  if (score == null) return "None";
  if (score >= 75) return "High";
  if (score >= 50) return "Medium";
  if (score >= 25) return "Low";
  return "None";
}

function mapRow(r: any) {
  const lisScore = r.lis_score ?? 0;
  const risScore = r.ris_score ?? 0;
  const dataQualityScore: number | null = r.data_quality_score ?? null;
  return {
    id: r.id as string,
    name: r.name,
    category: r.category ?? "Uncategorized",
    subcategory: r.subcategory ?? null,
    manufacturer: r.manufacturer ?? null,
    description: r.description ?? null,
    totalCarbon: String(r.total_carbon_cradle_to_gate ?? 0),
    lisScore,
    risScore,
    functionalUnit: "m²",
    costPerUnit: String((lisScore * 0.8).toFixed(2)),
    confidenceLevel: deriveConfidenceLevel(dataQualityScore),
    dataQualityScore,
    source: r.source ?? null,
    sourceUrl: r.source_url ?? null,
    lastVerified: r.last_verified ?? null,
    isRegenerative: risScore > 70 ? 1 : 0,
    lifecycle: [] as any[],
    epdMetadata: [] as any[],
    dataQuality: dataQualityScore != null ? JSON.stringify({ score: dataQualityScore }) : null,
  };
}

/** Raw rows from Supabase or materials-dev-fallback.json before mapRow. */
function dedupeMaterialRows(rows: any[]) {
  const seenId = new Set<string>();
  const seenName = new Set<string>();
  return rows.filter((r) => {
    if (seenId.has(r.id)) return false;
    seenId.add(r.id);
    const nameKey = `${r.name}||${r.category}`;
    if (seenName.has(nameKey)) return false;
    seenName.add(nameKey);
    return true;
  });
}

function loadFallbackRows(): any[] {
  try {
    const path = join(__dirname, "data", "materials-dev-fallback.json");
    const parsed = JSON.parse(readFileSync(path, "utf-8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapRowsToMaterials(rows: any[]) {
  return dedupeMaterialRows(rows).map(mapRow);
}

function localMaterialsFallbackEnabled() {
  return process.env.USE_LOCAL_MATERIALS_FALLBACK === "1";
}

export async function getAllMaterials() {
  const useFallback = localMaterialsFallbackEnabled();

  const fromLocalFile = (): any[] => {
    const raw = loadFallbackRows();
    if (!raw.length) return [];
    console.warn(
      "[Database] Using server/data/materials-dev-fallback.json (USE_LOCAL_MATERIALS_FALLBACK=1)"
    );
    return mapRowsToMaterials(raw);
  };

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      if (useFallback) return fromLocalFile();
      console.warn("[Database] Supabase credentials missing; getAllMaterials returns []");
      return [];
    }

    const rows = await supabaseFetch(
      "materials_with_scores?select=id,name,category,subcategory,manufacturer,description,lis_score,ris_score,total_carbon_cradle_to_gate,data_quality_score,source,source_url,last_verified&limit=300"
    );
    let materials = mapRowsToMaterials(rows as any[]);
    if (materials.length === 0 && useFallback) {
      const fb = fromLocalFile();
      if (fb.length) return fb;
    }
    return materials;
  } catch (err) {
    console.error("[Database] getAllMaterials failed:", err);
    if (useFallback) {
      const fb = fromLocalFile();
      if (fb.length) return fb;
    }
    return [];
  }
}

export async function getMaterialsByCategory(category: string) {
  const all = await getAllMaterials();
  return all.filter((m) => m.category === category);
}

export async function getMaterialById(id: string) {
  const useFallback = localMaterialsFallbackEnabled();

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    if (supabaseUrl && supabaseKey) {
      const rows = await supabaseFetch(
        `materials_with_scores?id=eq.${encodeURIComponent(id)}&select=id,name,category,subcategory,manufacturer,description,lis_score,ris_score,total_carbon_cradle_to_gate,data_quality_score,source,source_url,last_verified&limit=1`
      );
      if ((rows as any[]).length) return mapRow((rows as any[])[0]);
    }
  } catch (err) {
    console.error("[Database] getMaterialById failed:", err);
  }

  if (useFallback) {
    const raw = loadFallbackRows().find((r: any) => String(r.id) === String(id));
    if (raw) {
      console.warn(
        "[Database] getMaterialById resolved from materials-dev-fallback.json (USE_LOCAL_MATERIALS_FALLBACK=1)"
      );
      return mapRow(raw);
    }
  }
  return undefined;
}
