/**
 * Unmatched note-token analysis for `GET /api/admin/keywords`.
 *
 * Terav's engine reads note keywords through hand-authored regex in
 * `engine/note-signals.ts`. Phrasing the regex does not know falls through
 * undetected, so this surfaces tokens users actually type that nothing matches
 * — a review queue for widening the vocabulary. The founder edits the regex and
 * commits; no rule ever mutates itself.
 *
 * The logic lives here rather than inside the Pages Function for two reasons.
 * It could not be tested there (Workers types, no database), and the function
 * it came from had been reading Cloudflare KV since the 2026-08-18 Postgres
 * migration — a store nothing writes any more. The review queue had been
 * returning stale or empty results for two weeks and nothing said so, because
 * "no unmatched tokens" and "no data at all" look identical in the response.
 *
 * Returns counts only. No note text ever leaves the endpoint — that is the
 * narrow defensible path for cross-user analysis, and the reason this is not
 * simply a dump of what people wrote.
 */

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

export function tokenize(text: string): string[] {
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

export function isMatchedByRegex(text: string): boolean {
  return KNOWN_PATTERNS.some((r) => r.test(text));
}

export function extractRecentNotes(store: unknown, sinceISO: string): string[] {
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

export type TokenRow = { token: string; count: number; distinct_users: number };

/**
 * Tally tokens no regex matches, across every user's state blob.
 *
 * Users are counted by opaque id, never by email. The KV version keyed distinct
 * users off the email embedded in the storage key, which meant an endpoint that
 * returns no personal data still assembled a list of addresses to get there.
 */
export function tallyUnmatchedTokens(
  rows: Array<{ user_id?: string; state: unknown }>,
  sinceISO: string,
  opts: { minCount?: number; limit?: number } = {},
): { tokens: TokenRow[]; scannedNotes: number } {
  const { minCount = 3, limit = 200 } = opts;
  const stats = new Map<string, { count: number; users: Set<string> }>();
  let scannedNotes = 0;

  for (const [i, row] of rows.entries()) {
    const notes = extractRecentNotes(row.state, sinceISO);
    scannedNotes += notes.length;
    const who = row.user_id ?? `row-${i}`;
    for (const note of notes) {
      for (const t of tokenize(note)) {
        if (isMatchedByRegex(t)) continue;
        const stat = stats.get(t) ?? { count: 0, users: new Set<string>() };
        stat.count += 1;
        stat.users.add(who);
        stats.set(t, stat);
      }
    }
  }

  const tokens = [...stats.entries()]
    .map(([token, s]) => ({ token, count: s.count, distinct_users: s.users.size }))
    .filter((t) => t.count >= minCount)
    .sort((a, b) => b.count - a.count || b.distinct_users - a.distinct_users)
    .slice(0, limit);

  return { tokens, scannedNotes };
}
