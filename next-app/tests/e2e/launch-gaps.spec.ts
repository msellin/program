import { test, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { resetTestUser } from "./setup-test-user";

/**
 * Launch-readiness gap capture (2026-10-27). Covers the three things the
 * persona sweep never showed:
 *   A. a stranger's first run (signed-out landing → sign-up page → fresh
 *      account → programs → intake → day 1 → first session),
 *   B. a red day against a really scheduled session (check saved with a red
 *      region score; the first advertised-program persona with a session
 *      today is used, since the schedule is weekday-based),
 *   C. real-viewport screenshots at 375×667 and 393×852 (not full-page, so
 *      fixed/sticky bars show where a phone actually draws them).
 *
 * The sign-up form is captured but never submitted: the fresh account comes
 * from resetTestUser, fenced to `e2e-` emails like every other harness user.
 * Output: dev/active/launch-readiness/screens/gaps/<part>/.
 */

const LANDING = "https://terav.fit";
const OUT = path.resolve(__dirname, "../../../dev/active/launch-readiness/screens/gaps");
const PASSWORD = "TestPassword123!";
const FRESH_EMAIL = "e2e-launch-firstrun@example.test";
const PULLUP_EMAIL = "e2e-persona-pullup@example.test";
const SMALL = { width: 375, height: 667 };
const MEDIUM = { width: 393, height: 852 };

test.describe.configure({ mode: "serial" });
test.beforeEach(async ({ page }) => {
  page.setDefaultTimeout(15_000);
});

function dir(part: string): string {
  const d = path.join(OUT, part);
  fs.mkdirSync(d, { recursive: true });
  return d;
}

async function shot(page: Page, part: string, name: string, notes: string[]): Promise<void> {
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(dir(part), `${name}.png`) });
  const text = (await page.locator("body").innerText({ timeout: 5000 }).catch(() => "")).slice(0, 1500);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  notes.push(`## ${name}\nurl: ${page.url()}\nhorizontal overflow: ${overflow}\n\n${text}\n`);
  fs.writeFileSync(path.join(dir(part), "notes.md"), notes.join("\n"));
}

async function signIn(page: Page, email: string): Promise<void> {
  await page.context().clearCookies();
  await page.goto("/sign-in/");
  await page.locator('input[type="email"]').waitFor({ state: "visible", timeout: 30_000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', PASSWORD);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), { timeout: 20_000 }),
    page.click('button[type="submit"]'),
  ]);
}

