/**
 * EVID-2 — completed-arc counts, admin-only.
 *
 * GET /api/admin/completions
 *   → { as_of, programs: [{ slug, completed, graduated_with_feedback,
 *       first_completion, latest_completion }], total_users_with_state }
 *
 * Why this exists
 * ---------------
 * The public ladder says a program becomes VERIFIED partly on field evidence —
 * "≥5 users completed the arc with subjective success". Nothing could count
 * that. `graduated_at` is written into each user's own `user_states.state`
 * jsonb blob, so answering "how many people finished first-strict-pullup"
 * meant hand-written SQL against a jsonb column. A promotion criterion nobody
 * can measure is a guess wearing a number, which is the failure this whole
 * audit series keeps finding.
 *
 * Reads Postgres, not KV
 * ----------------------
 * The neighbouring admin endpoint (`keywords.ts`) still iterates
 * `STORE.list({ prefix: "user-email:" })` — Cloudflare KV, which stopped being
 * the live store in the 2026-08-18 Postgres migration. It is reading a store
 * nothing writes any more. Tracked separately; noted here so this endpoint is
 * not copied from it.
 *
 * Privacy
 * -------
 * Counts only. No user ids, no emails, no notes, no per-user rows — the
 * response cannot identify anyone, and at beta scale a count of 1 says only
 * that somebody finished. Same admin gate as `keywords.ts`: the caller's
 * Supabase-verified email must appear in ADMIN_EMAILS.
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ADMIN_EMAILS: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function requireAdmin(request: Request, env: Env): Promise<Response | null> {
  const auth = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!auth?.toLowerCase().startsWith("bearer ")) return json({ error: "Missing bearer token" }, 401);
  const token = auth.slice(7).trim();
  if (!token) return json({ error: "Empty bearer token" }, 401);
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    return json({ error: "Auth not configured" }, 500);
  }
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY, authorization: `Bearer ${token}` },
  });
  if (!res.ok) return json({ error: "Invalid session" }, 401);
  const body = (await res.json()) as { email?: string };
  const admins = (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!body.email || !admins.includes(body.email.toLowerCase())) {
    // 404 rather than 403: an admin surface should not confirm it exists.
    return json({ error: "Not found" }, 404);
  }
  return null;
}

type ProgramState = {
  graduated_at?: string;
  graduation_feedback?: { rating?: string | number };
};

export type CompletionRow = {
  slug: string;
  completed: number;
  graduated_with_feedback: number;
  first_completion: string | null;
  latest_completion: string | null;
};

/**
 * Pure aggregation, exported so it can be tested without a database. Takes the
 * raw `state` blobs and returns one row per program that anyone has finished.
 */
export function tallyCompletions(states: unknown[]): CompletionRow[] {
  const rows = new Map<string, CompletionRow>();
  for (const raw of states) {
    const profile = (raw as { user_profile?: { program_states?: Record<string, ProgramState> } })
      ?.user_profile;
    const programStates = profile?.program_states;
    if (!programStates) continue;
    for (const [slug, st] of Object.entries(programStates)) {
      const at = st?.graduated_at;
      if (typeof at !== "string" || !at) continue;
      const row = rows.get(slug) ?? {
        slug,
        completed: 0,
        graduated_with_feedback: 0,
        first_completion: null,
        latest_completion: null,
      };
      row.completed += 1;
      if (st.graduation_feedback?.rating != null) row.graduated_with_feedback += 1;
      const day = at.slice(0, 10);
      if (!row.first_completion || day < row.first_completion) row.first_completion = day;
      if (!row.latest_completion || day > row.latest_completion) row.latest_completion = day;
      rows.set(slug, row);
    }
  }
  // Most-completed first — the promotion question is "which is closest to 5".
  return [...rows.values()].sort((a, b) => b.completed - a.completed || a.slug.localeCompare(b.slug));
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: "Service role not configured" }, 500);

  const states: unknown[] = [];
  const PAGE = 500;
  for (let offset = 0; ; offset += PAGE) {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/user_states?select=state&limit=${PAGE}&offset=${offset}`,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );
    if (!res.ok) {
      return json({ error: "Query failed", status: res.status, detail: await res.text() }, 502);
    }
    const page = (await res.json()) as Array<{ state: unknown }>;
    for (const r of page) states.push(r.state);
    if (page.length < PAGE) break;
  }

  return json({
    as_of: new Date().toISOString().slice(0, 10),
    total_users_with_state: states.length,
    programs: tallyCompletions(states),
  });
};

export const onRequest: PagesFunction<Env> = async ({ request }) =>
  request.method === "GET"
    ? json({ error: "Router mismatch" }, 500)
    : json({ error: "Method not allowed" }, 405);
