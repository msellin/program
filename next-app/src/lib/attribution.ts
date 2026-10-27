/**
 * Ad attribution, first-touch. The landing forwards utm_* / fbclid / gclid on
 * its sign-up CTA (different origin, so storage does not cross); the sign-up
 * page captures whatever arrives and puts it in the new user's metadata, where
 * `dev/scripts/activation.sql` reads it. No pixel, no third party.
 *
 * Consent timestamps for the Google path ride the same mechanism: OAuth has no
 * `options.data`, so they wait in storage and are applied on the SIGNED_IN
 * that follows the redirect.
 */
const ATTR_KEY = "terav.attribution";
const PENDING_KEY = "terav.pending-signup-meta";
const PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
] as const;

export type Attribution = Partial<Record<(typeof PARAMS)[number], string>>;

function read(key: string): Record<string, unknown> {
  try {
    const raw = window.localStorage.getItem(key);
    const v = raw ? JSON.parse(raw) : null;
    return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function write(key: string, value: Record<string, unknown>) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage blocked: attribution is best-effort
  }
}

/** Parse tracking params out of a query string. Pure. */
export function parseAttribution(search: string): Attribution {
  const sp = new URLSearchParams(search);
  const out: Attribution = {};
  for (const k of PARAMS) {
    const v = sp.get(k);
    if (v) out[k] = v.slice(0, 200);
  }
  return out;
}

/** Store the current URL's tracking params, first touch wins. */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const seen = parseAttribution(window.location.search);
  const stored = read(ATTR_KEY) as Attribution;
  if (Object.keys(stored).length > 0) return stored;
  if (Object.keys(seen).length > 0) {
    write(ATTR_KEY, { ...seen, first_seen_at: new Date().toISOString() });
  }
  return seen;
}

export function getAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const stored = read(ATTR_KEY) as Record<string, string>;
  return Object.keys(stored).length > 0 ? stored : captureAttribution();
}

/** Metadata for a new account: consent timestamps plus attribution. */
export function signupMetadata(): Record<string, string> {
  const now = new Date().toISOString();
  const attr = getAttribution();
  const out: Record<string, string> = {
    accepted_terms_at: now,
    consented_symptom_data_at: now,
    confirmed_age_16_at: now,
  };
  for (const [k, v] of Object.entries(attr)) {
    out[k === "first_seen_at" ? "attribution_first_seen_at" : k] = v;
  }
  return out;
}

/** Google path: remember what to write once the OAuth session exists. */
export function stashPendingSignupMeta() {
  write(PENDING_KEY, signupMetadata());
}

/**
 * After a Google redirect lands signed in: write the stashed consent +
 * attribution to user metadata once, and never overwrite an existing account's
 * consent record (only runs when sign-up stashed something).
 */
export async function applyPendingSignupMeta(supabase: {
  auth: { updateUser: (a: { data: Record<string, unknown> }) => Promise<{ error: unknown }> };
}) {
  if (typeof window === "undefined") return;
  const pending = read(PENDING_KEY);
  if (Object.keys(pending).length === 0) return;
  const { error } = await supabase.auth.updateUser({ data: pending });
  if (!error) {
    try {
      window.localStorage.removeItem(PENDING_KEY);
    } catch {
      // ignore
    }
  }
}
