import type { Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Flows — the harness's interaction layer (2026-08-24).
 *
 * The tour answers "does every route render?". It clicks nothing, which
 * is why every bug in the 2026-08-24 live-workout report sat in its blind
 * spot: set editing, the rest timer's +30s, the off-plan rail's 11px tap
 * targets. All of them live one tap past a URL.
 *
 * A flow drives real UI and captures after every step. Flows do NOT
 * assert — they photograph. Correctness assertions belong in the targeted
 * specs (session-set-edit.spec.ts, offplan-flag.spec.ts). A flow that
 * can't run its preconditions (rest day, program with no session today)
 * records `skipped` with a reason rather than failing the sweep: a
 * persona legitimately has nothing to log on a rest day, and that is not
 * a regression.
 *
 * See dev/audits/app/2026-08-24-persona-coverage-audit.md.
 */

export class SkipFlow extends Error {}

export type StepResult = { name: string; status: "ok" | "error"; error?: string };
export type FlowResult = {
  id: string;
  desc: string;
  status: "ok" | "skipped" | "error";
  reason?: string;
  steps: StepResult[];
};

export type FlowContext = {
  page: Page;
  outDir: string;
  programSlug: string;
  /** Capture a screenshot + innerText snapshot for this step. */
  capture: (stepName: string) => Promise<void>;
};

export type Flow = {
  id: string;
  desc: string;
  run: (ctx: FlowContext) => Promise<void>;
};

const SESSION_SETTLE_MS = 700;
/**
 * Every click gets a bound. A flow must never be able to hang the whole
 * persona: on the first prod sweep a single disabled button consumed the
 * 900s test budget and cascaded "Target page, context or browser has been
 * closed" into eight downstream flows.
 */
const CLICK_TIMEOUT_MS = 15_000;

function shiftISO(days: number): string {
  return new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);
}

/**
 * Open a session Brief — today if there is one, otherwise walk the
 * timeline to find a day that prescribes work.
 *
 * The first version only tried today, which made flow coverage depend on
 * which weekday the sweep happened to run: on the first full run, 7 of 13
 * personas skipped every session flow because their programs train
 * Mon/Wed/Fri and that day was neither. Same harness, same code, different
 * coverage number depending on the calendar — which is exactly the kind of
 * thing a coverage metric must not do.
 *
 * `?date=` on the session route is also the app's only cross-day
 * affordance and had never been exercised by anything, so walking it here
 * is coverage in its own right, not just a workaround.
 */
async function openBrief(ctx: FlowContext): Promise<void> {
  // Today first, then forward (a planned session), then back (one already
  // logged — which is what the edit-a-past-set flow actually wants).
  const offsets = [0, 1, 2, 3, 4, 5, 6, -1, -2, -3, -4, -5, -6, -7];
  for (const offset of offsets) {
    const url =
      offset === 0
        ? `/session/${ctx.programSlug}/`
        : `/session/${ctx.programSlug}/?date=${shiftISO(offset)}`;
    await ctx.page.goto(url, { waitUntil: "domcontentloaded" });
    await ctx.page.waitForTimeout(1200);
    const start = ctx.page.getByRole("button", { name: /^(Start|Continue) —/ });
    if ((await start.count()) === 0) continue;

    // The confirm-first gate. When a cycle-start proposal is pending, the
    // Brief disables Start and reads "Accept the numbers to start" — you
    // cannot train until you have accepted or adjusted the new training
    // maxes. persona-strength (the overperformer, so always carrying a
    // TM bump) hit this on prod: `openBrief` saw the button, clicked it,
    // and Playwright waited 900 SECONDS for a permanently-disabled control
    // before failing the whole persona and taking the eight downstream
    // flows with it.
    //
    // Resolving the gate here is not a workaround — it is the product's
    // core mechanic, and this is the only place the harness exercises it.
    if (await start.first().isDisabled()) {
      const accept = ctx.page.getByRole("button", { name: /^Use these$/ });
      if ((await accept.count()) > 0) {
        await accept.first().click({ timeout: CLICK_TIMEOUT_MS });
        await ctx.page.waitForTimeout(900);
      }
      if (await start.first().isDisabled()) {
        throw new SkipFlow("Start is gated and the gate could not be resolved");
      }
    }
    return;
  }
  throw new SkipFlow(
    "no session prescribed within ±7 days (graduated, pre-start, or a fully-rest window)",
  );
}

/** Log the currently-shown set, whatever its shape. */
async function logCurrentSet(ctx: FlowContext): Promise<void> {
  const done = ctx.page.getByRole("button", { name: /^(Done|Save) — set \d+/ });
  if (await done.count()) {
    await done.first().click({ timeout: CLICK_TIMEOUT_MS });
    return;
  }
  // AMRAP sets render a rep keypad instead of a single confirm button.
  const keypad = ctx.page.getByRole("button", { name: /^[1-9]$/ });
  if (await keypad.count()) {
    await keypad.first().click({ timeout: CLICK_TIMEOUT_MS });
    return;
  }
  throw new SkipFlow("no confirm control on the set screen");
}

