import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { ensureTestUser, TEST_EMAIL, TEST_PASSWORD } from "./setup-test-user";
import { gotoSessionWithWork } from "./helpers/session";

/**
 * Off-plan behind a flag (2026-08-24).
 *
 * Cut from the public catalog: no program has off-plan-ONLY content —
 * every accessory/run block is already scheduled onto a day — so the page
 * was a second door into prescribed work. Accounts that actually used it
 * are grandfathered. Activity logging (`runs[]`) is a different feature
 * and stays on for everyone; four programs read it for retest metrics.
 */
const TODAY = new Date().toISOString().slice(0, 10);

type Seeded = { uid: string };

async function signInWithPersona(
  page: import("@playwright/test").Page,
  persona: string,
  mutate?: (store: Record<string, unknown>) => void,
): Promise<Seeded> {
  const { uid } = await ensureTestUser();
  await page.goto("/sign-in/");
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/sign-in"), { timeout: 20_000 }),
    page.click('button[type="submit"]'),
  ]);
  const seed = JSON.parse(
    fs.readFileSync(path.join(__dirname, "artifacts", "personas", persona, "final-store.json"), "utf8"),
  ) as Record<string, unknown>;
  mutate?.(seed);
  await page.evaluate(
    (args) => {
      const s = args.seed as {
        user_profile?: Record<string, unknown>;
        updated_at?: number;
        logs?: Record<string, unknown>;
      };
      s.user_profile = { ...(s.user_profile ?? {}), uid: args.uid, email: args.email };
      delete (s.logs as Record<string, unknown>)[args.today];
      s.updated_at = Date.now();
      localStorage.setItem("program.log.v2", JSON.stringify(s));
      localStorage.setItem("program.firstrun.dismissed", "1");
    },
    { seed, uid, email: TEST_EMAIL, today: TODAY },
  );
  return { uid };
}

/**
 * A schema-valid DayLog carrying logged work against a hip off-plan block.
 * `date` / `symptoms` / `derived_state` are required by `dayLogSchema` — a
 * day missing them fails validation, which invalidates the WHOLE store,
 * which sends `loadLocal` to its empty default, which makes the remote
 * copy win the `updated_at` comparison. Cost an hour; hence this note.
 */
function offPlanDay(date: string) {
  return {
    date,
    symptoms: null,
    derived_state: null,
    notes: "",
    exercises: {
      "block_a_home:hip_flexor_iso_seated": {
        sets: [{ weight_kg: null, reps: 10, rpe: null }],
        done: true,
      },
    },
  };
}

/** Three days of logged off-plan work — one over the grandfather threshold. */
function withOffPlanHistory(store: Record<string, unknown>) {
  const logs = store.logs as Record<string, unknown>;
  for (const date of ["2026-07-01", "2026-07-02", "2026-07-03"]) {
    logs[date] = offPlanDay(date);
  }
}

test("public account: the three off-plan surfaces are gone", async ({ page }) => {
  await signInWithPersona(page, "persona-strength");

  // Day carries no off-plan card.
  await page.goto("/");
  await page.waitForSelector("text=/Open session|Rest|rest/", { timeout: 20_000 });
  await expect(page.getByText(/drills? available/i)).toHaveCount(0);

  // Profile carries no off-plan row.
  await page.goto("/profile/");
  await page.waitForSelector("text=More", { timeout: 20_000 });
  await expect(page.getByRole("link", { name: /^Off-plan$/ })).toHaveCount(0);

  // Settings carries no off-plan toggle — the flag was never set.
  await page.goto("/settings/");
  await page.waitForSelector("text=Sound effects", { timeout: 20_000 });
  await expect(page.getByText("Off-plan drills")).toHaveCount(0);

  // The route explains itself rather than 404ing or showing a drill list.
  await page.goto("/off-plan/");
  await expect(page.getByText(/lives in your sessions now/i)).toBeVisible({ timeout: 20_000 });
});

test("public account: activity logging survives and is named", async ({ page }) => {
  // persona-recover with NO off-plan history injected — not grandfathered,
  // so it behaves exactly as a public account. Chosen over persona-strength
  // because hip-rebuild prescribes work most days, so the Brief is reachable.
  await signInWithPersona(page, "persona-recover");
  expect(await gotoSessionWithWork(page, "anterior-hip-rebuild")).toBe(true);
  const footer = page.getByRole("button", { name: /log a run, row, or class/i });
  await expect(footer).toBeVisible({ timeout: 20_000 });
  await footer.click();
  await expect(page.locator("#off-plan-title")).toHaveText("Log an activity");
  // Drill list is gated; the run/row/class form is not.
  await expect(page.getByText(/or pick a drill/i)).toHaveCount(0);
  await expect(page.getByRole("button", { name: /a run, a row, a class/i })).toBeVisible();
});

