/**
 * DEV ONLY. Delete client/src/dev/placeholders when real data is wired.
 */

export function assertDevOnly(context?: string): void {
  if (import.meta.env.PROD) {
    const suffix = context ? ` (${context})` : "";
    throw new Error(`Placeholder module imported in PROD${suffix}. This is DEV ONLY.`);
  }
}

export const PLACEHOLDER_ONLY__MATERIALS = [
  {
    id: "__PLACEHOLDER__1",
    name: "PLACEHOLDER: Rammed Earth Demo Material",
    category: "placeholder",
    unit: "m²",
    lis: 12,
    ris: 88,
    cpi: 0.42,
    notes: "DEV ONLY. Replace with real API data.",
  },
  {
    id: "__PLACEHOLDER__2",
    name: "PLACEHOLDER: OSB Board Demo Material",
    category: "placeholder",
    unit: "sheet",
    lis: 55,
    ris: 41,
    cpi: 1.75,
    notes: "DEV ONLY. Replace with real API data.",
  },
  {
    id: "__PLACEHOLDER__3",
    name: "PLACEHOLDER: Hempcrete Infill Demo Material",
    category: "placeholder",
    unit: "m³",
    lis: 18,
    ris: 79,
    cpi: 0.95,
    notes: "DEV ONLY. Replace with real API data.",
  },
] as const;

