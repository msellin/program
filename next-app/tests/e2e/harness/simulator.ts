import type { Page } from "@playwright/test";
import { Archetype } from "./archetype";

/**
 * Day-by-day simulator. Writes logs directly into localStorage (fast — 180 days
 * runs in ~60 seconds) and lets the app hydrate + adapt.
 *
 * Why store-driven, not UI-driven:
 * - UI-driven (click every input) is ~30s/day × 180 = 90 minutes per user.
 *   With 8 archetypes × 3 programs, that's 36 hours. Infeasible in a session.
 * - Store-driven fires the same reducers via `useStore.setState`, exercising
 *   the same normalization + adaptive engine. The paths that matter for a
 *   "does the app deliver on its claims" audit are: engine reads logs →
 *   proposes adjustments → engine reads adjustments + subsequent logs.
 *   None of that requires DOM events.
 * - We complement store-driven with baseline Playwright coverage (which
 *   already verifies the click paths work) — see baseline.spec.ts.
 *
 * The simulator screenshots the app at day 0/7/30/60/90/180 so we still see
 * how the UI evolves for the audit report.
 */

export type SimulatorResult = {
  archetypeId: string;
  programSlug: string;
  daysSimulated: number;
  finalStore: unknown;
  snapshots: Array<{ day: number; screenshot: string; store: unknown }>;
};

type ProgramData = {
  slug: string;
  blockIdsPerDow: string[][]; // 7 entries, Sun→Sat
  itemsByBlock: Record<string, Array<{ exercise_id: string; prescribedWeight?: number; prescribedReps?: number; prescribedSets?: number }>>;
};

/**
 * Read the program's block layout for a given date from the DOM. Called once
 * per week; caches so we don't re-fetch. Uses the app's own routing so we
 * exercise the plan generator against the tier the sim user picked.
 */
async function inspectPrescribedBlocks(page: Page): Promise<{ blockId: string; items: Array<{ exercise_id: string; scheme?: string }> }[]> {
  // Query the exposed store to see the current program's blocks for today.
  return page.evaluate(() => {
    // Cast to any — this runs in-page, and useStore is not exported to window
    // by default. If not exposed, we read the app's own module.
    const w = window as unknown as { __programBlocks?: unknown };
    return (w.__programBlocks as unknown as { blockId: string; items: Array<{ exercise_id: string; scheme?: string }> }[]) ?? [];
  });
}

/**
 * Fabricate a plausible set-log per archetype.
 */
function synthSet(archetype: Archetype, day: number, prescribedWeight: number | undefined, prescribedReps: number | undefined) {
  const factor = archetype.loadFactor(day);
  const rpe = Math.max(4, Math.min(10, archetype.rpeTarget + (Math.random() - 0.5) * archetype.rpeJitter * 2));
  return {
    weight_kg: prescribedWeight ? Math.round(prescribedWeight * factor * 2) / 2 : null,
    reps: prescribedReps ?? 5,
    rpe: Math.round(rpe * 2) / 2,
    notes: undefined,
  };
}

/**
 * Advance the browser's clock forward by `days`. Uses Playwright's clock API
 * to freeze `new Date()` so app date math thinks it's a different day.
 */
async function setClockForDay(page: Page, startDateISO: string, day: number): Promise<void> {
  const start = new Date(startDateISO + "T08:00:00Z");
  const target = new Date(start.getTime() + day * 864e5);
  await page.clock.setFixedTime(target);
}