export const FLOWS: Flow[] = [
  {
    id: "session-log-set",
    desc: "Brief → Start → log set 1 → rest → skip rest → set 2",
    async run(ctx) {
      await openBrief(ctx);
      await ctx.capture("01-brief");
      await ctx.page.getByRole("button", { name: /^(Start|Continue) —/ }).click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      await ctx.capture("02-set");
      await logCurrentSet(ctx);
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      await ctx.capture("03-rest");
      const skip = ctx.page.getByRole("button", { name: /skip rest/i });
      if (await skip.count()) await skip.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      await ctx.capture("04-next-set");
    },
  },
  {
    id: "session-edit-past-set",
    desc: "Go BACK to a logged set via the pips and correct it",
    async run(ctx) {
      await openBrief(ctx);
      await ctx.page.getByRole("button", { name: /^(Start|Continue) —/ }).click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      await logCurrentSet(ctx);
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      const skip = ctx.page.getByRole("button", { name: /skip rest/i });
      if (await skip.count()) await skip.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      await ctx.capture("01-after-logging");

      // The pips are the only backwards affordance in the session flow.
      const pip = ctx.page.getByRole("button", { name: /^Set \d+, logged .*Edit\.$/ });
      if ((await pip.count()) === 0) {
        throw new SkipFlow("no logged set to go back to (single-set exercise?)");
      }
      await pip.first().click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      await ctx.capture("02-editing-past-set");

      const change = ctx.page.getByRole("button", { name: /change the (weight|reps)/i });
      if (await change.count()) {
        await change.click({ timeout: CLICK_TIMEOUT_MS });
        await ctx.page.waitForTimeout(300);
        await ctx.capture("03-stepper-open");
      }
      const save = ctx.page.getByRole("button", { name: /^Save — set \d+/ });
      if (await save.count()) {
        await save.first().click({ timeout: CLICK_TIMEOUT_MS });
        await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
        await ctx.capture("04-after-save");
      }
    },
  },
  {
    id: "session-rest-extend",
    desc: "+30s on the rest timer — the control that used to reset it",
    async run(ctx) {
      await openBrief(ctx);
      await ctx.page.getByRole("button", { name: /^(Start|Continue) —/ }).click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      await logCurrentSet(ctx);
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      const add = ctx.page.getByRole("button", { name: /add 30 seconds/i });
      if ((await add.count()) === 0) throw new SkipFlow("rest takeover did not open");
      await ctx.capture("01-rest-before");
      await add.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(400);
      await ctx.capture("02-rest-extended");
    },
  },
  {
    id: "session-overflow-sheet",
    desc: "The ⋯ sheet on the set screen",
    async run(ctx) {
      await openBrief(ctx);
      await ctx.page.getByRole("button", { name: /^(Start|Continue) —/ }).click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      const more = ctx.page.getByRole("button", { name: /more options/i });
      if ((await more.count()) === 0) throw new SkipFlow("no overflow control on the set screen");
      await more.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(400);
      await ctx.capture("01-overflow-sheet");
    },
  },
  {
    id: "activity-log-sheet",
    desc: "The Brief footer's activity sheet — run / row / class",
    async run(ctx) {
      await openBrief(ctx);
      const footer = ctx.page.getByRole("button", { name: /log a run, row, or class/i });
      if ((await footer.count()) === 0) throw new SkipFlow("no activity footer on the Brief");
      await footer.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(400);
      await ctx.capture("01-activity-sheet");
      const form = ctx.page.getByRole("button", { name: /a run, a row, a class/i });
      if (await form.count()) {
        await form.click({ timeout: CLICK_TIMEOUT_MS });
        await ctx.page.waitForTimeout(400);
        await ctx.capture("02-activity-form");
      }
    },
  },
  {
    id: "session-note-sheet",
    desc: "⋯ → Note for this exercise — the only place notes still live",
    async run(ctx) {
      await openBrief(ctx);
      await ctx.page.getByRole("button", { name: /^(Start|Continue) —/ }).click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      const more = ctx.page.getByRole("button", { name: /more options/i });
      if ((await more.count()) === 0) throw new SkipFlow("no overflow control");
      await more.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(400);
      const note = ctx.page.getByRole("button", { name: /note for this exercise/i });
      if ((await note.count()) === 0) throw new SkipFlow("no note row in the overflow sheet");
      await note.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(400);
      await ctx.capture("01-note-sheet");
    },
  },
  {
    id: "session-exercise-details",
    desc: "⋯ → Form cues and warnings",
    async run(ctx) {
      await openBrief(ctx);
      await ctx.page.getByRole("button", { name: /^(Start|Continue) —/ }).click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      const more = ctx.page.getByRole("button", { name: /more options/i });
      if ((await more.count()) === 0) throw new SkipFlow("no overflow control");
      await more.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(400);
      const cues = ctx.page.getByRole("button", { name: /form cues and warnings/i });
      if ((await cues.count()) === 0) throw new SkipFlow("no form-cues row");
      await cues.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(400);
      await ctx.capture("01-exercise-details");
    },
  },
  {
    id: "program-preview",
    desc: "Programs catalog → a program's detail sheet",
    async run(ctx) {
      await ctx.page.goto(`/programs/${ctx.programSlug}/`, { waitUntil: "domcontentloaded" });
      await ctx.page.waitForTimeout(1200);
      await ctx.capture("01-program-detail");
      // The preview's disclosure is a native <details>/<summary>, not a
      // button with aria-expanded — which is what this looked for, so the
      // flow skipped on 14 of 15 personas and ProgramPreviewClient stayed
      // unreached. Accepts either.
      const disclosure = ctx.page.locator("summary, button[aria-expanded]");
      if ((await disclosure.count()) === 0) throw new SkipFlow("no expandable section on the preview");
      await disclosure.first().click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(400);
      await ctx.capture("02-expanded");
    },
  },
  {
    id: "onboarding-first-run",
    desc: "The first-run onboarding a returning persona never sees",
    async run(ctx) {
      // Personas pre-dismiss the intro so tour screenshots capture real UI.
      // Clearing the flags here is the only way this surface is ever
      // photographed at all.
      await ctx.page.evaluate((slug) => {
        localStorage.removeItem("program.firstrun.dismissed");
        localStorage.removeItem(`program.intro-gallery.seen.${slug}`);
      }, ctx.programSlug);
      await ctx.page.goto("/", { waitUntil: "domcontentloaded" });
      await ctx.page.waitForTimeout(1500);
      await ctx.capture("01-first-run");
      // Restore so nothing downstream sees the overlay.
      await ctx.page.evaluate((slug) => {
        localStorage.setItem("program.firstrun.dismissed", "1");
        localStorage.setItem(`program.intro-gallery.seen.${slug}`, "1");
      }, ctx.programSlug);
    },
  },
  {
    id: "plan-expand-day",
    desc: "Expand a Plan day row to reveal its per-day actions",
    async run(ctx) {
      await ctx.page.goto("/plan/", { waitUntil: "domcontentloaded" });
      await ctx.page.waitForTimeout(1200);
      await ctx.capture("01-plan");
      const row = ctx.page.locator("button[aria-expanded]");
      if ((await row.count()) === 0) throw new SkipFlow("no expandable day rows on Plan");
      await row.first().click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(400);
      await ctx.capture("02-day-expanded");
    },
  },
];

