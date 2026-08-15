/**
 * Cloudflare Pages Function — per-user synced app state.
 *
 * GET  /api/state → { store, updated_at }
 * PUT  /api/state (body = full store JSON) → { ok, updated_at, snapshot_key }
 *
 * Auth: Supabase JWT in `Authorization: Bearer <token>` header, verified against
 * Supabase's /auth/v1/user endpoint using the project's anon key.
 *
 * Storage model — keyed on EMAIL (lowercased), not Supabase UID. Rationale:
 * UIDs change across account recreation / project migration; emails are the
 * stable user-facing identity. Legacy UID-keyed entries are migrated on read
 * (see `readWithLegacyMigration`).
 *
 *   Live key       user-email:{email}:v2           latest full store
 *   Snapshot keys  user-email:{email}:snap:{YYYY-MM-DD}   rolling 14-day history
 *
 * Every PUT writes both the live key AND a per-day snapshot. Later writes on
 * the same date overwrite that day's snapshot — one snapshot per calendar day,
 * so the 14-day window is real elapsed days not the last-14-writes. Snapshots
 * older than 14 days are pruned opportunistically on write.
 *
 * The snapshot rotation exists so that if today's state is corrupted, wiped,
 * or overwritten by a wipe-race, the previous days are one KV read away.
 * Recovery becomes an admin action, not a "sorry it's gone."
 */

interface Env {
  STORE: KVNamespace;
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
}

const SNAPSHOT_RETENTION_DAYS = 14;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function keyFor(email: string): string {
  return `user-email:${normalizeEmail(email)}:v2`;
}

function snapshotKeyFor(email: string, dateISO: string): string {
  return `user-email:${normalizeEmail(email)}:snap:${dateISO}`;
}

// Legacy UID-keyed storage — kept only for on-read migration. New writes always
// use the email key. Once every active user has been migrated (empirically:
// their next login/write), these functions can be removed.
function legacyKeyFor(uid: string): string {
  return `user:${uid}:v2`;
}