const ADVANCE = /^(next|continue|review|start|start program|start this program|begin|get started|done|finish|save|confirm|let'?s go|choose|use this)\b/i;

/** Answer whatever the current intake step asks with the first option, then advance. */
async function answerStep(page: Page): Promise<boolean> {
  // Screening questions are Yes/No buttons: answer "No" (healthy athlete).
  const no = page.getByRole("radio", { name: /^no$/i });
  if ((await no.count()) > 0) {
    await no.first().click().catch(() => {});
  } else {
    const radios = page.locator('[role="radio"][aria-checked="false"], input[type="radio"]:not(:checked)');
    if ((await radios.count()) > 0) {
      await radios.first().click().catch(() => {});
    } else {
      // Otherwise pick the first answer button that is not navigation.
      const choices = page.locator("main button").filter({ hasNotText: /^(back|next|cancel|skip|continue|save|done|finish)/i });
      if ((await choices.count()) > 0) await choices.first().click().catch(() => {});
    }
  }
  // Consent / acknowledgement steps: tick every unticked box.
  const boxes = page.locator('main input[type="checkbox"]:not(:checked)');
  for (let i = (await boxes.count()) - 1; i >= 0; i--) await boxes.nth(i).check().catch(() => {});
  const numbers = page.locator('input[type="number"]');
  for (let i = 0; i < (await numbers.count()); i++) {
    const n = numbers.nth(i);
    if (!(await n.inputValue().catch(() => "x"))) await n.fill("3").catch(() => {});
  }
  const advance = page.getByRole("button", { name: ADVANCE });
  if ((await advance.count()) === 0) return false;
  const target = advance.last();
  if (!(await target.isEnabled().catch(() => false))) return false;
  await target.click().catch(() => {});
  await page.waitForTimeout(600);
  return true;
}

test("A · stranger first run at 375×667", async ({ page }) => {
  test.setTimeout(600_000);
  await page.setViewportSize(SMALL);
  const notes: string[] = [];

  // Signed out: the ad landing page, its CTA target, the sign-up page.
  await page.context().clearCookies();
  await page.goto(`${LANDING}/programs/first-strict-pullup/?utm_campaign=gap-test`);
  await shot(page, "A-first-run", "01-landing-pullup", notes);
  const cta = page.getByRole("link", { name: /start free|start|get started|try/i }).first();
  const href = (await cta.getAttribute("href").catch(() => null)) ?? "(no CTA found)";
  notes.push(`CTA href from the pull-up landing page: ${href}\n`);
  await page.goto("/sign-up/");
  await shot(page, "A-first-run", "02-sign-up-page-not-submitted", notes);

  // A fresh, empty account stands in for "just confirmed their email".
  await resetTestUser(FRESH_EMAIL, PASSWORD);
  await signIn(page, FRESH_EMAIL);
  await shot(page, "A-first-run", "03-first-screen-after-sign-in", notes);
  await page.goto("/programs/");
  await shot(page, "A-first-run", "04-programs", notes);
  await page.goto("/programs/first-strict-pullup/");
  await shot(page, "A-first-run", "05-program-detail", notes);
  await page.goto("/programs/first-strict-pullup/intake/");

  let step = 0;
  for (; step < 30; step++) {
    await shot(page, "A-first-run", `06-intake-${String(step + 1).padStart(2, "0")}`, notes);
    if (!page.url().includes("/intake")) break;
    if (!(await answerStep(page))) {
      notes.push(`Intake: no enabled advance button at step ${step + 1}; the walker stopped here.\n`);
      break;
    }
  }
  notes.push(`Intake steps walked: ${step + 1}\n`);

  await page.goto("/");
  await shot(page, "A-first-run", "07-today-day-1", notes);
  await page.goto("/session/first-strict-pullup/");
  await shot(page, "A-first-run", "08-first-session", notes);
  await page.mouse.wheel(0, 4000);
  await shot(page, "A-first-run", "09-first-session-bottom", notes);
  fs.writeFileSync(path.join(dir("A-first-run"), "notes.md"), notes.join("\n"));
});

// Advertised-program personas, tried in order; the schedule is weekday-based,
// so whichever has a session today is the one red is tested against (G-14).
// Their state comes from the last `npm run e2e:personas` run.
const RED_DAY_CANDIDATES = [
  ["e2e-persona-pullup-fast@example.test", "first-strict-pullup"],
  ["e2e-persona-pullup@example.test", "first-strict-pullup"],
  ["e2e-persona-strength@example.test", "concurrent-strength-maintenance"],
  ["e2e-persona-strength-slow@example.test", "concurrent-strength-maintenance"],
  ["e2e-persona-handstand@example.test", "handstand-walk"],
  ["e2e-persona-handstand-fast@example.test", "handstand-walk"],
] as const;

async function dismissOnboarding(page: Page): Promise<void> {
  const skip = page
    .getByRole("button", { name: /^skip setup$/i })
    .or(page.getByRole("link", { name: /^skip setup$/i }));
  await skip.first().click({ timeout: 3000 }).catch(() => {});
}

async function hasSessionToday(page: Page, slug: string): Promise<boolean> {
  await page.goto(`/session/${slug}/`);
  await dismissOnboarding(page);
  await page.waitForTimeout(1500);
  const text = await page.locator("main").innerText({ timeout: 10_000 }).catch(() => "");
  // A finished program, a rest day or an empty day are all "no session to load".
  if (/rest day|no session scheduled|you finished|end this program/i.test(text)) return false;
  return /today'?s session|log this session|start session|open session|\bset 1\b/i.test(text);
}

test("B · red day against a scheduled session at 375×667", async ({ page }) => {
  test.setTimeout(420_000);
  await page.setViewportSize(SMALL);
  const notes: string[] = [];
  let chosen: (typeof RED_DAY_CANDIDATES)[number] | undefined;
  for (const candidate of RED_DAY_CANDIDATES) {
    await signIn(page, candidate[0]);
    if (await hasSessionToday(page, candidate[1])) {
      chosen = candidate;
      break;
    }
    notes.push(`${candidate[0]}: no loadable session today (rest day or finished), skipped\n`);
  }
  if (!chosen) {
    notes.push("No advertised-program persona has a session today. Re-run `npm run e2e:personas` or try tomorrow.\n");
    fs.writeFileSync(path.join(dir("B-red-day"), "notes.md"), notes.join("\n"));
    test.skip(true, "no candidate has a session today");
    return;
  }
  const [email, slug] = chosen;
  notes.push(`Red-day user: ${email} (${slug}), session scheduled today\n`);
  await shot(page, "B-red-day", "00-session-before-check", notes);
  await page.goto("/");
  await dismissOnboarding(page);
  await shot(page, "B-red-day", "00b-today-before-check", notes);

  await page.goto("/check/");
  await dismissOnboarding(page);
  const group = page.locator('[role="radiogroup"][aria-label$="severity"]').first();
  await group.waitFor({ timeout: 20_000 });
  await shot(page, "B-red-day", "01-check-empty", notes);
  await group.locator('[role="radio"]').last().click();
  await shot(page, "B-red-day", "02-check-red-selected", notes);
  await page.getByRole("button", { name: /save check|update check/i }).click();
  await page.waitForTimeout(1500);
  await dismissOnboarding(page);
  await shot(page, "B-red-day", "03-check-saved", notes);

  await page.goto("/");
  await dismissOnboarding(page);
  await shot(page, "B-red-day", "04-today-red", notes);
  await page.mouse.wheel(0, 4000);
  await shot(page, "B-red-day", "05-today-red-bottom", notes);
  await page.goto(`/session/${slug}/`);
  await dismissOnboarding(page);
  await shot(page, "B-red-day", "06-session-on-red-day", notes);
  // Can the user still start loading the painful area? Press the session's primary start.
  const start = page.getByRole("button", { name: /^(start|begin|continue|open session|log this session)/i }).first();
  if (await start.count()) {
    await start.click().catch(() => {});
    await shot(page, "B-red-day", "07-session-started-on-red", notes);
  } else {
    notes.push("No start button on the red-day session screen.\n");
  }
  await page.goto("/plan/");
  await shot(page, "B-red-day", "08-plan-on-red-day", notes);
});

test("C · real-viewport sweep, 375 and 393", async ({ page }) => {
  test.setTimeout(600_000);
  const routes = [
    ["01-today", "/"],
    ["02-plan", "/plan/"],
    ["03-session", "/session/first-strict-pullup/"],
    ["04-record", "/record/"],
    ["05-check", "/check/"],
    ["06-programs", "/programs/"],
    ["07-profile", "/profile/"],
    ["08-account", "/account/"],
    ["09-settings", "/settings/"],
    ["10-off-plan", "/off-plan/"],
  ] as const;
  await signIn(page, PULLUP_EMAIL);
  for (const [label, vp] of [["375", SMALL], ["393", MEDIUM]] as const) {
    await page.setViewportSize(vp);
    const notes: string[] = [];
    for (const [name, route] of routes) {
      await page.goto(route);
      await shot(page, `C-viewport-${label}`, `${name}-top`, notes);
      await page.mouse.wheel(0, 4000);
      await shot(page, `C-viewport-${label}`, `${name}-bottom`, notes);
      const fixed = await page.evaluate(() =>
        Array.from(document.querySelectorAll("body *"))
          .filter((el) => ["fixed", "sticky"].includes(getComputedStyle(el).position))
          .map((el) => {
            const r = el.getBoundingClientRect();
            return `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} @y=${Math.round(r.top)} h=${Math.round(r.height)}`;
          })
          .filter((s) => !s.includes("h=0")),
      );
      notes.push(`fixed/sticky on ${name}: ${fixed.join(" | ") || "none"}\n`);
    }
    fs.writeFileSync(path.join(dir(`C-viewport-${label}`), "notes.md"), notes.join("\n"));
  }
});
