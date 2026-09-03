/**
 * S4 — how close the beta is to the data thresholds that gate features.
 *
 * GET /api/admin/readiness
 *   → { as_of, users_total, users_with_any_log, logged_days[], checked_days[],
 *       nonzero_symptom_days[], max_span_days, mean_check_completion_pct }
 *
 * Why this exists
 * ---------------
 * F5 is gated on "90+ days of real log data from beta users", and the locked
 * M3 trigger reads "25 users × 90 days". Nothing could evaluate either, so
 * the decision to build or defer has been a judgement call about a number
 * nobody could see. Same failure `completions.ts` was written for: a
 * criterion nobody can measure is a guess wearing a number.
 *
 * The variance rows matter more than the day rows. A user answering "None"
 * for ninety days contributes nothing about how load relates to symptoms
 * while inflating every day count, so a day-only trigger can fire on a
 * dataset with no variance in the thing being explained.
 *
 * Privacy
 * -------
 * Counts only, same stance as `completions.ts`: no user ids, no per-user
 * rows, no dates. The response is a threshold table — how MANY users clear
 * each bar — which is what a trigger needs and nothing more. A per-user list
 * would answer the same question while being re-identifying at beta scale.
 *
 * Aggregation lives in `src/lib/data-readiness.ts` so it is testable without
 * a database; importing this file from a test would drag `functions/` into
 * the Next app's tsconfig scope, where `PagesFunction` is not declared, and
 * break the production build's type check.
 */

import { tallyReadiness } from "../../../src/lib/data-readiness";

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
    ...tallyReadiness(states),
  });
};

export const onRequest: PagesFunction<Env> = async ({ request }) =>
  request.method === "GET"
    ? json({ error: "Router mismatch" }, 500)
    : json({ error: "Method not allowed" }, 405);