function legacySnapshotKeyFor(uid: string, dateISO: string): string {
  return `user:${uid}:snap:${dateISO}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function requireUser(
  request: Request,
  env: Env,
): Promise<{ uid: string; email: string } | Response> {
  const auth = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return json({ error: "Missing bearer token" }, 401);
  }
  const token = auth.slice(7).trim();
  if (!token) return json({ error: "Empty bearer token" }, 401);
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    return json({ error: "Auth not configured" }, 500);
  }
  try {
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      method: "GET",
      headers: {
        apikey: env.SUPABASE_PUBLISHABLE_KEY,
        authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return json({ error: "Invalid session" }, 401);
    const body = (await res.json()) as { id?: string; email?: string };
    if (!body.id) return json({ error: "No user in token" }, 401);
    if (!body.email) return json({ error: "No email in token" }, 401);
    return { uid: body.id, email: normalizeEmail(body.email) };
  } catch (e) {
    return json({ error: "Auth check failed", detail: (e as Error).message }, 502);
  }
}

/**
 * Read the user's live state, migrating from the legacy UID-keyed entry if the
 * new email-keyed entry is empty. Migration writes the legacy blob under the
 * email key so subsequent reads hit the fast path.
 */
async function readWithLegacyMigration(
  env: Env,
  uid: string,
  email: string,
): Promise<string | null> {
  const emailKey = keyFor(email);
  const raw = await env.STORE.get(emailKey);
  if (raw) return raw;
  const legacyKey = legacyKeyFor(uid);
  const legacy = await env.STORE.get(legacyKey);
  if (!legacy) return null;
  // Migrate: write the legacy blob under the email key. Non-fatal on error —
  // next write picks it up. Leave the legacy entry intact for safety; a later
  // admin sweep can prune it.
  try {
    await env.STORE.put(emailKey, legacy);
  } catch {
    /* non-fatal, we'll retry on next read */
  }
  return legacy;
}

/**
 * Enumerate the user's snapshots so callers can list, restore, or prune.
 * Uses a prefixed list which the KV binding does efficiently.
 */
async function listSnapshots(env: Env, email: string): Promise<string[]> {
  const prefix = `user-email:${normalizeEmail(email)}:snap:`;
  const out: string[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < 10; i++) {
    const listed = await env.STORE.list({ prefix, cursor });
    for (const k of listed.keys) out.push(k.name.slice(prefix.length));
    if (listed.list_complete) break;
    cursor = listed.cursor;
  }
  return out.sort();
}

async function pruneOldSnapshots(env: Env, email: string): Promise<void> {
  const dates = await listSnapshots(env, email);
  if (dates.length <= SNAPSHOT_RETENTION_DAYS) return;
  const cutoff = dates.length - SNAPSHOT_RETENTION_DAYS;
  for (const date of dates.slice(0, cutoff)) {
    await env.STORE.delete(snapshotKeyFor(email, date));
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const check = await requireUser(request, env);
  if (check instanceof Response) return check;
  // Defensive: if the STORE binding isn't configured on the Pages project,
  // fail with a clear message instead of an unhandled 500. Same for missing
  // env vars — surface exactly which binding is unresolved so the operator
  // can fix it in the dashboard.
  if (!env.STORE) {
    return json({ error: "STORE KV binding missing on this Pages project" }, 500);
  }
  const url = new URL(request.url);
  try {
    if (url.searchParams.get("list") === "snapshots") {
      const dates = await listSnapshots(env, check.email);
      return json({ snapshots: dates });
    }
    const snap = url.searchParams.get("snapshot");
    if (snap) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(snap)) {
        return json({ error: "Invalid snapshot date" }, 400);
      }
      // Try email-keyed snapshot first, fall back to legacy UID-keyed
      let raw = await env.STORE.get(snapshotKeyFor(check.email, snap));
      if (!raw) {
        raw = await env.STORE.get(legacySnapshotKeyFor(check.uid, snap));
      }
      if (!raw) return json({ store: null, updated_at: 0 });
      const parsed = JSON.parse(raw) as { updated_at?: number };
      return json({ store: parsed, updated_at: parsed?.updated_at ?? 0 });
    }
    // Default: live state, with legacy migration
    const raw = await readWithLegacyMigration(env, check.uid, check.email);
    if (!raw) return json({ store: null, updated_at: 0 });
    const parsed = JSON.parse(raw) as { updated_at?: number };
    return json({ store: parsed, updated_at: parsed?.updated_at ?? 0 });
  } catch (e) {
    return json({ error: "KV read failed", detail: (e as Error).message }, 500);
  }
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const check = await requireUser(request, env);
  if (check instanceof Response) return check;
  if (!env.STORE) {
    return json({ error: "STORE KV binding missing on this Pages project" }, 500);
  }

  const body = await request.text();
  if (body.length > 1_000_000) {
    return json({ error: "State too large" }, 413);
  }
  let parsed: { updated_at?: number };
  try {
    parsed = JSON.parse(body);
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return json({ error: "State must be an object" }, 400);
  }

  const dateISO = todayISO();
  const liveKey = keyFor(check.email);
  const snapKey = snapshotKeyFor(check.email, dateISO);
  try {
    // Write live + today's snapshot in parallel. If the snapshot fails but the
    // live write succeeds, that's still OK — snapshots are best-effort.
    await Promise.all([env.STORE.put(liveKey, body), env.STORE.put(snapKey, body)]);
  } catch (e) {
    return json({ error: "KV write failed", detail: (e as Error).message }, 500);
  }
  // Prune old snapshots — non-critical, absorb any error.
  try {
    await pruneOldSnapshots(env, check.email);
  } catch { /* non-fatal */ }
  return json({
    ok: true,
    updated_at: parsed.updated_at ?? Date.now(),
    snapshot_key: dateISO,
  });
};

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { status: 204, headers: { "access-control-allow-methods": "GET, PUT, OPTIONS" } });

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
