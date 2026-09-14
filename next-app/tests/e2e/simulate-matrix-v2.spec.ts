import { test as base, expect } from "./fixtures";
import { resetTestUser } from "./setup-test-user";
import { runSimulationV2 } from "./harness/simulator-v2";
import type { Page } from "@playwright/test";
import { ARCHETYPES } from "./harness/archetype";
import * as fs from "node:fs";
import * as path from "node:path";

const SIM_ROOT = "tests/e2e/screenshots/matrix-v2";
const START_DATE = "2026-08-12";
const DAYS = 90;

const MATRIX: Array<{ archetype: keyof typeof ARCHETYPES; program: string; tier?: string }> = [
  { archetype: "consistent-average", program: "anterior-hip-rebuild" },
  { archetype: "overperformer", program: "anterior-hip-rebuild" },
  { archetype: "underperformer", program: "anterior-hip-rebuild" },
  { archetype: "erratic", program: "anterior-hip-rebuild" },
  { archetype: "injured-recovery", program: "anterior-hip-rebuild" },
  /**
   * Added 2026-09-14. Every cell above is `anterior-hip-rebuild` — the one
   * programme in the manifest marked `personal: true`. Nine programmes ship
   * and the engine matrix exercised exactly one of them, which is the same
   * shape as the morning check that rendered this same programme's body map
   * to everybody: one person's configuration standing in for the product.
   *
   * `g3-analytical-verification.md` asked for this specifically. A1's
   * off-cycle TM bump cannot fire on hip-rebuild under the current archetype
   * because the simulator writes at cycle boundaries, so the overperformer
   * path had never been exercised anywhere.
   */
  { archetype: "overperformer", program: "concurrent-strength-maintenance" },
];

/**
 * The matrix gets its OWN account, reset before every cell.
 *
 * Every cell used to run through the shared `authedPage` fixture, which calls
 * `ensureTestUser()` -- idempotent, reuses the account if it exists -- and
 * never resets anything. Six "independent" 90-day simulations were therefore
 * six views of one accumulating Supabase row. The evidence was sitting in the
 * artifacts the whole time and nothing read it: all six cells reported an
 * identical `active_program_started_at` stamped days before the run, an
 * identical `logs_count` of 61, and identical `training_maxes` across two
 * different programmes. The first 29 of 90 simulated days fell before that
 * inherited start date and were silently dropped -- which is the entire
 * symptomatic window of `injured-recovery`, the one archetype the matrix has
 * for someone training while hurt.
 *
 * Clearing localStorage is not enough: the app rehydrates from the server on
 * sign-in, and the stale start date came straight back. The account itself has
 * to go, so `user_states` cascades with it.
 *
 * A separate email from `e2e-baseline@` so resetting the matrix cannot pull
 * the ground out from under the other specs. Both are `e2e-` prefixed, which
 * is what `setup-test-user.ts`'s safety fence requires before it will touch
 * anything.
 */
const MATRIX_EMAIL = "e2e-matrix@margus.dolmit.dev";
const MATRIX_PASSWORD = "TestPassword123!";