test("grandfathered account: off-plan survives and is recoverable in Settings", async ({ page }) => {
  await signInWithPersona(page, "persona-recover", withOffPlanHistory);

  await page.goto("/profile/");
  await page.waitForSelector("text=More", { timeout: 20_000 });
  // The grandfather check fetches program JSON before it can decide, so
  // poll rather than racing the write.
  await expect
    .poll(
      () =>
        page.evaluate(
          () => JSON.parse(localStorage.getItem("program.log.v2") ?? "{}").feature_flags?.off_plan ?? null,
        ),
      { timeout: 15_000 },
    )
    .toBe(true);
  await expect(page.getByRole("link", { name: /^Off-plan$/ })).toBeVisible();

  // The drill page works.
  await page.goto("/off-plan/");
  await expect(page.getByRole("heading", { name: /off-plan/i })).toBeVisible({ timeout: 20_000 });

  // And the toggle exists — the only in-app way back, since the installed
  // PWA has no URL bar to carry a query-string escape hatch.
  await page.goto("/settings/");
  await expect(page.getByText("Off-plan drills")).toBeVisible({ timeout: 20_000 });
});

test("an incidental single use does not grandfather", async ({ page }) => {
  await signInWithPersona(page, "persona-recover", (store) => {
    (store.logs as Record<string, unknown>)["2026-07-01"] = offPlanDay("2026-07-01");
  });
  await page.goto("/profile/");
  await page.waitForSelector("text=More", { timeout: 20_000 });
  await expect(page.getByRole("link", { name: /^Off-plan$/ })).toHaveCount(0);
});

test("accessory exercises seed their authored reps, not zero", async ({ page }) => {
  // Regression for the founder's 2026-08-24 log, which carried
  // `hip_switch_9090` set 1 at 0 reps between two sets of 12 and
  // `air_squat_daily` set 3 at 0 after two sets of 10. Both author
  // `default.reps: 10` in exercises.json; SetView's seeding chain never
  // consulted it, so any set without a TM prescription and without a
  // same-index history landed on zero — and Done committed the zero.
  await signInWithPersona(page, "persona-recover", (store) => {
    store.feature_flags = { ...((store.feature_flags as object) ?? {}), off_plan: true };
  });
  await page.goto("/off-plan/");
  const row = page.locator("button", { hasText: /\d+ sets/ }).first();
  await row.click({ timeout: 20_000 });
  await expect(page.getByText(/· set 1 of \d+/i)).toBeVisible({ timeout: 10_000 });

  // `reps?` — a set seeded at 1 renders "1 rep", not "1 reps".
  // Two shapes now. Counted work shows "N reps"; held work (isometrics,
  // stretches — `hold_seconds` and no reps) shows a countdown instead,
  // because a rep stepper is the wrong instrument for a 20-second hold.
  // Either way the assertion is the same: the screen must never offer
  // ZERO as the thing you are about to log.
  const holdCta = page.getByRole("button", { name: /start the hold · \d+s/i });
  if (await holdCta.count()) {
    const clock = await page.locator("p").filter({ hasText: /^\d+:\d\d$/ }).first().textContent();
    const [m, sec] = (clock ?? "0:00").split(":").map(Number);
    expect(m * 60 + sec).toBeGreaterThan(0);
    await expect(page.getByText(/Programme asks for/i)).toBeVisible();
  } else {
    const shown = await page.locator("p").filter({ hasText: /^\d+\+? reps?$/ }).first().textContent();
    expect(Number((shown ?? "").match(/\d+/)?.[0] ?? "0")).toBeGreaterThan(0);
    await expect(page.getByRole("button", { name: /^Done — set 1/ })).toBeVisible();
  }
});


test("a held set records seconds, and still counts as logged", async ({ page }) => {
  // The founder's 2026-08-24 log recorded a 30-second kneeling stretch as
  // "x12" — the set screen only ever offered a rep counter. Hold-based work
  // now runs a countdown and writes `seconds`.
  //
  // It still writes `reps: 1` as well, and that is load-bearing: `reps != null`
  // is the "this set is logged" predicate in 42 places across 18 files.
  // Writing seconds INSTEAD would make every hold read as unlogged.
  await signInWithPersona(page, "persona-recover", (store) => {
    store.feature_flags = { ...((store.feature_flags as object) ?? {}), off_plan: true };
  });
  await page.goto("/off-plan/");
  await page.locator("button", { hasText: /\d+ sets/ }).first().click({ timeout: 20_000 });
  const start = page.getByRole("button", { name: /start the hold · \d+s/i });
  await expect(start).toBeVisible({ timeout: 10_000 });
  await start.click();
  await page.waitForTimeout(2600);
  await page.getByRole("button", { name: /log it now/i }).click();
  await page.waitForTimeout(800);

  const logged = await page.evaluate((today) => {
    const s = JSON.parse(localStorage.getItem("program.log.v2") ?? "{}");
    for (const entry of Object.values(s.logs?.[today]?.exercises ?? {}) as Array<{
      sets?: Array<{ seconds?: number | null; reps?: number | null }>;
    }>) {
      const hit = (entry.sets ?? []).find((x) => x.seconds != null);
      if (hit) return hit;
    }
    return null;
  }, TODAY);

  expect(logged).not.toBeNull();
  expect(logged!.seconds).toBeGreaterThan(0);
  expect(logged!.reps).not.toBeNull();
});
