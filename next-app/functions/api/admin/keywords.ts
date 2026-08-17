/**
 * F2 Phase A — Note-keyword surfacing (admin-only).
 *
 * GET /api/admin/keywords → { scanned_users, scanned_notes, unmatched_tokens[] }
 *
 * What it does:
 * - Iterates every KV key matching `user-email:*:v2`
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
 */

interface Env {
  STORE: KVNamespace;
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  ADMIN_EMAILS: string; // comma-separated list, e.g. "sellinmargus@gmail.com,you@terav.fit"
}

// Regex patterns from src/lib/engine/note-signals.ts — kept in sync manually.
// If the source regex changes, update these to match.
const KNOWN_PATTERNS: RegExp[] = [
  /\b(exhaust\w*|wrecked|toast|hangover|hungover|sick|flu|fever|no ?sleep|didn['’]?t ?sleep|tough ?week|beat ?up|beaten|väsi\w*|magamata|haige)\b/i,
  /\b(stiff|sore|tight|tired|fatigued|drained|dead|heavy|slow|sluggish|krambid|krampis|kanged?|väsinud|jäik|jäigad)\b/i,
  /\b(padel|padle|tennis|hike|hiked|hiking|climbed|climbing|match|game|long ?day|late ?night|long ?weekend|festival|party|long ?run|ran \d+ ?km|drive|drove \d+|walked \d+|matk|matkasin|reisisin|reisil|pidu|peol)\b/i,
  /\b(pain|hurt\w*|sharp|twinge|flare|shooting|pinch|ache|aching|click\w*|clunk\w*|catch\w*|stuck|giving ?way|gave ?way|valu\w*|valus|torkab|kipitab)\b/i,
  /\b(easy|light|grooved|snappy|smooth|effortless|too ?easy|felt ?good|felt ?great|felt ?strong|kerge|hea tunne|lihtne|sujus)\b/i,
];

// English + Estonian stopwords. Kept short — precision matters more than
// recall (we can add later, subtracting is annoying).
const STOPWORDS = new Set<string>([
  "the", "and", "for", "with", "was", "are", "not", "but", "you", "your",
  "day", "today", "yesterday", "this", "that", "just", "got", "had", "have",
  "did", "was", "were", "will", "would", "could", "should", "some", "any",
  "all", "one", "two", "three", "first", "last", "next", "than", "then",
  "way", "out", "off", "onto", "into", "over", "under", "from", "back",
  "very", "much", "more", "less", "also", "still", "even", "now", "here",
  "there", "when", "where", "how", "why", "what", "which", "who",
  // Estonian common
  "ja", "on", "ei", "et", "aga", "või", "kui", "mis", "see", "seda",
  "oli", "olin", "olime", "olid", "kas", "ka", "veel", "juba", "väga",
  "sest", "olen", "olema", "peaks", "pole", "seal", "siin", "sinna", "siia",
]);

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

function tokenize(text: string): string[] {
  if (!text) return [];
  // Strip punctuation, lowercase, split whitespace
  return text
    .toLowerCase()
    .replace(/[^a-zäöüõšž0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && t.length <= 40)
    .filter((t) => !/^\d+$/.test(t)) // pure numbers
    .filter((t) => !STOPWORDS.has(t));
}

function isMatchedByRegex(text: string): boolean {
  return KNOWN_PATTERNS.some((r) => r.test(text));
}

function extractRecentNotes(store: unknown, sinceISO: string): string[] {
  const notes: string[] = [];
  const s = store as { logs?: Record<string, unknown> } | null;
  if (!s?.logs) return notes;
  for (const [date, dayRaw] of Object.entries(s.logs)) {
    if (date < sinceISO) continue;
    const day = dayRaw as {
      notes?: string;
      symptoms?: { outside_training?: string };
      exercises?: Record<string, { notes?: string; sets?: Array<{ notes?: string }> }>;
    };
    if (day.notes?.trim()) notes.push(day.notes);
    if (day.symptoms?.outside_training?.trim()) notes.push(day.symptoms.outside_training);
    for (const ex of Object.values(day.exercises ?? {})) {
      if (ex.notes?.trim()) notes.push(ex.notes);
      for (const set of ex.sets ?? []) {
        if (set.notes?.trim()) notes.push(set.notes);
      }
    }
  }
  return notes;
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

  // List all live-user KV keys. `user-email:*:v2` — skip snapshots.
  const keys: string[] = [];
  let cursor: string | undefined = undefined;
  do {
    const list = await env.STORE.list({ prefix: "user-email:", cursor, limit: 1000 });
    for (const k of list.keys) {
      if (k.name.endsWith(":v2")) keys.push(k.name);
    }
    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor);

  // Iterate users, extract notes, tokenize
  type TokenStat = { count: number; users: Set<string> };
  const tokenStats = new Map<string, TokenStat>();
  let scannedNotes = 0;

  for (const key of keys) {
    const raw = await env.STORE.get(key);
    if (!raw) continue;
    let store: unknown;
    try {
      store = JSON.parse(raw);
    } catch {
      continue;
    }
    const notes = extractRecentNotes(store, cutoffISO);
    scannedNotes += notes.length;
    // Extract the email component from the key: user-email:{email}:v2
    const emailPart = key.slice("user-email:".length, key.length - ":v2".length);

    for (const note of notes) {
      // Skip notes wholly matched by regex — they're "seen" already
      // (fast pre-check; individual tokens still get inspected below in
      // case a note has BOTH matched and unmatched terms)
      const tokens = tokenize(note);
      for (const t of tokens) {
        // Skip if this token would be matched by known regex
        if (isMatchedByRegex(t)) continue;
        const stat = tokenStats.get(t) ?? { count: 0, users: new Set() };
        stat.count += 1;
        stat.users.add(emailPart);
        tokenStats.set(t, stat);
      }
    }
  }

  const unmatched = Array.from(tokenStats.entries())
    .map(([token, stat]) => ({
      token,
      count: stat.count,
      distinct_users: stat.users.size,
    }))
    .filter((t) => t.count >= 3) // minimum-frequency floor
    .sort((a, b) => b.count - a.count || b.distinct_users - a.distinct_users)
    .slice(0, 200); // cap output size

  return new Response(
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        scanned_users: keys.length,
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