export async function runFlows(
  page: Page,
  opts: { outDir: string; programSlug: string; flows?: Flow[] },
): Promise<FlowResult[]> {
  const flows = opts.flows ?? FLOWS;
  const results: FlowResult[] = [];
  // Flows are mobile-only: they exercise thumb-reach affordances (the
  // rail, the pips, bottom sheets) that only exist at that width, and
  // running both viewports would double an already-slow sweep for no
  // new information.
  await page.setViewportSize({ width: 393, height: 852 });

  for (const flow of flows) {
    const flowDir = path.join(opts.outDir, "flows", flow.id);
    fs.mkdirSync(flowDir, { recursive: true });
    const steps: StepResult[] = [];

    const ctx: FlowContext = {
      page,
      outDir: flowDir,
      programSlug: opts.programSlug,
      capture: async (stepName: string) => {
        try {
          await page.screenshot({ path: path.join(flowDir, `${stepName}.png`), fullPage: false });
          const text = await page.evaluate(() => document.body?.innerText ?? "");
          fs.writeFileSync(path.join(flowDir, `${stepName}.txt`), text, "utf8");
          steps.push({ name: stepName, status: "ok" });
        } catch (e) {
          steps.push({
            name: stepName,
            status: "error",
            error: e instanceof Error ? e.message : String(e),
          });
        }
      },
    };

    try {
      await flow.run(ctx);
      results.push({ id: flow.id, desc: flow.desc, status: "ok", steps });
    } catch (e) {
      if (e instanceof SkipFlow) {
        results.push({ id: flow.id, desc: flow.desc, status: "skipped", reason: e.message, steps });
      } else {
        results.push({
          id: flow.id,
          desc: flow.desc,
          status: "error",
          reason: e instanceof Error ? e.message : String(e),
          steps,
        });
      }
    }
  }

  fs.writeFileSync(
    path.join(opts.outDir, "flows", "results.json"),
    JSON.stringify(results, null, 2),
    "utf8",
  );
  return results;
}
