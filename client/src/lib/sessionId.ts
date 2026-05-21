const KEY = "bp_session_id";

export function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // sessionStorage may be unavailable in some contexts
    return "unknown";
  }
}
