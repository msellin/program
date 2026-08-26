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

/**
 * Within-surface control coverage (2026-08-26).
 *
 * "Surface reached" is a binary that flatters the harness: opening the
 * overflow sheet and photographing it scored the same as testing its six
 * rows. A probe records every interactive control visible inside an open
 * surface; `tap` records the ones actually driven. Coverage is then
 * exercised / seen, per surface.
 *
 * `skipped` is not a failure. Some controls MUTATE — "Finish here" marks
 * the exercise done, "I already did this" writes every prescribed set,
 * "Stop session" ends the workout. A flow photographs; driving those would
 * corrupt the persona's state and make the next sweep incomparable. They
 * are recorded as seen-but-deliberately-untouched so the number stays
 * honest rather than quietly counting them as covered.
 */
export type SurfaceProbe = {
  surface: string;
  seen: string[];
  exercised: string[];
  skipped: Array<{ name: string; why: string }>;
  /**
   * Why a tap did not register. Added after two wrong hypotheses about
   * why SetView stalled at 7 of 17: guessing from the outside cost two
   * five-minute runs and taught nothing. Each miss now says whether the
   * control was never found, found but unclickable, or clicked and
   * recorded under a label the probe never saw.
   */
  misses: Array<{ pattern: string; why: string }>;
};
/**
 * A behavioural assertion made inside a flow (2026-08-26).
 *
 * Coverage answers "was this control driven". It does not answer "did
 * driving it do the right thing" — a flow that taps +30s and photographs
 * the result would have passed happily while the button reset the timer,
 * which is exactly the bug the founder reported. Checks close that gap:
 * each one names an expectation, evaluates it against the live page or
 * the store, and is reported whether it passes or fails.
 */
export type CheckResult = { name: string; ok: boolean; detail?: string };

export type FlowResult = {
  id: string;
  desc: string;
  status: "ok" | "skipped" | "error";
  reason?: string;
  steps: StepResult[];
  probes: SurfaceProbe[];
  checks: CheckResult[];
};

export type FlowContext = {
  page: Page;
  outDir: string;
  programSlug: string;
  /** Capture a screenshot + innerText snapshot for this step. */
  capture: (stepName: string) => Promise<void>;
  /**
   * Record every interactive control inside an open surface. `root` scopes
   * the query so page chrome (bottom nav, header) isn't counted as part of
   * the sheet.
   */
  probe: (surface: string, root: string) => Promise<void>;
  /** Drive one control by accessible name and record it as exercised. */
  tap: (surface: string, name: RegExp) => Promise<boolean>;
  /** Record a control as seen but deliberately not driven, with a reason. */
  note: (surface: string, name: string, why: string) => void;
  /**
   * Assert something about the app's behaviour. Never throws — a failed
   * check is a FINDING, recorded and reported, not a crash that hides the
   * rest of the flow.
   */
  check: (name: string, fn: () => Promise<boolean>, detail?: string) => Promise<void>;
  /** The persisted store, for checks that need to see what was written. */
  store: () => Promise<Record<string, unknown>>;
};

