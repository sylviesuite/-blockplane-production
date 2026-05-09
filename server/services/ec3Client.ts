/**
 * EC3 (Building Transparency) API client.
 *
 * API reference: https://buildingtransparency.org/api
 * Auth: Authorization: Bearer <EC3_API_KEY>
 *
 * Relevant endpoints
 *   GET /api/materials  — search EPD records by keyword / category
 *   GET /api/epds       — similar, EPD-centric view
 */

const EC3_BASE = "https://buildingtransparency.org/api";

// ── Types ────────────────────────────────────────────────────────────────────

export interface EC3Result {
  lowestCarbon: number | null;
  unit: string | null;
  epdName: string | null;
  manufacturer: string | null;
  epdId: string | null;
  verificationStatus: string | null;
  allResults: EC3EPD[];
}

export interface EC3EPD {
  id: string;
  name: string;
  manufacturer: string | null;
  gwp: number | null;
  unit: string | null;
  category: string | null;
  epdType: string | null;
  validUntil: string | null;
  verificationStatus: string | null;
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function apiKey(): string {
  const key = process.env.EC3_API_KEY;
  if (!key || key === "your_key_here") {
    throw new Error("EC3_API_KEY is not set. Add your key to .env as EC3_API_KEY=<key>.");
  }
  return key;
}

async function ec3Fetch(path: string, params: Record<string, string>): Promise<any> {
  const url = new URL(`${EC3_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`EC3 ${res.status} ${res.statusText} — ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : null;
}

// EC3 returns GWP in various shapes depending on endpoint version.
// Try the most common field names.
function extractGwp(record: any): number | null {
  const raw =
    record.gwp?.A1A2A3 ??
    record.gwp?.a1a2a3 ??
    record.gwp?.total ??
    record.gwp ??
    record.gwp_per_kg ??
    record.gwp_total ??
    null;
  if (raw === null || raw === undefined) return null;
  const n = parseFloat(String(raw));
  return Number.isFinite(n) ? n : null;
}

function extractManufacturer(record: any): string | null {
  if (!record.manufacturer) return null;
  if (typeof record.manufacturer === "string") return record.manufacturer;
  return record.manufacturer?.name ?? record.manufacturer?.web_domain ?? null;
}

function mapRecord(r: any): EC3EPD {
  return {
    id: r.id ?? r.open_xpd_uuid ?? "",
    name: r.name ?? r.product_name ?? "",
    manufacturer: extractManufacturer(r),
    gwp: extractGwp(r),
    unit: r.declared_unit ?? r.functional_unit ?? null,
    category: Array.isArray(r.category) ? r.category.join(" > ") : (r.category ?? null),
    epdType: r.epd_type ?? r.epd__type ?? null,
    validUntil: r.date_validity_ends ?? r.epd_validity_end ?? null,
    verificationStatus: r.third_party_verifier ?? r.verification_status ?? null,
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Search EC3 for EPDs matching a material name and category.
 *
 * Returns the lowest verified carbon value found across all results,
 * plus the EPD name and manufacturer it came from.
 *
 * EC3 category strings follow their taxonomy, e.g. "Insulation", "Concrete",
 * "Structural Steel". Pass an empty string to search across all categories.
 */
export async function searchEPDs(
  materialName: string,
  category: string,
): Promise<EC3Result> {
  const params: Record<string, string> = {
    q: materialName,
    page_size: "25",
    // Only return EPDs that haven't expired
    epd_types: "Product EPD,Industry-wide EPD",
  };

  if (category) {
    params.category = category;
  }

  const data = await ec3Fetch("/materials", params);

  // EC3 returns either { results: [...] } or a plain array depending on version.
  const records: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];

  const epds = records.map(mapRecord);

  // Find the record with the lowest non-null GWP
  const withCarbon = epds.filter((e) => e.gwp !== null);
  withCarbon.sort((a, b) => (a.gwp ?? Infinity) - (b.gwp ?? Infinity));
  const best = withCarbon[0] ?? null;

  return {
    lowestCarbon: best?.gwp ?? null,
    unit: best?.unit ?? null,
    epdName: best?.name ?? null,
    manufacturer: best?.manufacturer ?? null,
    epdId: best?.id ?? null,
    verificationStatus: best?.verificationStatus ?? null,
    allResults: epds,
  };
}
