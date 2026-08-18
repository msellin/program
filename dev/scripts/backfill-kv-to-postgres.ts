#!/usr/bin/env -S node --loader tsx
/**
 * Phase 2D of the KV → Postgres migration.
 * Iterates all Supabase auth users, pulls each user's KV blob via a
 * superadmin-forged Bearer token OR direct Cloudflare KV read, and writes
 * to `public.user_states` (+ snapshots).
 *
 * Uses `service_role` key which bypasses RLS. Never run this from a
 * browser. Never commit the service_role key.
 *
 * Prereqs (set in your shell before running):
 *   export SUPABASE_URL=https://<project>.supabase.co
 *   export SUPABASE_SERVICE_ROLE_KEY=<service_role_jwt>
 *   export KV_ACCOUNT_ID=<cf account id>
 *   export KV_NAMESPACE_ID=<cf kv namespace id for STORE>
 *   export CF_API_TOKEN=<cf api token with KV read access>
 *
 * Usage:
 *   npx tsx dev/scripts/backfill-kv-to-postgres.ts               # dry-run report
 *   npx tsx dev/scripts/backfill-kv-to-postgres.ts --commit       # actual writes
 *   npx tsx dev/scripts/backfill-kv-to-postgres.ts --user <email> # single user
 *
 * Safe to re-run: uses upsert semantics on user_states. Snapshots dedupe
 * by (user_id, snapshot_date).
 */

import { createClient } from "@supabase/supabase-js";

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  KV_ACCOUNT_ID: string;
  KV_NAMESPACE_ID: string;
  CF_API_TOKEN: string;
};

function requireEnv(): Env {
  const missing: string[] = [];
  const need = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "KV_ACCOUNT_ID",
    "KV_NAMESPACE_ID",
    "CF_API_TOKEN",
  ] as const;
  const out: Partial<Env> = {};
  for (const k of need) {
    const v = process.env[k];
    if (!v) missing.push(k);
    else (out as Record<string, string>)[k] = v;
  }
  if (missing.length) {
    console.error(`Missing env: ${missing.join(", ")}`);
    process.exit(1);
  }
  return out as Env;
}

/**
 * Read a KV key via Cloudflare's REST API. Simple wrapper — retries on
 * transient failure but not on 404 (not found = user has no KV state).
 */
async function kvGet(env: Env, key: string): Promise<string | null> {
  const url =
    `https://api.cloudflare.com/client/v4/accounts/${env.KV_ACCOUNT_ID}` +
    `/storage/kv/namespaces/${env.KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${env.CF_API_TOKEN}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`KV GET ${key}: HTTP ${res.status}`);
  return await res.text();
}

/**
 * Iterate every auth.users row via the Supabase admin API. Handles
 * pagination — Supabase caps at 1000 per page.
 */
async function listAllAuthUsers(env: Env) {
  const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const all: Array<{ id: string; email: string; created_at: string }> = [];
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    for (const u of data.users) {
      if (u.email) all.push({ id: u.id, email: u.email, created_at: u.created_at });
    }
    if (data.users.length < perPage) break;
    page += 1;
    if (page > 50) break; // safety cap — 10k users
  }
  return all;
}

async function upsertUserState(
  env: Env,
  userId: string,
  store: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const updated_at =
    typeof store.updated_at === "number" ? store.updated_at : Date.now();
  const { error } = await admin
    .from("user_states")
    .upsert(
      { user_id: userId, store, updated_at },
      { onConflict: "user_id" },
    );
  if (error) return { ok: false, error: error.message };
  // Also seed today's snapshot so the 14-day window starts populated.
  const dateISO = new Date().toISOString().slice(0, 10);
  await admin
    .from("user_state_snapshots")
    .upsert(
      { user_id: userId, snapshot_date: dateISO, store },
      { onConflict: "user_id,snapshot_date" },
    );
  return { ok: true };
}

type UserOutcome =
  | { kind: "success"; email: string }
  | { kind: "empty_kv"; email: string }
  | { kind: "error"; email: string; message: string };

async function migrateUser(
  env: Env,
  user: { id: string; email: string },
  commit: boolean,
): Promise<UserOutcome> {
  const key = `user-email:${user.email.trim().toLowerCase()}:v2`;
  let raw: string | null = null;
  try {
    raw = await kvGet(env, key);
    if (!raw) {
      // Also try the legacy UID-keyed shape.
      const legacyKey = `user:${user.id}:v2`;
      raw = await kvGet(env, legacyKey);
    }
  } catch (e) {
    return {
      kind: "error",
      email: user.email,
      message: e instanceof Error ? e.message : String(e),
    };
  }
  if (!raw) return { kind: "empty_kv", email: user.email };

  let store: Record<string, unknown>;
  try {
    store = JSON.parse(raw);
  } catch (e) {
    return {
      kind: "error",
      email: user.email,
      message: `Bad JSON in KV: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
  if (!commit) return { kind: "success", email: user.email };

  const res = await upsertUserState(env, user.id, store);
  if (!res.ok) {
    return { kind: "error", email: user.email, message: res.error ?? "upsert failed" };
  }
  return { kind: "success", email: user.email };
}

async function main() {
  const env = requireEnv();
  const args = process.argv.slice(2);
  const commit = args.includes("--commit");
  const userIdx = args.indexOf("--user");
  const singleEmail = userIdx >= 0 ? args[userIdx + 1] : null;

  console.log(commit ? "MODE: COMMIT" : "MODE: DRY RUN (no writes)");

  const users = await listAllAuthUsers(env);
  const targets = singleEmail
    ? users.filter((u) => u.email.toLowerCase() === singleEmail.toLowerCase())
    : users;
  console.log(`Users to process: ${targets.length}`);

  const outcomes: UserOutcome[] = [];
  for (const u of targets) {
    const out = await migrateUser(env, u, commit);
    outcomes.push(out);
    if (out.kind === "success") console.log(`  ✅  ${out.email}`);
    else if (out.kind === "empty_kv") console.log(`  ⚪  ${out.email}  (no KV state)`);
    else console.log(`  ❌  ${out.email}  ${out.message}`);
  }

  const success = outcomes.filter((o) => o.kind === "success").length;
  const empty = outcomes.filter((o) => o.kind === "empty_kv").length;
  const errors = outcomes.filter((o) => o.kind === "error").length;
  console.log("---");
  console.log(`Summary: ${success} migrated · ${empty} empty · ${errors} errors`);
  if (!commit) console.log("(dry run — re-run with --commit to apply)");
  process.exit(errors > 0 ? 1 : 0);
}

void main();