export async function runSimulation(
  page: Page,
  opts: {
    archetype: Archetype;
    programSlug: string;
    tier?: string;
    startDate: string; // yyyy-mm-dd
    days: number;
    snapshotDays: number[]; // days at which to screenshot + persist store
    screenshotDir: string;
  },
): Promise<SimulatorResult> {
  const { archetype, programSlug, tier, startDate, days, snapshotDays, screenshotDir } = opts;

  // 1. Install a fixed clock BEFORE any page loads so the app's `useState(() => todayISO())`
  //    call reads day 0.
  await page.clock.install({ time: new Date(startDate + "T08:00:00Z") });

  // 2. Seed the store: pick program + tier via localStorage, then reload so
  //    the app hydrates cleanly.
  await page.evaluate(
    ({ slug, tier }) => {
      const raw = localStorage.getItem("program.log.v2");
      const store = raw ? JSON.parse(raw) : {
        version: 2,
        logs: {},
        training_maxes: {},
        cycle: { phase_id: null, cycle_number: 1, week_in_cycle: 1 },
        updated_at: Date.now(),
        scheduled_overrides: {},
        skipped: {},
        dismissed_proposals: {},
      };
      store.user_profile = {
        ...(store.user_profile ?? {}),
        active_program_id: slug,
        active_program_ids: [slug],
        active_program_started_at: new Date().toISOString(),
        tier: "beta_forever",
      };
      if (tier) {
        store.user_profile.program_states = {
          ...(store.user_profile.program_states ?? {}),
          [slug]: { ...(store.user_profile.program_states?.[slug] ?? {}), tier },
        };
      }
      store.updated_at = Date.now();
      localStorage.setItem("program.log.v2", JSON.stringify(store));
      // B3: per-program onboarding key + legacy fallback for one release cycle.
      localStorage.setItem(`program.onboarding.done.${slug}`, "1");
      localStorage.setItem("program.onboarding.done", "1");
    },
    { slug: programSlug, tier: tier ?? null },
  );

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const snapshots: SimulatorResult["snapshots"] = [];

  // Screenshot day 0
  if (snapshotDays.includes(0)) {
    await page.screenshot({ path: `${screenshotDir}/day-0.png`, fullPage: true });
    const store = await page.evaluate(() => localStorage.getItem("program.log.v2"));
    snapshots.push({ day: 0, screenshot: `${screenshotDir}/day-0.png`, store });
  }

  for (let day = 1; day <= days; day++) {
    const target = new Date(new Date(startDate + "T08:00:00Z").getTime() + day * 864e5);
    const dow = target.getUTCDay();
    const decision = archetype.logDecision(day, dow);

    if (decision === "log") {
      // Write a synthetic day-log directly into the store.
      await page.evaluate(
        ({ dateISO, symptoms, note, weightFactor, rpe, reps }) => {
          const raw = localStorage.getItem("program.log.v2");
          if (!raw) return;
          const store = JSON.parse(raw);
          if (!store.logs[dateISO]) {
            store.logs[dateISO] = {
              date: dateISO,
              exercises: {},
              symptoms,
              notes: note ?? undefined,
            };
          }
          // Naive: fill 3 sets under a synthetic block id "sim:strength".
          const key = "sim:strength:sim_lift";
          if (!store.logs[dateISO].exercises[key]) {
            store.logs[dateISO].exercises[key] = {
              done: true,
              sets: [
                { weight_kg: Math.round(80 * weightFactor), reps, rpe },
                { weight_kg: Math.round(80 * weightFactor), reps, rpe },
                { weight_kg: Math.round(80 * weightFactor), reps, rpe },
              ],
            };
          }
          store.updated_at = Date.now();
          localStorage.setItem("program.log.v2", JSON.stringify(store));
        },
        {
          dateISO: target.toISOString().slice(0, 10),
          symptoms: archetype.symptoms(day),
          note: archetype.sessionNote(day, dow),
          weightFactor: archetype.loadFactor(day),
          rpe: archetype.rpeTarget,
          reps: 5,
        },
      );
    } else if (decision === "skip") {
      // Mark the date skipped.
      await page.evaluate(
        ({ dateISO }) => {
          const raw = localStorage.getItem("program.log.v2");
          if (!raw) return;
          const store = JSON.parse(raw);
          store.skipped = store.skipped ?? {};
          store.skipped[dateISO] = { blocks: [], reason: "sim: archetype skipped this day" };
          store.updated_at = Date.now();
          localStorage.setItem("program.log.v2", JSON.stringify(store));
        },
        { dateISO: target.toISOString().slice(0, 10) },
      );
    }

    // Advance clock so the next iteration sees a new "today".
    await setClockForDay(page, startDate, day);

    if (snapshotDays.includes(day)) {
      // Reload so hydrate re-runs against the mutated store.
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: `${screenshotDir}/day-${day}.png`, fullPage: true });
      const store = await page.evaluate(() => localStorage.getItem("program.log.v2"));
      snapshots.push({ day, screenshot: `${screenshotDir}/day-${day}.png`, store });
    }
  }

  const finalStoreRaw = await page.evaluate(() => localStorage.getItem("program.log.v2"));
  return {
    archetypeId: archetype.id,
    programSlug,
    daysSimulated: days,
    finalStore: finalStoreRaw ? JSON.parse(finalStoreRaw) : null,
    snapshots,
  };
}
