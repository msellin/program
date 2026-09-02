/**
 * F2 Phase A — Note-keyword surfacing (admin-only).
 *
 * GET /api/admin/keywords → { scanned_users, scanned_notes, unmatched_tokens[] }
 *
 * What it does:
 * - Reads every row of `user_states` from Postgres (paginated)
 * - Extracts every free-text note from the last 30 days (day notes,
 *   exercise notes, set notes, symptom.outside_training)
 * - Tokenizes each note (lowercase, punctuation-stripped, ≥3 chars,
 *   English stopwords removed)
 * - Filters OUT tokens already matched by note-signals.ts regex vocabulary
 * - Returns aggregated count per surviving token: how many times it
 *   appeared, across how many distinct users
 *
 * Why:
 * - Terav's engine reads note keywords via note-signals.ts regex. The regex
 *   is hand-authored — new phrasing users type falls through undetected.
 * - This endpoint gives the founder a weekly review queue: "these unmatched
 *   tokens appear ≥3× across your beta; consider adding to the regex."
 * - Founder reviews + edits note-signals.ts + commits + deploys. No
 *   autonomous rule mutation (per Concern B research).
 *
 * Consent-first:
 * - No note TEXT is returned. Just tokens + counts + distinct-user counts.
 *   Concern D's narrow defensible path — no cross-user text pooling.
 * - Admin-gated: requires ADMIN_EMAILS env var contains the caller's
 *   Supabase-verified email.
 * - GDPR: data flow is founder-side review of tokens that the users
 *   themselves typed. No profiling, no automated decisions.
 *
 * Auth: same Supabase JWT verify pattern as `/api/state`. Additional check
 * on email match against ADMIN_EMAILS (comma-separated).
 *
 * 2026-09-02 (PROG-3): ported off Cloudflare KV. It had iterated
 * `STORE.list({ prefix: "user-email:" })` since before the 2026-08-18 Postgres
 * migration, so for two weeks it scanned a store nothing writes and returned
 * an empty review queue — indistinguishable, in the response, from a queue
 * that genuinely had nothing in it. Distinct users are now counted by opaque
 * user id rather than by the email embedded in the old KV key: an endpoint
 * that returns no personal data should not need to assemble a list of
 * addresses to get there. Analysis lives in `src/lib/note-keywords.ts` so it
 * can be tested without a database.
 */

import { tallyUnmatchedTokens } from "../../../src/lib/note-keywords";

interface Env {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ADMIN_EMAILS: string; // comma-separated list, e.g. "sellinmargus@gmail.com,you@terav.fit"
}

async function verifyAdmin(request: Request, env: Env): Promise<{ ok: true; email: string } | { ok: false; status: number; error: string }> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return { ok: false, status: 401, error: "Missing Authorization" };
  const token = auth.slice(7);

  const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "apikey": env.SUPABASE_PUBLISHABLE_KEY,
    },
  });
  if (!userRes.ok) return { ok: false, status: 401, error: "Invalid token" };
  const user = (await userRes.json()) as { email?: string };
  const email = (user.email ?? "").trim().toLowerCase();
  if (!email) return { ok: false, status: 401, error: "No email on token" };

  const adminList = (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!adminList.includes(email)) return { ok: false, status: 403, error: "Not admin" };

  return { ok: true, email };
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAdmin(request, env);
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: auth.status,
      headers: { "content-type": "application/json" },
    });
  }

  // Compute the 30-day cutoff
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffISO = cutoff.toISOString().slice(0, 10);

  // Read from Postgres. This iterated `STORE.list({ prefix: "user-email:" })`
  // until 2026-09-02 — Cloudflare KV stopped being the live store in the
  // 2026-08-18 migration, so the review queue had been scanning a store nothing
  // writes for two weeks. Nothing reported it, because an empty result and no
  // data at all produce the same response.
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Service role not configured" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
  const rows: Array<{ user_id?: string; state: unknown }> = [];
  const PAGE = 500;
  for (let offset = 0; ; offset += PAGE) {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/user_states?select=user_id,state&limit=${PAGE}&offset=${offset}`,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Query failed", status: res.status, detail: await res.text() }),
        { status: 502, headers: { "content-type": "application/json" } },
      );
    }
    const page = (await res.json()) as Array<{ user_id?: string; state: unknown }>;
    rows.push(...page);
    if (page.length < PAGE) break;
  }

  const { tokens: unmatched, scannedNotes } = tallyUnmatchedTokens(rows, cutoffISO);

  return new Response(
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        scanned_users: rows.length,
        scanned_notes: scannedNotes,
        cutoff_date: cutoffISO,
        unmatched_tokens: unmatched,
        method: "regex-filter + stopword + freq≥3",
        source_regex: "next-app/src/lib/engine/note-signals.ts",
      },
      null,
      2,
    ),
    {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    },
  );
};
