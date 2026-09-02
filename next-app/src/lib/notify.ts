/**
 * Pure helpers for `POST /api/admin/notify` (AUDIT-1).
 *
 * The privacy page promises users that sub-processor changes "will be announced
 * by email", and GDPR Art. 34 obliges notification within 72 hours of a breach
 * likely to affect them. Neither promise had a mechanism behind it.
 *
 * Lives here so the guard logic is testable without a database or a mail
 * provider — the same split the completions and note-keyword endpoints use.
 */

export type Recipient = { email: string };

/**
 * Addresses to notify: every confirmed account, deduplicated, lowercased.
 *
 * Unconfirmed sign-ups are excluded. An address nobody proved they control is
 * not a user, and mailing it on a breach would mean disclosing that someone
 * tried to register with it.
 */
export function recipientsFrom(
  users: Array<{ email?: string | null; email_confirmed_at?: string | null; deleted_at?: string | null }>,
): string[] {
  const out = new Set<string>();
  for (const u of users) {
    if (!u.email || u.deleted_at) continue;
    if (!u.email_confirmed_at) continue;
    out.add(u.email.trim().toLowerCase());
  }
  return [...out].sort();
}

/** Resend accepts up to 100 recipients per batch call. */
export function chunk<T>(items: T[], size = 100): T[][] {
  if (size < 1) throw new Error("chunk size must be >= 1");
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export type NotifyRequest = {
  subject?: unknown;
  body?: unknown;
  dry_run?: unknown;
  confirm?: unknown;
};

export type NotifyPlan =
  | { ok: true; subject: string; body: string; dryRun: boolean }
  | { ok: false; error: string };

/**
 * Validate a request into a plan.
 *
 * Two deliberate frictions, because the first real use of this will be a bad
 * day and the interface should not be discovered then:
 *
 *   - `dry_run` defaults to TRUE. Sending requires asking for it.
 *   - a live send additionally requires `confirm: "SEND"`. A malformed client,
 *     a repeated curl from shell history, or a mistyped flag cannot mail every
 *     user by accident.
 */
export function planNotification(req: NotifyRequest): NotifyPlan {
  const subject = typeof req.subject === "string" ? req.subject.trim() : "";
  const body = typeof req.body === "string" ? req.body.trim() : "";
  if (subject.length < 4) return { ok: false, error: "subject is required" };
  if (body.length < 20) {
    return { ok: false, error: "body is required, and a notice this short is likely a mistake" };
  }
  const dryRun = req.dry_run !== false;
  if (!dryRun && req.confirm !== "SEND") {
    return { ok: false, error: 'a live send requires confirm: "SEND"' };
  }
  return { ok: true, subject, body, dryRun };
}
