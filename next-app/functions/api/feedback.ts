/**
 * POST /api/feedback — beta feedback from inside the app.
 *
 * Auth: Supabase JWT in `Authorization: Bearer <token>`.
 *
 * Why it exists
 * -------------
 * Beta users had no way to say anything. The app asks people to log symptoms
 * daily and to Accept or Ignore what an engine proposes, and offered them no
 * channel to report that a proposal made no sense. The only route was knowing
 * the founder personally — which describes the current beta and not the next
 * one.
 *
 * Deliberate shape
 * ----------------
 *   - SIGNED IN ONLY. An open relay that sends mail is a spam vector, and an
 *     unauthenticated endpoint that mails a fixed address is exactly that. The
 *     JWT is verified against Supabase before anything is sent.
 *   - The address comes from the VERIFIED TOKEN, never from the body. A user
 *     cannot make feedback appear to come from someone else.
 *   - The body carries a length cap. Resend has its own limits and hitting
 *     them produces a 4xx a user cannot act on, so it is rejected here with a
 *     message that says what to do.
 *   - `reply_to` is set to the sender, so answering it is one tap and does not
 *     require copying an address out of the body.
 *   - Context (route, programme, app version) is appended by the CLIENT and
 *     travels in the body — this endpoint does not read the user's store. A
 *     feedback channel is not a reason to grant a mail function access to
 *     health data.
 *
 * Env bindings required on the Pages project (see CLAUDE.md, runtime section):
 *   SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, RESEND_API_KEY
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  RESEND_API_KEY: string;
}

const FROM = "Terav <notices@terav.fit>";
const TO = "sellinmargus@gmail.com";
const MAX_MESSAGE = 4000;
const MAX_CONTEXT = 500;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function requireUser(
  request: Request,
  env: Env,
): Promise<{ uid: string; email: string } | Response> {
  const auth =
    request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return json({ error: "Sign in to send feedback." }, 401);
  }
  const token = auth.slice(7).trim();
  if (!token) return json({ error: "Sign in to send feedback." }, 401);
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    return json({ error: "Auth not configured" }, 500);
  }
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_PUBLISHABLE_KEY,
      authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return json({ error: "Session expired. Sign in again." }, 401);
  const body = (await res.json()) as { id?: string; email?: string };
  if (!body.id || !body.email) return json({ error: "Invalid session" }, 401);
  return { uid: body.id, email: body.email };
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const who = await requireUser(request, env);
  if (who instanceof Response) return who;

  let payload: { message?: unknown; context?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return json({ error: "Malformed request." }, 400);
  }

  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const context = typeof payload.context === "string" ? payload.context.trim() : "";

  if (!message) return json({ error: "Write something first." }, 400);
  if (message.length > MAX_MESSAGE) {
    return json(
      { error: `That is longer than ${MAX_MESSAGE} characters. Trim it, or email directly.` },
      400,
    );
  }
  if (context.length > MAX_CONTEXT) {
    return json({ error: "Context too long." }, 400);
  }

  if (!env.RESEND_API_KEY) {
    // Explicit, because the silent version of this is a user typing out a
    // considered bug report and watching it disappear.
    return json({ error: "Feedback is not configured yet. Sorry — email instead." }, 503);
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: who.email,
      subject: `Terav feedback — ${who.email}`,
      text: [message, "", "---", `from: ${who.email}`, `uid: ${who.uid}`, context]
        .filter(Boolean)
        .join("\n"),
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return json({ error: "Could not send. Try again shortly.", status: res.status, detail }, 502);
  }
  return json({ ok: true });
};

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  return json({ error: "Router mismatch" }, 500);
};
