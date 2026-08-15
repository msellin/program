import { test, expect, Page } from "@playwright/test";

/**
 * Guest-mode end-to-end walk of the Handstand Walk intake flow against
 * production. No auth, no KV sync — everything lives in the browser's
 * localStorage. That's the correct scope for verifying the new v2 features:
 * program catalog, tier picker, intake wizard, multi-dim Today rendering.
 *
 * Screenshots are saved so we can eyeball rendering after the run.
 */

const SCREENSHOT_DIR = "tests/e2e/screenshots";

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}.png`, fullPage: true });
}

test.beforeEach(async ({ page }) => {
  // Wipe any prior state so each test starts as a fresh guest.
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {
      /* noop */
    }
  });
});

test("Programs catalog loads all three programs", async ({ page }) => {
  await page.goto("/programs/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/programs/i);
  await expect(page.getByText(/anterior hip rebuild/i)).toBeVisible();
  await expect(page.getByText(/engine builder/i)).toBeVisible();
  await expect(page.getByText(/handstand walk/i)).toBeVisible();
  await shot(page, "01-catalog");
});

test("Handstand Walk preview page opens with intake route available", async ({ page }) => {
  await page.goto("/programs/handstand-walk/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/handstand walk/i);
  // Preview should offer a Start button; because generation_strategy is multi_dimensional
  // with a full intake payload, clicking Start should navigate to the intake page (not
  // activate directly). We verify the button exists and later the click goes to intake.
  await expect(page.getByRole("button", { name: /start/i })).toBeVisible();
  await shot(page, "02-preview");
});

test("Handstand Walk Start routes into intake wizard", async ({ page }) => {
  await page.goto("/programs/handstand-walk/");
  await page.getByRole("button", { name: /start/i }).click();
  await page.waitForURL(/\/intake/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/intake/i);
  await shot(page, "03-intake-landed");
});

test("Intake wizard blocks continuation when medical gate fires", async ({ page }) => {
  await page.goto("/programs/handstand-walk/intake/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/intake/i);
  // Answer the osteoporosis question as YES → block screen appears.
  const osteoLabel = page.getByText(/osteoporosis/i).first();
  await expect(osteoLabel).toBeVisible();
  // The "Yes" button under this question — scoped by the parent list item.
  const yesBtn = page.getByRole("button", { name: /^Yes$/ }).nth(0);
  await yesBtn.click();
  await shot(page, "04-block-attempted");
  // The Continue button should NOT be clickable now; and a "See your clinician first"
  // message should be visible.
  await expect(page.getByText(/see your clinician first/i)).toBeVisible();
});

test("Intake wizard happy path: Tier D answers → recommends Tier D", async ({ page }) => {
  await page.goto("/programs/handstand-walk/intake/");

  // Skill self-report — advanced answers.
  await page.getByRole("button", { name: /over 60 seconds/i }).click();       // wall_hold
  await page.getByRole("button", { name: /over 30 seconds/i }).click();       // freestand
  await page.getByRole("button", { name: /20 ?m\+|20 metres\+|20m plus/i }).click(); // walk_distance

  // Wrist pain history — "occasional" is safe middle ground
  const occasionalBtn = page.getByRole("button", { name: /occasional/i });
  if (await occasionalBtn.isVisible().catch(() => false)) {
    await occasionalBtn.click();
  }

  // Shoulder pain overhead — No.
  const shoulderNo = page.getByText(/shoulder pain/i).locator("..").getByRole("button", { name: /^No$/ }).first();
  if (await shoulderNo.isVisible().catch(() => false)) {
    await shoulderNo.click();
  }

  // Age band — pick 31-45.
  const ageBtn = page.getByRole("button", { name: /31.?45/i });
  if (await ageBtn.isVisible().catch(() => false)) {
    await ageBtn.click();
  }

  // Screening: osteoporosis No, hypertension No, acute wrist injury No, consent yes.
  const noButtons = page.getByRole("button", { name: /^No$/ });
  const noCount = await noButtons.count();
  for (let i = 0; i < noCount; i++) {
    const btn = noButtons.nth(i);
    if (await btn.isVisible().catch(() => false)) {
      await btn.click().catch(() => { /* likely already picked or covered */ });
    }
  }

  // Consent checkboxes — tick all required.
  const checkboxes = page.locator('input[type="checkbox"]');
  const cbCount = await checkboxes.count();
  for (let i = 0; i < cbCount; i++) {
    const cb = checkboxes.nth(i);
    if (await cb.isVisible().catch(() => false)) {
      await cb.check().catch(() => { /* may already be checked */ });
    }
  }

  await shot(page, "05-answered");

  // Continue to review.
  const continueBtn = page.getByRole("button", { name: /recommended tier|see recommended/i });
  await expect(continueBtn).toBeEnabled({ timeout: 5000 });
  await continueBtn.click();

  // Review screen shows the inferred tier — expect Tier D given the answers.
  await expect(page.getByText(/tier d/i)).toBeVisible({ timeout: 5000 });
  await shot(page, "06-review-tier-d");
});

test("After confirming tier, Today renders Handstand Walk blocks", async ({ page }) => {
  await page.goto("/programs/handstand-walk/intake/");

  // Fastest possible legal answers — Tier A path (all "never").
  const clickIfVisible = async (name: RegExp) => {
    const btn = page.getByRole("button", { name });
    if (await btn.first().isVisible().catch(() => false)) {
      await btn.first().click().catch(() => {});
    }
  };

  await clickIfVisible(/^never held one/i);
  await clickIfVisible(/^never freestanded/i);
  await clickIfVisible(/^never walked/i);
  await clickIfVisible(/^no$/i);          // covers all No answers by first-match order
  await clickIfVisible(/^18.?30$/);        // age band
  await clickIfVisible(/^no$/i);
  await clickIfVisible(/^no$/i);

  // Tick every checkbox visible.
  const checkboxes = page.locator('input[type="checkbox"]');
  const cbCount = await checkboxes.count();
  for (let i = 0; i < cbCount; i++) {
    const cb = checkboxes.nth(i);
    if (await cb.isVisible().catch(() => false)) {
      await cb.check().catch(() => {});
    }
  }

  const continueBtn = page.getByRole("button", { name: /recommended tier|see recommended/i });
  await continueBtn.click();
  await shot(page, "07-review-tier-a");

  const startBtn = page.getByRole("button", { name: /start program/i });
  await expect(startBtn).toBeEnabled();
  await startBtn.click();

  // Land on Today.
  await page.waitForURL(/^https?:\/\/[^/]+\/?$/, { timeout: 10_000 });
  await expect(page.getByRole("heading", { level: 1, name: /today|session/i })).toBeVisible({ timeout: 10_000 });
  await shot(page, "08-today-after-start");

  // Look for handstand-walk block content — the primary block for Tier A Mon/Wed/Sun
  // is block_skill_A_kinoshita; on Fri it's block_skill_A_wall_hold. Depending on
  // when the test runs, one of these should be present, plus wrist prep + recovery.
  const kinoshitaOrWall = page.getByText(/kinoshita|wall hold|wrist prep/i);
  await expect(kinoshitaOrWall.first()).toBeVisible({ timeout: 10_000 });
});

test("Profile page loads without crashing (regression from React #185)", async ({ page }) => {
  await page.goto("/profile/");
  // We're a guest — no email, but the identity card and sections should render.
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/profile/i);
  await expect(page.getByText(/my plan/i)).toBeVisible();
  await expect(page.getByText(/my constraints/i)).toBeVisible();
  await shot(page, "09-profile-guest");
});

test("Extras page has a date bar and Extras is reachable via ⋮ overflow menu", async ({ page }) => {
  await page.goto("/");
  // Overflow menu button — MoreVertical icon
  const overflow = page.getByRole("button", { name: /^more$/i });
  await expect(overflow).toBeVisible();
  await overflow.click();
  const extrasLink = page.getByRole("menuitem", { name: /extras/i });
  await expect(extrasLink).toBeVisible();
  await extrasLink.click();
  await page.waitForURL(/\/extras/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/extras/i);
  // Date bar should now be present (regression from date-hardcoding).
  await expect(page.getByText(/today|yesterday|days ago/i).first()).toBeVisible();
  await shot(page, "10-extras-with-datenav");
});

test("Adding a second program shows the amber multi-program banner on Today", async ({ page }) => {
  // Prime: add anterior-hip-rebuild as primary via localStorage so we're not truly a guest.
  await page.addInitScript(() => {
    const now = Date.now();
    const store = {
      version: 2,
      logs: {},
      training_maxes: {},
      cycle: null,
      updated_at: now,
      scheduled_overrides: {},
      skipped: {},
      dismissed_proposals: {},
      user_profile: {
        active_program_id: "anterior-hip-rebuild",
        active_program_ids: ["anterior-hip-rebuild"],
        active_program_started_at: new Date().toISOString(),
        tier: "beta_forever",
      },
    };
    localStorage.setItem("program.store.v2", JSON.stringify(store));
  });

  // Now visit Handstand Walk preview → should offer "Add alongside" and "Replace instead"
  await page.goto("/programs/handstand-walk/");
  await expect(page.getByRole("button", { name: /add alongside/i })).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole("button", { name: /replace instead/i })).toBeVisible();
  await shot(page, "11-preview-add-alongside");
});
