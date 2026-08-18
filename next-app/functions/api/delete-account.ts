/**
 * DELETE /api/delete-account
 *
 * Auth: Supabase JWT in `Authorization: Bearer <token>`.
 *
 * Verifies the caller's identity against Supabase, then invokes the admin
 * API to delete the auth user. `user_states` + `user_state_snapshots`
 * cascade automatically via the FK `ON DELETE CASCADE` declared in
 * migration `20260818000001_user_states.sql`.
 *
 * The caller can only delete their OWN account — we never trust a `user_id`
 * from the request body; we resolve it from the verified JWT.
 *
 * Env bindings required on the Pages project:
 *   SUPABASE_URL             — https://<ref>.supabase.co
 *   SUPABASE_PUBLISHABLE_KEY — anon key (used to verify the JWT)
 *   SUPABASE_SERVICE_ROLE_KEY — service_role JWT (used for admin.deleteUser)
 *
 * On success, returns 200 { ok: true }. Client is expected to sign out
 * locally after the response.
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
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
    return { uid: body.id, email: body.email };
  } catch (e) {
    return json({ error: "Auth check failed", detail: (e as Error).message }, 502);
  }
}

async function deleteAuthUser(env: Env, userId: string): Promise<Response | null> {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: "Service role not configured" }, 500);
  }
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    return json(
      { error: "Auth delete failed", status: res.status, body: text },
      502,
    );
  }
  return null;
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const check = await requireUser(request, env);
  if (check instanceof Response) return check;
  const err = await deleteAuthUser(env, check.uid);
  if (err) return err;
  // user_states + user_state_snapshots cascade via FK ON DELETE CASCADE.
  return json({ ok: true, deleted_user_id: check.uid });
};

// Reject other methods explicitly so a stale client GET doesn't wake up
// with a silent success.
export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method !== "DELETE") {
    return json({ error: "Method not allowed" }, 405);
  }
  return json({ error: "Router mismatch" }, 500);
};
