import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { PERSONAS, personaArchetype } from "./harness/personas";
import { runSimulationV2 } from "./harness/simulator-v2";
import { buildRoutes, DEFAULT_VIEWPORTS, runTour } from "./harness/tour";
import { resetTestUser } from "./setup-test-user";

const ARTIFACT_ROOT = "tests/e2e/artifacts/personas";
// Per-persona start date: today - persona.days, so the sim ends
// exactly on today. Prior fixed "2026-07-01" ran the sim ending
// 20-45 days before the tour capture, which starved
// evaluateOverperformer's 7-day recency filter and hid every
// overperformer / cycle-end proposal. Delta audit 2026-08-19.
function computeStartDate(personaDays: number): string {
  const t = new Date();
  t.setDate(t.getDate() - personaDays);
  return t.toISOString().slice(0, 10);
}

test.describe.configure({ mode: "serial" });

for (const persona of PERSONAS) {
  test(`persona · ${persona.id} · ${persona.programSlug} · day ${persona.days}`, async ({
    page,
  }) => {
    test.setTimeout(360_000);

    const outDir = path.join(ARTIFACT_ROOT, persona.id);
    fs.mkdirSync(outDir, { recursive: true });

    // Fresh auth uid → no residual state rows.
    await resetTestUser(persona.email, persona.password);

    // Sign in with this persona's credentials (not the shared fixture).
    await page.goto("/sign-in/");
    await page.fill('input[type="email"]', persona.email);
    await page.fill('input[type="password"]', persona.password);
    await Promise.all([
      page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), { timeout: 20_000 }),
      page.click('button[type="submit"]'),
    ]);

    // Dismiss onboarding modal if present.
    const skip = page
      .getByRole("button", { name: /^skip setup$/i })
      .or(page.getByRole("link", { name: /^skip setup$/i }));
    try {
      await skip.click({ timeout: 3000 });
    } catch {
      /* no modal */
    }

    // Run the simulation to a settled state.
    // snapshotDays: [] — mid-sim snapshots trigger a page.goto("/") that
    // remounts StoreHydrator, which resets local + wipes state (see below,
    // and the KV push after the sim). The tour phase takes full screenshots
    // at real-clock time; the mid-sim ones are redundant for personas.
    const simResult = await runSimulationV2(page, {
      archetype: personaArchetype(persona),
      programSlug: persona.programSlug,
      tier: persona.tier,
      startDate: computeStartDate(persona.days),
      days: persona.days,
      snapshotDays: [],
      screenshotDir: path.join(outDir, "sim-snapshots"),
    });

    fs.writeFileSync(
      path.join(outDir, "final-store.json"),
      JSON.stringify(simResult.finalStore, null, 2),
      "utf8",
    );

    // Advance the mocked clock to now so route timestamps look real for the tour.
    await page.clock.setSystemTime(new Date()).catch(() => {});

    // Pre-dismiss the first-run intro gallery for this program so tour
    // screenshots capture actual UI, not the overlay.
    await page.evaluate((slug) => {
      localStorage.setItem(`program.intro-gallery.seen.${slug}`, "1");
      localStorage.setItem("program.firstrun.dismissed", "1");
    }, persona.programSlug);

    // Push the simulated state directly to Supabase Postgres so tour
    // navigations survive StoreHydrator's session-mismatch reset. Without
    // this, every page.goto during the tour remounts StoreHydrator,
    // in-memory Zustand is empty, so `sessionUid !== storedUid` fires and
    // wipes localStorage — and pullRemote then fetches an empty server
    // state. Previously we PUT to /api/state (a KV shim); that endpoint
    // was retired in commit 8c3ffc9 when we migrated to Postgres — the
    // route is gone and the PUT returned 405, silently voiding every
    // persona's tour artifacts. Now we upsert to `user_states` via the
    // Supabase REST API directly, matching what PostgresAdapter.writeLive
    // does at src/lib/persistence/postgres-adapter.ts:66. Fixed 2026-08-18.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnon) {
      throw new Error("Missing SUPABASE URL / anon key in env — persona harness cannot push state");
    }
    const dbPushed = await page.evaluate(async (args) => {
      const raw = localStorage.getItem("program.log.v2");
      if (!raw) return { ok: false, reason: "no localStorage store" };
      // Supabase SSR client stores session in cookies (base64-encoded JSON)
      // under `sb-<project-ref>-auth-token`. Multi-part cookies use `.0`, `.1`.
      const cookies = document.cookie.split("; ");
      const authParts = cookies
        .filter((c) => /^sb-[^=]+-auth-token(\.\d+)?=/.test(c))
        .sort()
        .map((c) => decodeURIComponent(c.split("=")[1] ?? ""));
      if (authParts.length === 0) return { ok: false, reason: "no supabase auth cookie" };
      let joined = authParts.join("");
      if (joined.startsWith("base64-")) {
        try {
          joined = atob(joined.slice("base64-".length));
        } catch {
          return { ok: false, reason: "base64 decode failed" };
        }
      }
      let token: string | null = null;
      let userId: string | null = null;
      try {
        const parsed = JSON.parse(joined) as {
          access_token?: string;
          user?: { id?: string };
        };
        token = parsed.access_token ?? null;
        userId = parsed.user?.id ?? null;
      } catch (e) {
        return { ok: false, reason: `parse failed: ${(e as Error).message}` };
      }
      if (!token) return { ok: false, reason: "no access_token" };
      if (!userId) return { ok: false, reason: "no user id in cookie payload" };
      let store: unknown;
      try {
        store = JSON.parse(raw);
      } catch (e) {
        return { ok: false, reason: `local store parse: ${(e as Error).message}` };
      }
      const storeObj = store as { updated_at?: number };
      const body = {
        user_id: userId,
        store,
        updated_at: storeObj.updated_at ?? Date.now(),
      };
      const res = await fetch(`${args.supabaseUrl}/rest/v1/user_states`, {
        method: "POST",
        headers: {
          apikey: args.supabaseAnon,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(body),
      });
      const text = res.ok ? "" : await res.text().catch(() => "");
      return { ok: res.ok, status: res.status, body: text.slice(0, 200) };
    }, { supabaseUrl, supabaseAnon });
    if (!dbPushed.ok) {
      console.warn(`[${persona.id}] Postgres push before tour failed:`, dbPushed);
    }

    // Walk every user-facing route at mobile + desktop.
    const routes = buildRoutes(persona.programSlug);
    const tourResults = await runTour(page, {
      routes,
      viewports: DEFAULT_VIEWPORTS,
      outDir,
      personaId: persona.id,
    });

    fs.writeFileSync(
      path.join(outDir, "persona.json"),
      JSON.stringify(
        {
          id: persona.id,
          displayName: persona.displayName,
          archetypeId: persona.archetypeId,
          programSlug: persona.programSlug,
          days: persona.days,
          focus: persona.focus,
          simulatedAt: new Date().toISOString(),
          simSummary: summariseStore(simResult.finalStore),
          tourSummary: {
            routes: tourResults.length,
            errored: tourResults.filter((r) => r.status === "error").length,
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    // Non-fatal: log any failed routes so the report notes them, but keep going.
    const failed = tourResults.filter((r) => r.status === "error");
    if (failed.length > 0) {
      console.warn(
        `[${persona.id}] tour errors on ${failed.length} route(s):`,
        failed.map((f) => `${f.slug}=${f.error}`).join(", "),
      );
    }

    expect(tourResults.length).toBeGreaterThan(0);
  });
}

function summariseStore(store: unknown): Record<string, unknown> {
  const s = (store ?? {}) as {
    logs?: Record<string, unknown>;
    skipped?: Record<string, unknown>;
    day_adjustments?: Record<string, unknown>;
    dismissed_proposals?: Record<string, unknown>;
    training_maxes?: Record<string, number>;
  };
  return {
    logs_count: Object.keys(s.logs ?? {}).length,
    skipped_count: Object.keys(s.skipped ?? {}).length,
    day_adjustments_count: Object.keys(s.day_adjustments ?? {}).length,
    dismissed_proposals_count: Object.keys(s.dismissed_proposals ?? {}).length,
    training_maxes: s.training_maxes ?? {},
  };
}
