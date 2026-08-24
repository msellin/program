import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { ensureTestUser, TEST_EMAIL, TEST_PASSWORD } from "./setup-test-user";

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
  await page.goto("/session/anterior-hip-rebuild/");
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
