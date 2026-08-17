/**
 * Ensures a confirmed test user exists in Supabase so Playwright can sign in
 * without going through email confirmation. Idempotent — if the user is
 * already there, we skip creation. Uses the service role key, so this file
 * must NEVER end up in a browser bundle.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";

// Load .env.local from the next-app directory
const envPath = path.resolve(__dirname, "..", "..", ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

export const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "e2e-baseline@margus.dolmit.dev";
export const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "TestPassword123!";

// Safety fence. Any admin operation MUST target an email that begins with
// this prefix — otherwise the script refuses. This is defense-in-depth against
// bugs that accidentally target Margus's real account or another production
// user.
const TEST_EMAIL_PREFIX = "e2e-";
// Never touch this uid — it's Margus's real account.
const NEVER_TOUCH_UIDS = new Set(["264f7559-f1f0-4511-93ab-f3ebedc07cee"]);

function assertTestEmail(email: string): void {
  if (!email.startsWith(TEST_EMAIL_PREFIX)) {
    throw new Error(`SAFETY: refusing to touch non-test email "${email}". Test emails must start with "${TEST_EMAIL_PREFIX}".`);
  }
}

function assertTestUid(uid: string): void {
  if (NEVER_TOUCH_UIDS.has(uid)) {
    throw new Error(`SAFETY: refusing to touch protected uid "${uid}" (real user).`);
  }
}

async function adminGet(url: string, key: string, path: string): Promise<Response> {
  return fetch(`${url}${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
}
async function adminPost(url: string, key: string, path: string, body: unknown): Promise<Response> {
  return fetch(`${url}${path}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
async function adminPut(url: string, key: string, path: string, body: unknown): Promise<Response> {
  return fetch(`${url}${path}`, {
    method: "PUT",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
async function adminDelete(url: string, key: string, path: string): Promise<Response> {
  return fetch(`${url}${path}`, {
    method: "DELETE",
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
}

type ListUsersResponse = { users: Array<{ id: string; email: string }> };

export async function ensureTestUser(
  email: string = TEST_EMAIL,
  password: string = TEST_PASSWORD,
): Promise<{ email: string; password: string; uid: string }> {
  assertTestEmail(email);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SERVICE_ROLE_KEY — cannot create test user");
  }

  const listRes = await adminGet(url, key, "/auth/v1/admin/users?per_page=200");
  if (!listRes.ok) throw new Error(`listUsers failed: HTTP ${listRes.status} ${await listRes.text()}`);
  const list = (await listRes.json()) as ListUsersResponse;
  const found = list.users.find((u) => u.email === email);
  if (found) {
    assertTestUid(found.id);
    const upRes = await adminPut(url, key, `/auth/v1/admin/users/${found.id}`, {
      password,
      email_confirm: true,
    });
    if (!upRes.ok) throw new Error(`updateUser failed: HTTP ${upRes.status} ${await upRes.text()}`);
    return { email, password, uid: found.id };
  }

  const createRes = await adminPost(url, key, "/auth/v1/admin/users", {
    email,
    password,
    email_confirm: true,
    user_metadata: {
      accepted_terms_at: new Date().toISOString(),
      consented_symptom_data_at: new Date().toISOString(),
    },
  });
  if (!createRes.ok) throw new Error(`createUser failed: HTTP ${createRes.status} ${await createRes.text()}`);
  const created = (await createRes.json()) as { id: string; email: string };
  return { email, password, uid: created.id };
}

/**
 * Delete then recreate a test user so each persona run starts with a fresh
 * auth uid and no residual state rows. Returns the new uid.
 */
export async function resetTestUser(
  email: string,
  password: string,
): Promise<{ email: string; password: string; uid: string }> {
  await teardownTestUser(email);
  return ensureTestUser(email, password);
}

/**
 * Wipe a test user's auth account. Refuses if the email doesn't match the
 * test-prefix guard or the uid is on the never-touch list.
 */
export async function teardownTestUser(email: string): Promise<void> {
  assertTestEmail(email);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  const listRes = await adminGet(url, key, "/auth/v1/admin/users?per_page=200");
  if (!listRes.ok) return;
  const list = (await listRes.json()) as ListUsersResponse;
  const found = list.users.find((u) => u.email === email);
  if (!found) return;
  assertTestUid(found.id);
  await adminDelete(url, key, `/auth/v1/admin/users/${found.id}`);
}

// If run directly (node --loader …), execute and print.
if (require.main === module) {
  ensureTestUser()
    .then((u) => {
      console.log("Test user ready:");
      console.log("  email:", u.email);
      console.log("  uid:  ", u.uid);
    })
    .catch((e) => {
      console.error("FAILED:", e);
      process.exit(1);
    });
}