const test = base.extend<{ freshPage: Page }>({
  freshPage: async ({ page }, use) => {
    await resetTestUser(MATRIX_EMAIL, MATRIX_PASSWORD);
    await page.goto("/sign-in/");
    await page.fill('input[type="email"]', MATRIX_EMAIL);
    await page.fill('input[type="password"]', MATRIX_PASSWORD);
    await Promise.all([
      page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), { timeout: 15_000 }),
      page.click('button[type="submit"]'),
    ]);
    const skip = page
      .getByRole("button", { name: /^skip setup$/i })
      .or(page.getByRole("link", { name: /^skip setup$/i }));
    try {
      await skip.click({ timeout: 3000 });
    } catch {
      /* no modal */
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

test.describe.configure({ mode: "serial" });

for (const { archetype, program, tier } of MATRIX) {
  const label = `v2 · ${archetype} × ${program}${tier ? ` @ ${tier}` : ""}`;
  test(label, async ({ freshPage: page }) => {
    test.setTimeout(240_000);
    const dir = path.join(SIM_ROOT, `${archetype}_${program}${tier ? "_" + tier : ""}`);
    fs.mkdirSync(dir, { recursive: true });

    const result = await runSimulationV2(page, {
      archetype: ARCHETYPES[archetype],
      programSlug: program,
      tier,
      startDate: START_DATE,
      days: DAYS,
      snapshotDays: [0, 30, 60, 90],
      screenshotDir: dir,
      // Each cell is meant to be an independent 90-day simulation. Without
      // this they were six views of one accumulating account -- see the
      // `resetStore` docblock in simulator-v2.ts.
      resetStore: true,
    });

    const finalStore = result.finalStore as {
      logs?: Record<string, unknown>;
      skipped?: Record<string, unknown>;
      day_adjustments?: Record<string, unknown>;
      dismissed_proposals?: Record<string, unknown>;
      training_maxes?: Record<string, number>;
    };

    fs.writeFileSync(
      path.join(dir, "result.json"),
      JSON.stringify(
        {
          archetypeId: result.archetypeId,
          programSlug: result.programSlug,
          daysSimulated: result.daysSimulated,
          summary: {
            logs_count: Object.keys(finalStore.logs ?? {}).length,
            skipped_count: Object.keys(finalStore.skipped ?? {}).length,
            day_adjustments_count: Object.keys(finalStore.day_adjustments ?? {}).length,
            training_maxes: finalStore.training_maxes ?? {},
          },
        },
        null,
        2,
      ),
    );
    fs.writeFileSync(path.join(dir, "final-store.json"), JSON.stringify(result.finalStore, null, 2));

    /**
     * The matrix had no assertions at all until 2026-09-14. Six cells passed
     * for as long as the simulator did not throw, which is how six views of
     * one contaminated account read as a green engine matrix for weeks.
     *
     * These are deliberately few and deliberately true today. An assertion
     * nobody can satisfy gets commented out; an assertion that restates the
     * implementation catches nothing.
     *
     * Only #3 would actually have caught the contamination — checked against
     * the pre-fix artifacts rather than assumed. #1, #2 and #4 all passed on
     * the contaminated stores, because inherited rows still land inside the
     * simulated window and the skip counts were genuinely being written. They
     * are kept because they cover different failure modes (a no-op simulator,
     * rows from outside the window, an archetype whose decisions never reach
     * the store), not because they would have caught this one.
     */
    const logDates = Object.keys(finalStore.logs ?? {}).sort();

    // 1. The simulator actually did something. Zero here means every
    //    assertion underneath is vacuous, which is the failure mode that
    //    makes a silent harness dangerous rather than merely useless.
    expect(logDates.length, "no days were logged — the simulation no-opped").toBeGreaterThan(0);

    // 2. No day may fall outside the window this cell simulated. Inherited
    //    rows from an earlier sweep land outside it, which is exactly what
    //    the pre-fix artifacts contained.
    const first = new Date(START_DATE + "T00:00:00Z").getTime();
    const last = first + (DAYS + 1) * 864e5;
    for (const d of [logDates[0], logDates[logDates.length - 1]]) {
      const t = new Date(d + "T00:00:00Z").getTime();
      expect(t, `logged date ${d} precedes the simulated window`).toBeGreaterThanOrEqual(first);
      expect(t, `logged date ${d} runs past the simulated window`).toBeLessThanOrEqual(last);
    }

    // 3. The archetype has to leave its signature on the store. Before the
    //    isolation fix every cell reported back_squat_highbar = 125 —
    //    ABOVE the 120 seed, on archetypes that only ever reduce load —
    //    because the number came from a previous run rather than this one.
    const bs = finalStore.training_maxes?.back_squat_highbar;
    expect(bs, "back_squat_highbar was never seeded").toBeGreaterThan(0);
    if (archetype === "underperformer" || archetype === "erratic") {
      expect(
        bs,
        `${archetype} only reduces load, so its TM cannot exceed the 120 seed — ` +
          "a higher number means the store was inherited, not simulated",
      ).toBeLessThan(120);
    }
    if (archetype === "erratic") {
      expect(
        Object.keys(finalStore.skipped ?? {}).length,
        "the erratic archetype skips sessions; an empty skip set means its " +
          "decisions never reached the store",
      ).toBeGreaterThan(0);
    }
  });
}

/**
 * KNOWN HOLE, recorded rather than asserted (2026-09-14).
 *
 * `injured-recovery` still reports 0 skipped days and 0 adjustments over 90
 * simulated days — the profile of a healthy athlete, on the archetype that
 * exists to model someone training while hurt.
 *
 * It is not the state contamination fixed above; it survives a clean account.
 * The cause is a time-model mismatch in the simulator: the loop walks 90 days
 * from `START_DATE`, but `active_program_started_at` is stamped from the wall
 * clock at seed time, so every simulated day before that stamp falls outside
 * the programme and is discarded. Sixty of ninety days survive, and the
 * missing thirty are precisely the window where this archetype is symptomatic
 * (its `logDecision` skips days 1-6 and its symptom curve is red through the
 * first week).
 *
 * Not asserted, because a failing assertion nobody can act on gets deleted.
 * Written here instead so the next person to read a green matrix knows which
 * cell is not yet measuring anything.
 */
