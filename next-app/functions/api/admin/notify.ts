/**
 * AUDIT-1 — send a notice to every confirmed account. Admin-only, manual.
 *
 * POST /api/admin/notify
 *   { subject, body, dry_run?: boolean, confirm?: "SEND" }
 *   → { dry_run, recipients, batches, sent, failed }
 *
 * Why it exists
 * -------------
 * `legal/privacy` tells users that sub-processor changes "will be announced by
 * email", and GDPR Art. 34 requires notification within 72 hours of a breach
 * likely to affect them. Both were promises with nothing behind them: no mail
 * provider, no send path, no way to reach the account list at all.
 *
 * What it deliberately is NOT
 * ---------------------------
 * Not automated. Nothing in the app calls this — it exists to be invoked by a
 * person who has decided to send something. The promise on the privacy page is
 * about notification, not about a system that mails people on its own, and a
 * broadcast capability wired into application flow is a capability that can
 * misfire. Not marketing either: the two stated uses are breach notification
 * and sub-processor changes.
 *
 * Safety
 * ------
 *   - admin-gated on ADMIN_EMAILS, 404 rather than 403 so the surface does not
 *     confirm it exists
 *   - `dry_run` defaults to TRUE; sending requires explicitly asking for it
 *   - a live send additionally requires `confirm: "SEND"`
 *   - unconfirmed sign-ups are excluded — an address nobody proved they control
 *     is not a user, and mailing it on a breach would itself disclose that
 *     somebody tried to register with it
 *   - recipients are BCC'd one batch at a time; the response returns counts
 *     only, never addresses
 *
 * The API key is `sending_access` scoped to terav.fit — it cannot manage
 * Resend resources and cannot send as any other domain on the account.
 */
import { recipientsFrom, chunk, planNotification } from "../../../src/lib/notify";

interface Env {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ADMIN_EMAILS: string;
  RESEND_API_KEY: string;
}

const FROM = "Terav <notices@terav.fit>";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function requireAdmin(request: Request, env: Env): Promise<Response | null> {
  const auth = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!auth?.toLowerCase().startsWith("bearer ")) return json({ error: "Missing bearer token" }, 401);
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY, authorization: `Bearer ${auth.slice(7).trim()}` },
  });
  if (!res.ok) return json({ error: "Invalid session" }, 401);
  const me = (await res.json()) as { email?: string };
  const admins = (env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!me.email || !admins.includes(me.email.toLowerCase())) return json({ error: "Not found" }, 404);
  return null;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return json({ error: "Body must be JSON" }, 400);
  }
  const plan = planNotification(parsed as Record<string, unknown>);
  if (!plan.ok) return json({ error: plan.error }, 400);

  if (!env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: "Service role not configured" }, 500);

  // Emails live in auth.users, not user_states.
  const users: Array<{ email?: string | null; email_confirmed_at?: string | null }> = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=200`, {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    if (!res.ok) return json({ error: "User query failed", status: res.status }, 502);
    const body = (await res.json()) as { users?: typeof users };
    const batch = body.users ?? [];
    users.push(...batch);
    if (batch.length < 200) break;
  }

  const recipients = recipientsFrom(users);
  const batches = chunk(recipients, 100);

  if (plan.dryRun) {
    return json({
      dry_run: true,
      recipients: recipients.length,
      batches: batches.length,
      subject: plan.subject,
      note: 'Nothing was sent. Repeat with dry_run: false and confirm: "SEND".',
    });
  }

  if (!env.RESEND_API_KEY) return json({ error: "RESEND_API_KEY not configured" }, 500);

  let sent = 0;
  const failed: number[] = [];
  for (const [i, group] of batches.entries()) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        // BCC so recipients never see each other. `to` is the sender: a
        // notice that leaks the account list would be its own breach.
        to: [FROM],
        bcc: group,
        subject: plan.subject,
        text: plan.body,
      }),
    });
    if (res.ok) sent += group.length;
    else failed.push(i);
  }

  return json({ dry_run: false, recipients: recipients.length, batches: batches.length, sent, failed_batches: failed });
};

export const onRequest: PagesFunction<Env> = async ({ request }) =>
  request.method === "POST"
    ? json({ error: "Router mismatch" }, 500)
    : json({ error: "Method not allowed" }, 405);
