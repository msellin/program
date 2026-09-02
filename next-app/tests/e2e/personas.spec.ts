import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { PERSONAS, personaArchetype } from "./harness/personas";
import { runSimulationV2 } from "./harness/simulator-v2";
import { buildRoutes, DEFAULT_VIEWPORTS, runTour } from "./harness/tour";
import { runFlows } from "./harness/flows";
import { buildCoverage, writeCoverage, writeFleetSummary, collectReports } from "./harness/coverage";
import { resetTestUser } from "./setup-test-user";
import { REGION_BY_ID } from "../../src/lib/symptom-regions";

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

// Parallel (2026-08-25). This was serial from the days when every persona
// shared one test account; each persona now resets and signs in as its OWN
// user (`persona.email`), so they no longer contend for anything. A full
// sweep is ~15 personas × 2-3.5 min — serial that is 40+ minutes of
// wall-clock for work that is embarrassingly parallel.
test.describe.configure({ mode: "parallel" });

// Coverage check — warn if a shipped catalog program has no persona.
// Reads the manifest directly so no test-time server call needed.
// Matches the `feedback_harness-persona-coverage.md` rule: every
// shipped program must have at least one persona.
/**
 * The morning check must ask what the program declares.
 *
 * Until 2026-09-02 it rendered four hardcoded fields — the hip program's
 * clinical map — for every program, under three label maps that all wrote to
 * the same four keys. `first-strict-pullup` authors `elbow_symptom_score`
 * because medial epicondylitis is the classic pull-up injury; there was no
 * elbow field, so the engine could not see it. One of those label maps also
 * relabelled `groin_left` as "Wrist", writing wrist scores into the groin key
 * and poisoning the multi-year record.
 *
 * Unit tests cover `regionsForProgram`. This asserts the labels actually reach
 * the rendered check for a real signed-in persona, which is the part a unit
 * test cannot see. Skips when artifacts are absent so a targeted run does not
 * fail on a missing capture.
 */
test("harness coverage: the check asks each program's declared regions", async () => {
  const dataDir = path.join(__dirname, "..", "..", "public", "data", "programs");
  const missing: string[] = [];

  for (const persona of PERSONAS) {
    const checkFile = path.join(ARTIFACT_ROOT, persona.id, "text", "13-check.txt");
    if (!fs.existsSync(checkFile)) continue;
    const programFile = path.join(dataDir, `${persona.programSlug}.json`);
    if (!fs.existsSync(programFile)) continue;

    const program = JSON.parse(fs.readFileSync(programFile, "utf8")) as {
      symptom_regions?: string[];
    };
    const captured = fs.readFileSync(checkFile, "utf8");
    for (const id of program.symptom_regions ?? []) {
      const region = REGION_BY_ID[id];
      if (!region) {
        missing.push(`${persona.id}: unknown region id "${id}"`);
        continue;
      }
      if (!captured.includes(region.label)) {
        missing.push(`${persona.id} (${persona.programSlug}): check is missing "${region.label}"`);
      }
    }
  }

  expect(missing, missing.join("\n")).toEqual([]);
});

test("harness coverage: every shipped program has a persona", async () => {
  const manifestPath = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "data",
    "programs",
    "manifest.json",
  );
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
    programs: Array<{
      slug: string;
      status?: string;
      personal?: boolean;
    }>;
  };
  // 2026-09-01 — this filter excluded PROVISIONAL but not DRAFT. P0-9
  // (2026-08-19) renamed PROVISIONAL to DRAFT and updated the catalog filter
  // in programs/page.tsx, but missed this one. Result: the coverage check
  // counted unshipped drafts as shipped and warned about them every run —
  // noise that trains you to ignore the warning, which is the one thing a
  // coverage gate must not become. Mirrors the catalog filter exactly.
  const shipped = manifest.programs.filter(
    (p) =>
      !p.personal &&
      p.status !== "DRAFT" &&
      p.status !== "draft" &&
      p.status !== "PROVISIONAL",
  );
  const coveredSlugs = new Set<string>();
  for (const persona of PERSONAS) {
    coveredSlugs.add(persona.programSlug);
    for (const extra of persona.additionalProgramSlugs ?? []) {
      coveredSlugs.add(extra);
    }
  }
  const missing = shipped
    .map((p) => p.slug)
    .filter((slug) => !coveredSlugs.has(slug));
  if (missing.length > 0) {
    console.warn(
      `⚠ persona coverage gap: shipped programs without persona bundle: ${missing.join(", ")}. ` +
        `Add a persona to next-app/tests/e2e/harness/personas.ts before running audits.`,
    );
  }
  // Not a hard fail — a new program shipping without a persona shouldn't
  // block the harness from running. But the warning is loud enough to
  // catch in CI logs + local runs. Turn to expect.fail if the founder
  // wants strict enforcement later.
  expect(missing.length).toBeLessThanOrEqual(shipped.length);
});

