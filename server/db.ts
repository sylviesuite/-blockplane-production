import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
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
// MATERIALS DATABASE QUERIES (Supabase REST API)
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

async function supabaseFetch(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase fetch failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

function mapRow(r: any) {
  return {
    id: r.id as string,
    name: r.name,
    category: r.category ?? "Uncategorized",
    description: r.description ?? null,
    totalCarbon: String(r.total_carbon_cradle_to_gate ?? 0),
    lisScore: r.lis_score ?? 0,
    risScore: r.ris_score ?? 0,
    functionalUnit: "m²",
    costPerUnit: String(((r.lis_score ?? 0) * 0.8).toFixed(2)),
    lifecycle: [] as any[],
    epdMetadata: [] as any[],
  };
}

export async function getAllMaterials() {
  try {
    const rows = await supabaseFetch(
      "materials_with_scores?select=id,name,category,description,lis_score,ris_score,total_carbon_cradle_to_gate&limit=300"
    );
    // Deduplicate: first by ID (view join produces multiple rows per ID with different scores),
    // then by name+category (some materials were inserted twice with different UUIDs).
    const seenId = new Set<string>();
    const seenName = new Set<string>();
    return (rows as any[])
      .filter(r => {
        if (seenId.has(r.id)) return false;
        seenId.add(r.id);
        const nameKey = `${r.name}||${r.category}`;
        if (seenName.has(nameKey)) return false;
        seenName.add(nameKey);
        return true;
      })
      .map(mapRow);
  } catch (err) {
    console.error("[Database] getAllMaterials failed:", err);
    return [];
  }
}

export async function getMaterialsByCategory(category: string) {
  const all = await getAllMaterials();
  return all.filter((m) => m.category === category);
}

export async function getMaterialById(id: string) {
  try {
    const rows = await supabaseFetch(
      `materials_with_scores?id=eq.${encodeURIComponent(id)}&select=id,name,category,description,lis_score,ris_score,total_carbon_cradle_to_gate&limit=1`
    );
    if (!(rows as any[]).length) return undefined;
    return mapRow((rows as any[])[0]);
  } catch (err) {
    console.error("[Database] getMaterialById failed:", err);
    return undefined;
  }
}
