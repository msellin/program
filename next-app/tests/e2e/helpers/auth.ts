import type { Page } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import * as fs from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";

const envPath = path.resolve(__dirname, "..", "..", "..", ".env.local");
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

/**
 * Sign a TEST user in without the sign-in form (2026-10-29).
 *
 * Once Supabase captcha is on (SG-08), the form needs a Turnstile token that a headless run cannot earn, so every
 * spec that signs in through `/sign-in/` would fail before it reached the screen it tests. This mints a session
 * with the service key instead — admin magic link → `/verify` returns the session (captcha does not cover verify) —
 * and writes it with `@supabase/ssr`'s own cookie adapter, so the cookie is exactly what the app's browser client
 * reads. Specs that test the sign-in screen itself keep using the form.
 *
 * Same fences as `setup-test-user.ts`: only `e2e-` emails, never the founder's uid.
 */
const NEVER_TOUCH_UIDS = new Set(["264f7559-f1f0-4511-93ab-f3ebedc07cee"]);

export async function signInViaApi(page: Page, email: string): Promise<void> {
  if (!email.startsWith("e2e-")) throw new Error(`SAFETY: refusing to mint a session for non-test email "${email}"`);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !service || !anon) throw new Error("Missing Supabase env in .env.local — cannot mint a test session");

  const link = await fetch(`${url}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: { apikey: service, Authorization: `Bearer ${service}`, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", email }),
  });
  if (!link.ok) throw new Error(`generate_link ${link.status}: ${await link.text()}`);
  const { hashed_token, properties, user_id, id } = (await link.json()) as {
    hashed_token?: string;
    properties?: { hashed_token?: string };
    user_id?: string;
    id?: string;
  };
  const uid = user_id ?? id ?? "";
  if (NEVER_TOUCH_UIDS.has(uid)) throw new Error("SAFETY: refusing to mint a session for a protected uid");
  const token_hash = properties?.hashed_token ?? hashed_token;
  if (!token_hash) throw new Error("generate_link returned no hashed_token");

  const verified = await fetch(`${url}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: anon, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", token_hash }),
  });
  if (!verified.ok) throw new Error(`verify ${verified.status}: ${await verified.text()}`);
  const session = (await verified.json()) as { access_token: string; refresh_token: string };

  const written: { name: string; value: string }[] = [];
  const supabase = createServerClient(url, anon, {
    // Realtime is never used here, and this Node has no global WebSocket for the client to construct one with.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    realtime: { transport: class {} as any },
    cookies: {
      getAll: () => written,
      setAll: (cookies) => {
        for (const c of cookies) {
          const i = written.findIndex((w) => w.name === c.name);
          if (i >= 0) written.splice(i, 1);
          if (c.value) written.push({ name: c.name, value: c.value });
        }
      },
    },
  });
  const { error } = await supabase.auth.setSession(session);
  if (error) throw error;

  const base = new URL(page.url().startsWith("http") ? page.url() : (process.env.E2E_BASE_URL ?? "https://app.terav.fit"));
  await page.context().addCookies(
    written.map((c) => ({ name: c.name, value: c.value, domain: base.hostname, path: "/", sameSite: "Lax" as const })),
  );
}
