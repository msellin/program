import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { PERSONAS, personaArchetype } from "./harness/personas";
import { runSimulationV2 } from "./harness/simulator-v2";
import { buildRoutes, DEFAULT_VIEWPORTS, runTour } from "./harness/tour";
import { resetTestUser } from "./setup-test-user";

const ARTIFACT_ROOT = "tests/e2e/artifacts/personas";
const START_DATE = "2026-07-01";

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
      startDate: START_DATE,
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

    // Push the simulated state to the server-side KV so tour navigations
    // survive StoreHydrator's session-mismatch reset. Without this, every
    // page.goto during the tour remounts StoreHydrator, in-memory Zustand is
    // empty, so `sessionUid !== storedUid` fires and wipes localStorage —
    // and pullRemote then fetches an empty server state. With this PUT, the
    // reset still wipes local but the async pullRemote refills it from KV.
    const kvPushed = await page.evaluate(async () => {
      const raw = localStorage.getItem("program.log.v2");
      if (!raw) return { ok: false, reason: "no localStorage store" };
      // Supabase SSR client stores session in cookies (base64-encoded JSON) under
      // `sb-<project-ref>-auth-token`. Multi-part cookies use `.0`, `.1` suffixes.
      const cookies = document.cookie.split("; ");
      const authParts = cookies
        .filter((c) => /^sb-[^=]+-auth-token(\.\d+)?=/.test(c))
        .sort() // .0, .1, .2 order
        .map((c) => decodeURIComponent(c.split("=")[1] ?? ""));
      if (authParts.length === 0) return { ok: false, reason: "no supabase auth cookie" };
      let joined = authParts.join("");
      // The SSR cookie value is base64-encoded JSON, prefixed with "base64-".
      if (joined.startsWith("base64-")) {
        try {
          joined = atob(joined.slice("base64-".length));
        } catch {
          return { ok: false, reason: "base64 decode failed" };
        }
      }
      let token: string | null = null;
      try {
        const parsed = JSON.parse(joined) as { access_token?: string };
        token = parsed.access_token ?? null;
      } catch (e) {
        return { ok: false, reason: `parse failed: ${(e as Error).message}` };
      }
      if (!token) return { ok: false, reason: "no access_token in cookie payload" };
      const res = await fetch("/api/state", {
        method: "PUT",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: raw,
      });
      return { ok: res.ok, status: res.status };
    });
    if (!kvPushed.ok) {
      console.warn(`[${persona.id}] KV push before tour failed:`, kvPushed);
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
