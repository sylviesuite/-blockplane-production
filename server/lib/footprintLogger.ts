export interface FootprintEntry {
  session_id?: string | null;
  feature_name: string;
  provider?: string;
  model?: string;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens?: number | null;
  project_id?: string | null;
  user_id?: string | null;
}

/**
 * Fire-and-forget insert into footprint_log.
 * Never throws and never blocks the caller.
 */
export function logFootprint(entry: FootprintEntry): void {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return;

  const payload = {
    ...entry,
    total_tokens:
      entry.total_tokens ??
      (entry.input_tokens != null && entry.output_tokens != null
        ? entry.input_tokens + entry.output_tokens
        : null),
  };

  fetch(`${url}/rest/v1/footprint_log`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  }).catch((err: unknown) => {
    console.error("[footprint] log insert failed:", err);
  });
}