export type Flow = {
  id: string;
  desc: string;
  /**
   * Commits something — finishes a session, skips a day, moves a block,
   * writes an activity. Destructive flows run LAST (see `runFlows`), which
   * is the only real constraint on driving them.
   *
   * The earlier version refused to touch these at all, on the theory that
   * mutating a persona would make the next sweep incomparable. That was
   * simply wrong: `resetTestUser` DELETES the auth account at the start of
   * every persona run and the simulator rebuilds state from scratch, so
   * nothing a flow does survives to the next sweep. The only thing that
   * can break is a later flow in the SAME run — which ordering fixes.
   */
  destructive?: boolean;
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
    // "Log this session" is the CTA for a session that prescribes in prose
    // rather than sets — every rowing block is one. The gate only knew
    // "Start —" / "Continue —", so the moment those sessions started
    // rendering properly the harness still walked past them, and the three
    // rowing personas stayed at 46.7% surfaces with 15 flows skipped for
    // want of a session that was right there.
    const start = ctx.page.getByRole("button", {
      name: /^(Start|Continue) —|^Log this session$/,
    });
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

/**
 * Enter the set flow, or skip when this session has none.
 *
 * A prescription-only session (rowing, any run-category block) opens the
 * activity sheet rather than SetView. Without this guard every set-flow
 * flow entered anyway, found no controls, and burned its bounded timeouts
 * one after another — which blew the persona's whole 900s budget and
 * cascaded "Target page, context or browser has been closed" through all
 * 24 flows. The rowing personas looked like they were skipping; they were
 * dying.
 */
async function enterSetFlow(ctx: FlowContext): Promise<void> {
  await openBrief(ctx);
  await ctx.page
    .getByRole("button", { name: /^(Start|Continue) —|^Log this session$/ })
    .first()
    .click({ timeout: CLICK_TIMEOUT_MS });
  await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
  if ((await ctx.page.locator('[data-surface="SetView"]').count()) === 0) {
    throw new SkipFlow("prescription session — logged as an activity, no set flow");
  }
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
      await ctx.page
        .getByRole("button", { name: /^(Start|Continue) —|^Log this session$/ })
        .first()
        .click({ timeout: CLICK_TIMEOUT_MS });
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
    desc: "Go BACK to a logged set and correct it — assertions only",
    async run(ctx) {
      // Deliberately minimal (2026-08-26). This flow used to log a set,
      // skip rest, walk the pips, poke the steppers, walk the rail, open
      // the overflow and return to the Brief — and then assert that saving
      // a correction starts no rest timer. By then the exploration had
      // muddled the state, and the assertion failed on personas where a
      // timer was still up. The assertion was right; the flow around it
      // was not. Control exploration now lives in `session-controls`.
      await enterSetFlow(ctx);
      await logCurrentSet(ctx);
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      await ctx.tap("RestTakeover", /skip rest/i);
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      await ctx.capture("01-after-logging");

      const pip = ctx.page.getByRole("button", { name: /^Set \d+, logged .*Edit\.$/ });
      if ((await pip.count()) === 0) {
        throw new SkipFlow("no logged set to go back to (single-set exercise?)");
      }
      await pip.first().click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      await ctx.capture("02-editing-past-set");

      await ctx.check(
        "reopening a logged set enters edit mode",
        async () => (await ctx.page.getByText("Editing").count()) > 0,
      );
      // A logged set must present an EDIT affordance, but its shape
      // depends on the set: a normal set gets "Save — set N", an AMRAP set
      // gets a rep keypad under "Fix the reps on set N", a held set gets
      // the hold CTA. Asserting only the first shape failed on
      // persona-concurrent, whose opening lift prescribes 5+ — the app was
      // right and the check was too narrow. The detail line reports what
      // was actually found, so a future mismatch explains itself instead
      // of costing another five-minute run to diagnose.
      const save = ctx.page.getByRole("button", { name: /^Save — set \d+/ });
      const amrapPrompt = ctx.page.getByText(/fix the reps on set \d+/i);
      const holdCta = ctx.page.getByRole("button", {
        name: /start the hold|start the timer|log it now/i,
      });
      const hasSave = await save.count();
      const hasAmrap = await amrapPrompt.count();
      const hasHold = await holdCta.count();
      await ctx.check(
        "an already-logged set offers to edit it, not to log it fresh",
        async () => hasSave + hasAmrap + hasHold > 0,
        `save=${hasSave} amrapPrompt=${hasAmrap} hold=${hasHold}`,
      );
      if (hasSave === 0 && hasAmrap === 0) return;
      if (hasSave > 0) await ctx.tap("SetView", /^Save — set/);
      else await ctx.tap("SetView", /^[1-9]$/);
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      await ctx.capture("03-after-save");
      // Correcting a set is not a set you just did, so no rest timer.
      await ctx.check(
        "saving a correction does not start a rest timer",
        async () => (await ctx.page.locator('[data-surface="RestTakeover"]').count()) === 0,
      );
    },
  },
  {
    id: "session-controls",
    desc: "Sweep every control on the set screen — steppers, pips, rail, overflow",
    async run(ctx) {
      // The exploration half of what `session-edit-past-set` used to do.
      // Coverage work, no state assertions: it moves between sets and
      // exercises on purpose, so nothing here can assume a stable view.
      await enterSetFlow(ctx);
      await ctx.probe("SetView", '[data-surface="SetView"]');
      await ctx.capture("01-set");

      await ctx.check(
        "the set screen never offers 0 as the value it will log",
        async () => {
          const reps = await ctx.page
            .locator('[data-surface="SetView"] p')
            .filter({ hasText: /^\d+\+? reps?$/ })
            .first()
            .textContent()
            .catch(() => null);
          if (reps == null) return true; // a hold or duration screen
          return Number(reps.match(/\d+/)?.[0] ?? "0") > 0;
        },
      );
      await ctx.check(
        "a non-loadable exercise offers no weight control",
        async () => {
          const cta = await ctx.page
            .getByRole("button", { name: /^(Done|Save) — set/ })
            .first()
            .textContent()
            .catch(() => null);
          if (cta == null) return true;
          const namesKg = /·\s*[\d.]+\s*kg/.test(cta);
          const showsWeight =
            (await ctx.page
              .locator('[data-surface="SetView"] span')
              .filter({ hasText: /^kg$/ })
              .count()) > 0;
          return namesKg === showsWeight;
        },
      );

      const change = ctx.page.getByRole("button", { name: /change the (weight|reps|time)/i });
      if (await change.count()) {
        await change.click({ timeout: CLICK_TIMEOUT_MS });
        await ctx.page.waitForTimeout(300);
        await ctx.probe("SetView", '[data-surface="SetView"]');
        await ctx.tap("SetView", /^\+/);
        await ctx.page.waitForTimeout(200);
        await ctx.tap("SetView", /^−/);
        await ctx.page.waitForTimeout(200);
        await ctx.capture("02-stepper-used");
        await ctx.tap("SetView", /back to prescription/i);
        await ctx.page.waitForTimeout(250);
        await ctx.tap("SetView", /^Hide/);
        await ctx.page.waitForTimeout(200);
      }

      const pips = ctx.page.getByRole("button", { name: /^Set \d+, / });
      const pipCount = Math.min(await pips.count(), 5);
      for (let i = 0; i < pipCount; i++) {
        await ctx.tap("SetView", new RegExp(`^Set ${i + 1}, `));
        await ctx.page.waitForTimeout(250);
      }
      await ctx.capture("03-pips-walked");

      const railCount = Math.min(
        await ctx.page.locator('[data-surface="SetView"] div.overflow-x-auto button').count(),
        6,
      );
      for (let i = 0; i < railCount; i++) {
        const tab = ctx.page.locator('[data-surface="SetView"] div.overflow-x-auto button').nth(i);
        if ((await tab.count()) === 0) break;
        const label = ((await tab.textContent()) ?? "").trim().split("\n")[0];
        if (!label) continue;
        await ctx.tap("SetView", new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
        await ctx.page.waitForTimeout(400);
      }
      await ctx.capture("04-rail-walked");
      await ctx.tap("SetView", /^kg$/);
      await ctx.tap("SetView", /^reps$/);
      await ctx.tap("SetView", /change the weight/i);
      await ctx.tap("SetView", /^(Done|Save) — set/);
      await ctx.page.waitForTimeout(400);
      await ctx.tap("RestTakeover", /skip rest/i);
      await ctx.page.waitForTimeout(300);
      await ctx.tap("SetView", /^More options/);
      await ctx.page.waitForTimeout(300);
      await ctx.tap("SetView", /^Close/);
      await ctx.page.waitForTimeout(250);
      await ctx.tap("SetView", /back to brief/i);
      await ctx.page.waitForTimeout(300);
      await ctx.capture("05-back-to-brief");
    },
  },
  {
    id: "session-rest-extend",
    desc: "The rest takeover — timer, effort scale, jump sheet",
    async run(ctx) {
      await enterSetFlow(ctx);
      await logCurrentSet(ctx);
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      const rest = ctx.page.locator('[data-surface="RestTakeover"]');
      if ((await rest.count()) === 0) throw new SkipFlow("rest takeover did not open");
      await ctx.capture("01-rest-before");
      await ctx.probe("RestTakeover", '[data-surface="RestTakeover"]');

      const readClock = async (): Promise<number> => {
        const t = await rest
          .locator("p")
          .filter({ hasText: /^\d+:\d\d$/ })
          .first()
          .textContent()
          .catch(() => null);
        const [m, sec] = (t ?? "0:00").trim().split(":").map(Number);
        return m * 60 + sec;
      };

      // +30s FIRST. Ordering matters: when this ran after the effort loop
      // the click timed out, and the clock had fallen by exactly the 15s
      // click bound — the tap never landed because the effort card was
      // still in the way. Assert the extension before anything else can
      // cover the control.
      const before = await readClock();
      await ctx.tap("RestTakeover", /add 30 seconds/i);
      await ctx.page.waitForTimeout(500);
      const after = await readClock();
      await ctx.check(
        "+30s extends the rest timer",
        // Allow for the second that elapses between the two readings.
        async () => after > before,
        `before=${before}s after=${after}s`,
      );
      await ctx.capture("02-rest-extended");

      // Every rung of the effort scale — each writes a different RPE.
      for (const effort of [/^Easy/, /^Grind/, /^Solid/]) {
        if (await ctx.tap("RestTakeover", effort)) {
          await ctx.page.waitForTimeout(350);
          await ctx.tap("RestTakeover", /^change/);
          await ctx.page.waitForTimeout(300);
        }
      }
      await ctx.capture("03-effort-logged");
      await ctx.check(
        "effort selection writes an RPE to the logged set",
        async () => {
          const st = (await ctx.store()) as {
            logs?: Record<string, { exercises?: Record<string, { sets?: Array<{ rpe?: number | null }> }> }>;
          };
          return Object.values(st.logs ?? {}).some((d) =>
            Object.values(d.exercises ?? {}).some((e) => (e.sets ?? []).some((x) => x.rpe != null)),
          );
        },
      );

      // The mid-rest exercise switch. Open, photograph, cancel out.
      if (await ctx.tap("RestTakeover", /do something else next/i)) {
        await ctx.page.waitForTimeout(450);
        await ctx.probe("RestTakeover", '[data-surface="RestTakeover"] [role="dialog"]');
        await ctx.capture("04-jump-sheet");
        await ctx.tap("RestTakeover", /^Cancel/);
        await ctx.page.waitForTimeout(300);
      }

      // Skip rest last — it closes the surface everything above needs.
      // Escape first: the jump sheet's scrim can still be up if Cancel
      // missed, and a scrim swallows the click without failing it.
      await ctx.page.keyboard.press("Escape").catch(() => {});
      await ctx.page.waitForTimeout(250);
      const tapped = await ctx.tap("RestTakeover", /skip rest/i);
      await ctx.page.waitForTimeout(600);
      const stillOpen = await ctx.page.locator('[data-surface="RestTakeover"]').count();
      const dialogsUp = await ctx.page.locator('[role="dialog"]').count();
      await ctx.check(
        "Skip rest closes the rest takeover",
        async () => stillOpen === 0,
        `tapped=${tapped} stillOpen=${stillOpen} dialogsUp=${dialogsUp}`,
      );
      await ctx.capture("05-rest-skipped");
    },
  },
  {
    id: "session-overflow-sheet",
    desc: "The ⋯ sheet on the set screen",
    async run(ctx) {
      await enterSetFlow(ctx);
      const more = ctx.page.getByRole("button", { name: /more options/i });
      if ((await more.count()) === 0) throw new SkipFlow("no overflow control on the set screen");
      await more.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(400);
      await ctx.capture("01-overflow-sheet");

      // Every row in the sheet, not just the fact that it opened.
      await ctx.probe("OverflowSheet", '[data-surface="OverflowSheet"]');
      // Two rows write to the log the moment they are tapped. A flow
      // photographs; committing these would leave the persona with a
      // session it never did and make the next sweep incomparable.

      // "Add a set" is reversible in practice (it extends rowCount for the
      // day only) and is the one row whose effect is worth photographing.
      if (await ctx.tap("OverflowSheet", /^Add a set/)) {
        await ctx.page.waitForTimeout(500);
        await ctx.capture("02-after-add-set");
        // Re-open for the remaining rows — tapping a row closes the sheet.
        const reopen = ctx.page.getByRole("button", { name: /more options/i });
        if (await reopen.count()) {
          await reopen.click({ timeout: CLICK_TIMEOUT_MS });
          await ctx.page.waitForTimeout(350);
        }
      }
      if (await ctx.tap("OverflowSheet", /^Note for this exercise/)) {
        await ctx.page.waitForTimeout(450);
        await ctx.probe("NoteSheet", '[data-surface="NoteSheet"]');
        // The quick-note chips are the fastest path to a real note, and
        // the reason the sheet exists.
        await ctx.tap("NoteSheet", /^Felt heavy/);
        await ctx.page.waitForTimeout(200);
        await ctx.tap("NoteSheet", /^Form broke down/);
        await ctx.page.waitForTimeout(200);
        await ctx.capture("03-note-chips");
        await ctx.tap("NoteSheet", /^Save to /);
        await ctx.page.waitForTimeout(400);
        const reopen2 = ctx.page.getByRole("button", { name: /more options/i });
        if (await reopen2.count()) {
          await reopen2.click({ timeout: CLICK_TIMEOUT_MS });
          await ctx.page.waitForTimeout(350);
        }
      }
      const reopenOverflow = async () => {
        const btn = ctx.page.getByRole("button", { name: /more options/i });
        if ((await btn.count()) === 0) return false;
        await btn.first().click({ timeout: CLICK_TIMEOUT_MS }).catch(() => {});
        await ctx.page.waitForTimeout(350);
        return true;
      };
      if (await ctx.tap("OverflowSheet", /^Watch the lift/)) {
        await ctx.page.waitForTimeout(600);
        await ctx.capture("04-video");
        await ctx.page.keyboard.press("Escape").catch(() => {});
        await ctx.page.waitForTimeout(300);
        await reopenOverflow();
      }
      if (await ctx.tap("OverflowSheet", /^Form cues and warnings/)) {
        await ctx.page.waitForTimeout(500);
        // Scoped to the dialog WITHOUT a data-surface, so Close resolves
        // to the details sheet rather than the overflow sheet beneath it.
        await ctx.probe("ExerciseDetailsSheet", '[role="dialog"]:not([data-surface])');
        await ctx.capture("05-form-cues");
        const detailsClose = ctx.page
          .locator('[role="dialog"]:not([data-surface]) button')
          .filter({ hasText: /^Close$/ });
        if (await detailsClose.count()) {
          await detailsClose.first().click({ timeout: CLICK_TIMEOUT_MS }).catch(() => {});
          ctx.note("ExerciseDetailsSheet", "Close", "driven via a scoped locator");
        }
        await ctx.page.waitForTimeout(300);
        await reopenOverflow();
      }
      await ctx.tap("OverflowSheet", /^Close/);
      await ctx.page.waitForTimeout(250);
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
      await ctx.probe("OffPlanSheet", '[data-surface="OffPlanSheet"]');
      const form = ctx.page.getByRole("button", { name: /a run, a row, a class/i });
      if (await form.count()) {
        await form.click({ timeout: CLICK_TIMEOUT_MS });
        await ctx.page.waitForTimeout(400);
        await ctx.capture("02-activity-form");
        // The form itself — modality pickers, duration, effort. Probed so
        // its controls count toward coverage even where driving them would
        // write a run the persona never did.
        await ctx.probe("OffPlanSheet", '[data-surface="OffPlanSheet"]');
        await ctx.tap("OffPlanSheet", /^Warm-up \+ cool-down/);
        await ctx.page.waitForTimeout(250);
        await ctx.capture("03-activity-options");
      }
      await ctx.tap("OffPlanSheet", /^Close/);
    },
  },
  {
    id: "session-note-sheet",
    desc: "⋯ → Note for this exercise — the only place notes still live",
    async run(ctx) {
      await enterSetFlow(ctx);
      const more = ctx.page.getByRole("button", { name: /more options/i });
      if ((await more.count()) === 0) throw new SkipFlow("no overflow control");
      await more.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(400);
      const note = ctx.page.getByRole("button", { name: /note for this exercise/i });
      if ((await note.count()) === 0) throw new SkipFlow("no note row in the overflow sheet");
      await note.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(400);
      await ctx.capture("01-note-sheet");
      await ctx.probe("NoteSheet", '[data-surface="NoteSheet"]');
      // Type a note — the sheet's whole purpose, and the thing the founder
      // flagged as having receded after the redesign.
      const field = ctx.page.locator('[role="dialog"] textarea, [role="dialog"] input[type="text"]');
      if (await field.count()) {
        await field.first().fill("harness: felt solid, no groin pain");
        await ctx.page.waitForTimeout(250);
        await ctx.capture("02-note-typed");
      }
      ctx.note("NoteSheet", "Stop session", "mutating — ends the workout the other flows need");
      await ctx.tap("NoteSheet", /^(Close|Save|Done)/);
    },
  },
  {
    id: "session-exercise-details",
    desc: "⋯ → Form cues and warnings",
    async run(ctx) {
      await enterSetFlow(ctx);
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
    id: "session-video",
    desc: "⋯ → Watch the lift",
    async run(ctx) {
      await enterSetFlow(ctx);
      const more = ctx.page.getByRole("button", { name: /more options/i });
      if ((await more.count()) === 0) throw new SkipFlow("no overflow control");
      await more.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(400);
      // Only rendered for exercises that carry a video_url / video_search.
      const watch = ctx.page.getByRole("button", { name: /watch the lift/i });
      if ((await watch.count()) === 0) throw new SkipFlow("this exercise has no video");
      await watch.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(600);
      await ctx.capture("01-video-modal");
    },
  },
  {
    id: "programs-info-sheet",
    desc: "Programs catalog → the status-ladder disclosure",
    async run(ctx) {
      await ctx.page.goto("/programs/", { waitUntil: "domcontentloaded" });
      await ctx.page.waitForTimeout(1200);
      // The disclosure is an inline text button inside a sentence — it
      // reads "cited", not "how programs earn each status" (that is the
      // sheet's own title, which only exists once the sheet is open).
      const opener = ctx.page.getByRole("button", { name: /^cited$/i });
      if ((await opener.count()) === 0) throw new SkipFlow("no ladder disclosure on the catalog");
      await opener.first().click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(500);
      await ctx.capture("01-info-sheet");
    },
  },
  {
    id: "plan-move-sheet",
    desc: "Plan → expand a day → Move… (opened and cancelled, never committed)",
    async run(ctx) {
      await ctx.page.goto("/plan/", { waitUntil: "domcontentloaded" });
      await ctx.page.waitForTimeout(1200);
      const row = ctx.page.locator("button[aria-expanded]");
      if ((await row.count()) === 0) throw new SkipFlow("no expandable day rows on Plan");
      // Walk the rows until one offers Move — past and rest days do not.
      const rowCount = Math.min(await row.count(), 7);
      for (let i = 0; i < rowCount; i++) {
        await row.nth(i).click({ timeout: CLICK_TIMEOUT_MS });
        await ctx.page.waitForTimeout(350);
        const move = ctx.page.getByRole("button", { name: /^Move…$/ });
        if ((await move.count()) > 0 && (await move.first().isEnabled())) {
          await move.first().click({ timeout: CLICK_TIMEOUT_MS });
          await ctx.page.waitForTimeout(450);
          await ctx.capture("01-move-sheet");
          // Cancel. A flow photographs; it must not mutate the persona's
          // plan, or the next sweep's artifacts stop being comparable.
          const cancel = ctx.page.getByRole("button", { name: /^(Cancel|Close)$/ });
          if (await cancel.count()) await cancel.first().click({ timeout: CLICK_TIMEOUT_MS });
          return;
        }
        await row.nth(i).click({ timeout: CLICK_TIMEOUT_MS });
        await ctx.page.waitForTimeout(200);
      }
      throw new SkipFlow("no day in the visible week offers Move");
    },
  },
  {
    id: "plan-skip-confirm",
    desc: "Plan → expand a day → Skip → the confirm sheet (cancelled, never committed)",
    async run(ctx) {
      await ctx.page.goto("/plan/", { waitUntil: "domcontentloaded" });
      await ctx.page.waitForTimeout(1200);
      const row = ctx.page.locator("button[aria-expanded]");
      if ((await row.count()) === 0) throw new SkipFlow("no expandable day rows on Plan");
      const rowCount = Math.min(await row.count(), 7);
      for (let i = 0; i < rowCount; i++) {
        await row.nth(i).click({ timeout: CLICK_TIMEOUT_MS });
        await ctx.page.waitForTimeout(350);
        const skip = ctx.page.getByRole("button", { name: /^Skip$/ });
        if ((await skip.count()) > 0 && (await skip.first().isEnabled())) {
          await skip.first().click({ timeout: CLICK_TIMEOUT_MS });
          await ctx.page.waitForTimeout(450);
          await ctx.capture("01-skip-confirm");
          // "Keep it" is the cancel — the session stays on the plan.
          const keep = ctx.page.getByRole("button", { name: /^Keep it$/ });
          if (await keep.count()) await keep.first().click({ timeout: CLICK_TIMEOUT_MS });
          return;
        }
        await row.nth(i).click({ timeout: CLICK_TIMEOUT_MS });
        await ctx.page.waitForTimeout(200);
      }
      throw new SkipFlow("no day in the visible week offers Skip");
    },
  },
  {
    id: "hip-check",
    desc: "The hip self-check — the only writer of `assessments`",
    async run(ctx) {
      await ctx.page.goto("/check/hip/", { waitUntil: "domcontentloaded" });
      await ctx.page.waitForTimeout(1200);
      await ctx.capture("01-check-start");
      const begin = ctx.page.getByRole("button", { name: /^Start check \(/i });
      if ((await begin.count()) === 0) throw new SkipFlow("no Start check control");
      await begin.first().click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(500);

      // Each question is an 11-button 0-10 scale plus Back/Next. Answering
      // does NOT advance on its own — Next does, which is why picking a
      // value in a loop got stuck on question one forever.
      //
      // Answer 2 rather than 0: a mild, plausible score, so what this
      // writes into `assessments` reads like a real check instead of a
      // wall of zeroes that the rehab trend would then have to explain.
      for (let i = 0; i < 15; i++) {
        const submit = ctx.page.getByRole("button", { name: /log this hip check/i });
        if ((await submit.count()) > 0) {
          await ctx.capture("02-answered");
          await submit.first().click({ timeout: CLICK_TIMEOUT_MS });
          await ctx.page.waitForTimeout(900);
          await ctx.capture("03-saved");
          return;
        }
        // Targeted by position in the 11-button grid, not by accessible
        // name: `getByRole("button", {name: /^2$/})` matches nothing —
        // the scale buttons carry an aria-label that overrides the visible
        // digit, so a name-based selector silently found zero elements and
        // Next stayed disabled forever.
        const scale = ctx.page.locator("div.grid button");
        if (await scale.count()) {
          await scale.nth(2).click({ timeout: CLICK_TIMEOUT_MS });
          await ctx.page.waitForTimeout(250);
        }
        // The advance button relabels to "Review" on the final question
        // (`stepIdx === totalSteps - 1`), so a /^Next$/ selector found
        // nothing there and broke the loop one step short of the submit.
        const next = ctx.page.getByRole("button", { name: /^(Next|Review)$/ });
        if ((await next.count()) === 0 || !(await next.first().isEnabled())) break;
        await next.first().click({ timeout: CLICK_TIMEOUT_MS });
        await ctx.page.waitForTimeout(300);
      }
      throw new SkipFlow("hip check did not reach a submit state");
    },
  },
  {
    id: "retest-logging",
    desc: "A retest-due proposal → Log reading → the retest sheet",
    async run(ctx) {
      // Only fires when the persona's current week lands inside a metric's
      // at_week window AND no reading exists for it in the past 7 days
      // (select.ts:selectRetestDue). persona-retest is positioned for
      // engine-builder's week-4 mid-block check; every other persona
      // legitimately skips.
      await ctx.page.goto("/", { waitUntil: "domcontentloaded" });
      await ctx.page.waitForTimeout(1500);
      const log = ctx.page.getByRole("button", { name: /^Log reading$/ });
      if ((await log.count()) === 0) throw new SkipFlow("no retest-due proposal open");
      await ctx.capture("01-retest-proposal");
      await log.first().click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(600);
      await ctx.capture("02-retest-sheet");
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

      // A8 (2026-08-26): phase 1 scheduled one combined squat+pull block on
      // Mon/Wed/Thu/Sat, so Wednesday and Thursday were a heavy squat 24h
      // apart — against the program's own "48h between heavy squat days"
      // principle. On Plan it reads as two identical adjacent rows, which
      // the tour had been screenshotting every run without noticing.
      const summaries = await ctx.page
        .locator("button[aria-expanded] p")
        .allTextContents()
        .catch(() => [] as string[]);
      const meaningful = summaries.map((t) => t.trim()).filter((t) => t.length > 0);
      // Daily routines are SUPPOSED to repeat. overhead-mobility schedules
      // `block_daily_reset` on Saturday and Sunday — a five-minute pre-bed
      // mobility routine — and the first version of this check flagged it
      // as a duplicate. The concern is two consecutive LOADED sessions,
      // which is what made Wed/Thu a problem on hip-rebuild; a daily reset
      // running on consecutive days is the design working.
      const isDailyRoutine = (t: string) =>
        /daily|reset|recovery|rest|mobility|prep|skill/i.test(t);
      let adjacentDuplicate: string | null = null;
      for (let i = 1; i < meaningful.length; i++) {
        const prev = meaningful[i - 1];
        if (prev === meaningful[i] && !isDailyRoutine(prev)) {
          adjacentDuplicate = prev;
          break;
        }
      }
      await ctx.check(
        "no two consecutive days present as the same session",
        async () => adjacentDuplicate === null,
        adjacentDuplicate ? `"${adjacentDuplicate}" on two days running` : undefined,
      );

      await row.first().click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(400);
      await ctx.capture("02-day-expanded");
    },
  },
  {
    id: "session-hold",
    desc: "A held exercise runs a countdown and records seconds",
    async run(ctx) {
      await ctx.page.goto("/off-plan/", { waitUntil: "domcontentloaded" });
      await ctx.page.waitForTimeout(1200);
      const row = ctx.page.locator("button", { hasText: /\d+ sets/ });
      if ((await row.count()) === 0) throw new SkipFlow("off-plan is not enabled for this persona");
      await row.first().click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(SESSION_SETTLE_MS);
      const start = ctx.page.getByRole("button", { name: /start the hold/i });
      if ((await start.count()) === 0) throw new SkipFlow("first off-plan drill is not hold-based");
      await ctx.capture("01-hold-idle");
      await ctx.check(
        "a held exercise shows its authored dose",
        async () => (await ctx.page.getByText(/Programme asks for/i).count()) > 0,
      );
      await start.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(2600);
      await ctx.capture("02-holding");
      await ctx.tap("SetView", /log it now/i);
      await ctx.page.waitForTimeout(800);
      await ctx.check(
        "a held set records seconds AND still counts as logged",
        async () => {
          const st = (await ctx.store()) as {
            logs?: Record<string, { exercises?: Record<string, { sets?: Array<{ seconds?: number | null; reps?: number | null }> }> }>;
          };
          for (const day of Object.values(st.logs ?? {})) {
            for (const e of Object.values(day.exercises ?? {})) {
              const hit = (e.sets ?? []).find((x) => x.seconds != null);
              // `reps != null` is the logged predicate in 42 places — a
              // hold that wrote only seconds would read as unlogged.
              if (hit) return hit.reps != null && (hit.seconds ?? 0) > 0;
            }
          }
          return false;
        },
      );
      await ctx.capture("03-hold-logged");
    },
  },
  {
    id: "cold-load-resume",
    desc: "A cold load returns you to the session you were in",
    async run(ctx) {
      // A10 (2026-08-26): iOS evicts a backgrounded web view and relaunches
      // cold at the manifest's start_url, which is "/". Nothing remembered
      // the route, so a workout three sets in simply vanished. A full
      // `goto` is the same cold entry the OS performs.
      await openBrief(ctx);
      const sessionUrl = ctx.page.url();
      await ctx.capture("01-in-session");

      await ctx.page.goto("/", { waitUntil: "domcontentloaded" });
      await ctx.page.waitForTimeout(2000);
      const landed = ctx.page.url();
      await ctx.capture("02-after-cold-load");
      await ctx.check(
        "a cold load restores the session you were in",
        async () => {
          const was = new URL(sessionUrl).pathname;
          const now = new URL(landed).pathname;
          return now === was;
        },
        `was ${new URL(sessionUrl).pathname}, landed ${new URL(landed).pathname}`,
      );

      // And a DELIBERATE tap on Day must not be hijacked back into the
      // session — a resume that fights navigation is worse than none.
      const dayTab = ctx.page.getByRole("link", { name: /^Day$/ });
      if (await dayTab.count()) {
        await dayTab.first().click({ timeout: CLICK_TIMEOUT_MS });
        await ctx.page.waitForTimeout(1500);
        await ctx.check(
          "tapping Day is not hijacked by the resume",
          async () => new URL(ctx.page.url()).pathname === "/",
          `landed ${new URL(ctx.page.url()).pathname}`,
        );
        await ctx.capture("03-day-tab-respected");
      }
    },
  },
  // ---- Destructive flows. These COMMIT, and run last. ----
  {
    id: "activity-log-commit",
    desc: "Log a real activity through the run/row/class form",
    destructive: true,
    async run(ctx) {
      await openBrief(ctx);
      const footer = ctx.page.getByRole("button", { name: /log a run, row, or class/i });
      if ((await footer.count()) === 0) throw new SkipFlow("no activity footer on the Brief");
      await footer.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(400);
      if (!(await ctx.tap("OffPlanSheet", /a run, a row, a class/i))) {
        throw new SkipFlow("activity form did not open");
      }
      await ctx.page.waitForTimeout(400);
      await ctx.probe("OffPlanSheet", '[data-surface="OffPlanSheet"]');

      // GPX import is drivable after all — the picker is a real
      // <input type="file">, and Playwright sets files on it directly
      // rather than going through the OS dialog.
      const gpx = ctx.page.locator('input[type="file"]');
      if (await gpx.count()) {
        ctx.note("OffPlanSheet", "Import GPX", "input present; no fixture file to attach");
      }
      await ctx.tap("OffPlanSheet", /^Log session/);
      await ctx.page.waitForTimeout(700);
      await ctx.capture("01-activity-logged");
    },
  },
  {
    id: "session-finish-here",
    desc: "⋯ → Finish here — commits a partial session",
    destructive: true,
    async run(ctx) {
      await enterSetFlow(ctx);
      const more = ctx.page.getByRole("button", { name: /more options/i });
      if ((await more.count()) === 0) throw new SkipFlow("no overflow control");
      await more.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(400);
      await ctx.probe("OverflowSheet", '[data-surface="OverflowSheet"]');
      if (!(await ctx.tap("OverflowSheet", /^I already did this/))) {
        throw new SkipFlow("no mark-all row");
      }
      await ctx.page.waitForTimeout(700);
      await ctx.capture("01-marked-all-prescribed");

      // And the other commit path, on the next exercise.
      const more2 = ctx.page.getByRole("button", { name: /more options/i });
      if (await more2.count()) {
        await more2.click({ timeout: CLICK_TIMEOUT_MS });
        await ctx.page.waitForTimeout(400);
        await ctx.tap("OverflowSheet", /^Finish here/);
        await ctx.page.waitForTimeout(600);
        await ctx.capture("02-finished-here");
      }
    },
  },
  {
    id: "session-stop",
    desc: "Note sheet → Stop session — ends the workout",
    destructive: true,
    async run(ctx) {
      await enterSetFlow(ctx);
      const more = ctx.page.getByRole("button", { name: /more options/i });
      if ((await more.count()) === 0) throw new SkipFlow("no overflow control");
      await more.click({ timeout: CLICK_TIMEOUT_MS });
      await ctx.page.waitForTimeout(400);
      if (!(await ctx.tap("OverflowSheet", /^Note for this exercise/))) {
        throw new SkipFlow("no note row");
      }
      await ctx.page.waitForTimeout(450);
      await ctx.probe("NoteSheet", '[data-surface="NoteSheet"]');
      await ctx.tap("NoteSheet", /^Pain or tweak/);
      await ctx.page.waitForTimeout(200);
      await ctx.capture("01-note-sheet");
      await ctx.tap("NoteSheet", /^Stop session/);
      await ctx.page.waitForTimeout(700);
      await ctx.capture("02-session-stopped");
    },
  },
  {
    id: "plan-skip-commit",
    desc: "Plan → Skip → confirm for real",
    destructive: true,
    async run(ctx) {
      await ctx.page.goto("/plan/", { waitUntil: "domcontentloaded" });
      await ctx.page.waitForTimeout(1200);
      const row = ctx.page.locator("button[aria-expanded]");
      const rowCount = Math.min(await row.count(), 7);
      for (let i = 0; i < rowCount; i++) {
        await row.nth(i).click({ timeout: CLICK_TIMEOUT_MS });
        await ctx.page.waitForTimeout(350);
        const skip = ctx.page.getByRole("button", { name: /^Skip$/ });
        if ((await skip.count()) > 0 && (await skip.first().isEnabled())) {
          await skip.first().click({ timeout: CLICK_TIMEOUT_MS });
          await ctx.page.waitForTimeout(450);
          await ctx.probe("ConfirmSheet", '[role="dialog"]');
          // Cancel first so both branches of the sheet are exercised, then
          // re-open and commit.
          await ctx.tap("ConfirmSheet", /Keep it/);
          await ctx.page.waitForTimeout(500);
          // Re-open from the day row. "Skip" names BOTH the row button and
          // the sheet's confirm, so before the sheets carried a
          // `data-surface` the tap resolved to the row behind the scrim
          // and timed out. `tap` scopes to the sheet now.
          const again = ctx.page.locator("button").filter({ hasText: /^Skip$/ });
          if (await again.count()) {
            await again.first().click({ timeout: CLICK_TIMEOUT_MS }).catch(() => {});
            await ctx.page.waitForTimeout(500);
          }
          await ctx.tap("ConfirmSheet", /^Skip/);
          await ctx.page.waitForTimeout(900);
          await ctx.capture("01-skipped");
          await ctx.check(
            "confirming Skip records the day as skipped",
            async () => {
              const st = (await ctx.store()) as {
                skipped?: Record<string, unknown>;
                scheduled_blocks?: Record<string, { state?: string }>;
              };
              const legacy = Object.keys(st.skipped ?? {}).length > 0;
              const blocks = Object.values(st.scheduled_blocks ?? {}).some(
                (b) => b.state === "skipped",
              );
              return legacy || blocks;
            },
          );
          return;
        }
        await row.nth(i).click({ timeout: CLICK_TIMEOUT_MS });
        await ctx.page.waitForTimeout(200);
      }
      throw new SkipFlow("no day in the visible week offers Skip");
    },
  },
  {
    id: "plan-move-commit",
    desc: "Plan → Move… → pick a day, give a reason, commit",
    destructive: true,
    async run(ctx) {
      await ctx.page.goto("/plan/", { waitUntil: "domcontentloaded" });
      await ctx.page.waitForTimeout(1200);
      const row = ctx.page.locator("button[aria-expanded]");
      const rowCount = Math.min(await row.count(), 7);
      for (let i = 0; i < rowCount; i++) {
        await row.nth(i).click({ timeout: CLICK_TIMEOUT_MS });
        await ctx.page.waitForTimeout(350);
        const move = ctx.page.getByRole("button", { name: /^Move…$/ });
        if ((await move.count()) > 0 && (await move.first().isEnabled())) {
          await move.first().click({ timeout: CLICK_TIMEOUT_MS });
          await ctx.page.waitForTimeout(450);
          await ctx.probe("MoveSheet", '[data-surface="MoveSheet"]');
          // Commit FIRST, then reopen purely to exercise Close. Closing
          // first and reopening left the sheet shut when the reopen
          // missed, and the commit button then reported "no element
          // matched" — the sheet simply was not there any more.
          // Pick a destination day, then the reason field, then commit —
          // the sheet's whole surface, not just its existence.
          // Destination days are <input type="radio">, not buttons — the
          // first version looked for a button containing a digit, never
          // matched one, so `selected` stayed null and the sheet's commit
          // button ("Move session", `disabled={!selected}`) could never be
          // clicked. The instrumentation said "found but click timed out",
          // which is exactly what a disabled control looks like.
          const day = ctx.page.locator('[data-surface="MoveSheet"] input[type="radio"]:not([disabled])');
          if (await day.count()) {
            await day.first().check({ timeout: CLICK_TIMEOUT_MS }).catch(() => {});
            await ctx.page.waitForTimeout(300);
          }
          const reason = ctx.page.locator("#movesheet-reason");
          if (await reason.count()) await reason.fill("harness: moved for coverage");
          await ctx.capture("01-move-filled");
          // The commit relabels itself. When the destination day already
          // has a session — which the first enabled radio usually is, on a
          // program that trains most days — it reads "Confirm — stack the
          // session" and wants a SECOND tap to accept the stack. A
          // /^Move session/ selector matched nothing at all there, which
          // read as "the sheet isn't open" when the sheet was fine.
          await ctx.tap("MoveSheet", /^(Move session|Confirm — stack)/);
          await ctx.page.waitForTimeout(500);
          await ctx.tap("MoveSheet", /^(Move session|Confirm — stack)/);
          await ctx.page.waitForTimeout(900);
          await ctx.capture("02-moved");
          // Now the dismiss control, on a fresh open.
          const reMove = ctx.page.getByRole("button", { name: /^Move…$/ });
          if (await reMove.count()) {
            await reMove.first().click({ timeout: CLICK_TIMEOUT_MS }).catch(() => {});
            await ctx.page.waitForTimeout(450);
            await ctx.tap("MoveSheet", /close move sheet/i);
            await ctx.page.waitForTimeout(300);
          }
          await ctx.check(
            "confirming Move records the session on its new date",
            async () => {
              const st = (await ctx.store()) as {
                scheduled_overrides?: Record<string, unknown>;
                scheduled_blocks?: Record<string, { state?: string }>;
              };
              const legacy = Object.keys(st.scheduled_overrides ?? {}).length > 0;
              const blocks = Object.values(st.scheduled_blocks ?? {}).some(
                (b) => b.state === "moved",
              );
              return legacy || blocks;
            },
          );
          return;
        }
        await row.nth(i).click({ timeout: CLICK_TIMEOUT_MS });
        await ctx.page.waitForTimeout(200);
      }
      throw new SkipFlow("no day in the visible week offers Move");
    },
  },
];

export async function runFlows(
  page: Page,
  opts: { outDir: string; programSlug: string; flows?: Flow[] },
): Promise<FlowResult[]> {
  // Non-destructive first, destructive last, so a flow that finishes a
  // session or skips a day cannot starve the ones that need it intact.
  const flows = (opts.flows ?? FLOWS)
    .slice()
    .sort((a, b) => Number(a.destructive ?? false) - Number(b.destructive ?? false));
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
    const probes: SurfaceProbe[] = [];
    const checks: CheckResult[] = [];

    /**
     * Collapse the numbers out of a control label.
     *
     * Several controls relabel themselves per set or per weight — "Save —
     * set 1 · 79.5 kg", "Done — set 3 · 82.5 kg", "Set 2, logged 0 kilos
     * by 5 reps. Edit." Counted raw, each variant became its OWN control:
     * the denominator inflated without bound, and what `probe` saw could
     * never intersect with what `tap` recorded, because they observed the
     * button at different moments with different numbers in it.
     */
    const normalise = (label: string): string =>
      label
        .replace(/\d+([.,]\d+)?/g, "N")
        .replace(/\s+/g, " ")
        .trim();

    const probeFor = (surface: string): SurfaceProbe => {
      let p = probes.find((x) => x.surface === surface);
      if (!p) {
        p = { surface, seen: [], exercised: [], skipped: [], misses: [] };
        probes.push(p);
      }
      return p;
    };

    const ctx: FlowContext = {
      page,
      outDir: flowDir,
      programSlug: opts.programSlug,
      probe: async (surface, root) => {
        const p = probeFor(surface);
        const names = await page
          .locator(`${root} button, ${root} a[href], ${root} input, ${root} summary`)
          .evaluateAll((els) =>
            els
              .map((el) => {
                const label =
                  el.getAttribute("aria-label") ??
                  (el as HTMLElement).innerText ??
                  el.getAttribute("placeholder") ??
                  "";
                return label.trim().split("\n")[0].slice(0, 60);
              })
              // The bottom nav and the Next.js dev-tools button are page
              // chrome, present behind every surface. Counting them made
              // each sheet look far larger than it is and put a floor
              // under the miss rate that no flow could ever clear.
              .filter((n) => n.length > 0)
              .filter((n) => !/^(DAY|PLAN|RECORD|PROFILE)$/.test(n))
              .filter((n) => !/Next\.js Dev Tools/i.test(n)),
          )
          .catch(() => [] as string[]);
        for (const raw of names) {
          const n = normalise(raw);
          if (!p.seen.includes(n)) p.seen.push(n);
        }
      },
      tap: async (surface, name) => {
        const p = probeFor(surface);
        // Scope to the surface being driven.
        //
        // `tap` searched the whole page, and the session shells are fixed
        // overlays rendered ON TOP of the Brief — which stays mounted
        // underneath. So `getByRole(...).first()` could resolve to the
        // Brief's exercise row rather than the rail tab of the same name,
        // and click something invisible: the tap "succeeded", nothing
        // happened, and the control never registered as exercised. That
        // is the whole reason SetView sat at 10 of 20 while every other
        // surface climbed.
        //
        // Falls back to the page when the surface carries no
        // `data-surface` root (ConfirmSheet, MoveSheet, the details
        // sheet), where the topmost dialog is unambiguous anyway.
        const rootSel = `[data-surface="${surface}"]`;
        const scope = (await page.locator(rootSel).count()) > 0 ? page.locator(rootSel) : page;
        let target = scope
          .getByRole("button", { name })
          .or(scope.getByRole("link", { name }));
        if ((await target.count()) === 0) {
          // `getByLabel` directly — an earlier version wrapped this in
          // `.filter({ hasText: /.*/ })`, which excludes inputs entirely
          // because they carry no text, so the steppers could never match.
          target = scope.getByLabel(name);
        }
        if ((await target.count()) === 0) {
          p.misses.push({ pattern: String(name), why: "no element matched" });
          return false;
        }
        // Derive the label EXACTLY as `probe` does. They disagreed before:
        // probe read `aria-label ?? innerText`, tap read `textContent`, so
        // the same control was filed under two different strings and every
        // control actually driven still showed as missing. The coverage
        // number was wrong, not the coverage.
        const label = await target
          .first()
          .evaluate((el) => {
            const raw =
              el.getAttribute("aria-label") ??
              (el as HTMLElement).innerText ??
              el.getAttribute("placeholder") ??
              "";
            return raw.trim().split("\n")[0].slice(0, 60);
          })
          .catch(() => String(name));
        try {
          await target.first().click({ timeout: CLICK_TIMEOUT_MS });
        } catch (e) {
          p.misses.push({
            pattern: String(name),
            why: `click failed: ${(e instanceof Error ? e.message : String(e)).split("\n")[0].slice(0, 90)}`,
          });
          return false;
        }
        const key = normalise(label);
        if (!p.seen.includes(key) && p.seen.length > 0) {
          // Clicked something the probe never recorded — the two are
          // looking at different elements, which is a measurement fault,
          // not a coverage one.
          p.misses.push({ pattern: String(name), why: `clicked "${key}" but probe never saw it` });
        }
        if (!p.exercised.includes(key)) p.exercised.push(key);
        if (!p.seen.includes(key)) p.seen.push(key);
        return true;
      },
      check: async (name, fn, detail) => {
        try {
          checks.push({ name, ok: await fn(), detail });
        } catch (e) {
          checks.push({
            name,
            ok: false,
            detail: `${detail ?? ""} threw: ${e instanceof Error ? e.message : String(e)}`.trim(),
          });
        }
      },
      store: async () =>
        page
          .evaluate(() => JSON.parse(localStorage.getItem("program.log.v2") ?? "{}"))
          .catch(() => ({}) as Record<string, unknown>),
      note: (surface, name, why) => {
        const p = probeFor(surface);
        const key = normalise(name);
        if (!p.skipped.some((x) => x.name === key)) p.skipped.push({ name: key, why });
        if (!p.seen.includes(key)) p.seen.push(key);
      },
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
      results.push({ id: flow.id, desc: flow.desc, status: "ok", steps, probes, checks });
    } catch (e) {
      if (e instanceof SkipFlow) {
        results.push({ id: flow.id, desc: flow.desc, status: "skipped", reason: e.message, steps, probes, checks });
      } else {
        results.push({
          id: flow.id,
          desc: flow.desc,
          status: "error",
          reason: e instanceof Error ? e.message : String(e),
          steps,
          probes,
          checks,
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
