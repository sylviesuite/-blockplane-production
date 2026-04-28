import { parse as parseCookieHeader } from "cookie";
import { jwtVerify, SignJWT } from "jose";
import type { Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { ENV } from "../_core/env";

// ---------------------------------------------------------------------------
// SessionUser — the shape of ctx.user throughout the app.
// Sourced from user_profiles (existing Supabase table) + JWT claims.
// ---------------------------------------------------------------------------

export type SessionUser = {
  id: string;         // Supabase Auth UUID
  openId: string;     // same as id — kept for backward compat with existing routers
  name: string | null;
  email: string | null;
  role: "user" | "admin";
};

// ---------------------------------------------------------------------------
// Supabase REST helper
// ---------------------------------------------------------------------------

async function supabaseRest(path: string, options: RequestInit = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase not configured");

  const res = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers ?? {}),
    },
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

// ---------------------------------------------------------------------------
// Session JWT
// ---------------------------------------------------------------------------

function jwtSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "");
}

type JwtPayload = { openId: string; name: string; email: string };

export async function verifySessionCookie(
  req: Request
): Promise<JwtPayload | null> {
  try {
    const cookies = parseCookieHeader(req.headers.cookie ?? "");
    const token = cookies[COOKIE_NAME];
    if (!token) return null;
    const { payload } = await jwtVerify(token, jwtSecret(), { algorithms: ["HS256"] });
    const openId = payload.openId as string | undefined;
    if (!openId) return null;
    return {
      openId,
      name: (payload.name as string | undefined) ?? "",
      email: (payload.email as string | undefined) ?? "",
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(
  res: Response,
  req: Request,
  openId: string,
  name: string,
  email: string
) {
  const expiresAt = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);
  const token = await new SignJWT({ openId, appId: "blockplane", name, email })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expiresAt)
    .sign(jwtSecret());

  res.cookie(COOKIE_NAME, token, {
    ...getSessionCookieOptions(req),
    maxAge: ONE_YEAR_MS,
  });
}

// ---------------------------------------------------------------------------
// user_profiles table (existing Supabase table, id = Supabase Auth UUID)
// ---------------------------------------------------------------------------

function mapProfile(row: Record<string, unknown>, email: string): SessionUser {
  const isOwner = ENV.ownerOpenId && row.id === ENV.ownerOpenId;
  return {
    id: row.id as string,
    openId: row.id as string,
    name: (row.full_name as string | null) ?? null,
    email,
    role: isOwner ? "admin" : "user",
  };
}

export async function getUserByOpenId(
  openId: string,
  email = ""
): Promise<SessionUser | null> {
  try {
    const rows = await supabaseRest(
      `/rest/v1/user_profiles?id=eq.${encodeURIComponent(openId)}&select=*&limit=1`
    );
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return mapProfile(rows[0], email);
  } catch {
    return null;
  }
}

export async function upsertUserRow(data: {
  openId: string;
  email: string;
  name: string;
}): Promise<void> {
  await supabaseRest("/rest/v1/user_profiles", {
    method: "POST",
    headers: { Prefer: "return=representation,resolution=merge-duplicates" },
    body: JSON.stringify({
      id: data.openId,
      full_name: data.name,
    }),
  });
}

// Verify cookie and return the SessionUser, or null for unauthenticated requests.
export async function getRequestUser(req: Request): Promise<SessionUser | null> {
  const session = await verifySessionCookie(req);
  if (!session) return null;
  // Try user_profiles first; if not yet upserted, build from JWT claims.
  const user = await getUserByOpenId(session.openId, session.email);
  if (user) return user;
  // Fallback: user is authenticated but profile row doesn't exist yet
  return {
    id: session.openId,
    openId: session.openId,
    name: session.name || null,
    email: session.email || null,
    role: ENV.ownerOpenId && session.openId === ENV.ownerOpenId ? "admin" : "user",
  };
}

// ---------------------------------------------------------------------------
// Supabase Auth (email/password)
// ---------------------------------------------------------------------------

type SupabaseAuthResponse = {
  access_token?: string;
  user: { id: string; email: string };
};

function supabaseAuthHeaders() {
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!anonKey) throw new Error("SUPABASE_ANON_KEY not configured");
  return { apikey: anonKey, "Content-Type": "application/json" };
}

export async function supabaseSignIn(
  email: string,
  password: string
): Promise<SupabaseAuthResponse> {
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error("Supabase not configured");

  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: supabaseAuthHeaders(),
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description ?? data.msg ?? "Invalid email or password");
  }
  return data as SupabaseAuthResponse;
}

export async function supabaseSignUp(
  email: string,
  password: string
): Promise<SupabaseAuthResponse> {
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error("Supabase not configured");

  const res = await fetch(`${url}/auth/v1/signup`, {
    method: "POST",
    headers: supabaseAuthHeaders(),
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description ?? data.msg ?? "Signup failed");
  }
  // Supabase returns { user: {...}, access_token } when confirmation is off,
  // or the user object directly at the root when confirmation is on.
  const userId: string | undefined = data.user?.id ?? data.id;
  const userEmail: string | undefined = data.user?.email ?? data.email;
  if (!userId || !userEmail) {
    throw new Error("Signup failed — no user returned");
  }
  return { access_token: data.access_token, user: { id: userId, email: userEmail } };
}

// ---------------------------------------------------------------------------
// Beta signups
// ---------------------------------------------------------------------------

export async function insertBetaSignup(data: {
  email: string;
  name?: string;
  role?: string;
  org?: string;
}): Promise<void> {
  await supabaseRest("/rest/v1/beta_signups", {
    method: "POST",
    body: JSON.stringify({
      email: data.email,
      name: data.name ?? null,
      role: data.role ?? null,
      org: data.org ?? null,
    }),
  });
}