for (const persona of PERSONAS) {
  test(`persona · ${persona.id} · ${persona.programSlug} · day ${persona.days}`, async ({
    page,
  }) => {
    // Raised from 360s (2026-08-25). The per-persona budget was set when a
    // sweep was sim + a 17-route tour; it is now sim + a 24-route tour +
    // 10 interaction flows, run 5-wide so workers share CPU. persona-strength
    // tipped over the old ceiling and failed at the very last step.
    test.setTimeout(900_000);

    const outDir = path.join(ARTIFACT_ROOT, persona.id);
    fs.mkdirSync(outDir, { recursive: true });

    // Fresh auth uid → no residual state rows.
    await resetTestUser(persona.email, persona.password);

    // Sign in with this persona's credentials (not the shared fixture).
    //
    // Cookies are cleared first (2026-08-25). persona-strength failed two
    // consecutive prod sweeps here, burning the full 900s test budget
    // waiting for `input[type="email"]` that never appeared: a session
    // cookie left over from a prior run makes /sign-in/ redirect straight
    // to Day, so the form never renders. Nothing downstream can recover
    // from that, and the persona dies before a single flow runs.
    await page.context().clearCookies();
    await page.goto("/sign-in/");
    // Bounded so a non-rendering form fails fast and legibly instead of
    // consuming the whole budget.
    await page
      .locator('input[type="email"]')
      .waitFor({ state: "visible", timeout: 30_000 });
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
      additionalProgramSlugs: persona.additionalProgramSlugs,
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

    // Flows — the interaction pass. Runs AFTER the tour on purpose: flows
    // log real sets, and doing that first would leave every tour
    // screenshot showing a session already under way. See
    // dev/audits/app/2026-08-24-persona-coverage-audit.md for why the
    // sweep had no interaction layer until now.
    const flowResults = await runFlows(page, {
      outDir,
      programSlug: persona.programSlug,
    });
    const skippedFlows = flowResults.filter((f) => f.status === "skipped");
    if (skippedFlows.length > 0) {
      console.log(
        `[${persona.id}] flows skipped: ` +
          skippedFlows.map((f) => `${f.id} (${f.reason})`).join(", "),
      );
    }
    const erroredFlows = flowResults.filter((f) => f.status === "error");
    if (erroredFlows.length > 0) {
      console.warn(
        `[${persona.id}] flows errored: ` +
          erroredFlows.map((f) => `${f.id} (${f.reason})`).join(", "),
      );
    }

    // Store state AFTER the flows, so the coverage numbers reflect
    // everything the sweep actually produced.
    const postFlowStore = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("program.log.v2") ?? "{}"),
    );
    const coverage = buildCoverage({
      personaId: persona.id,
      activeSlug: persona.programSlug,
      touredPaths: routes.map((r) => r.path),
      flows: flowResults,
      store: postFlowStore,
    });
    writeCoverage(outDir, coverage);

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

// Reads the per-persona files off disk rather than an in-memory array —
// with parallel workers each worker only sees its own share. Runs in every
// worker; last one to finish writes the complete picture.
test.afterAll(() => {
  writeFleetSummary(ARTIFACT_ROOT, collectReports(ARTIFACT_ROOT));
});

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
