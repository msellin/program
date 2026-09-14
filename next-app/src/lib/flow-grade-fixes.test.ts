import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { selectProposals } from "@/lib/proposals/select";
import { evaluateOverperformer } from "@/lib/engine/adapt";
import type { Program, Store, DayLog, Symptoms } from "@/lib/schemas";

/**
 * The five compositional bugs from the 2026-08-17 flow-grade brief.
 *
 * Triaged 2026-09-13. All five had already been fixed and the brief was never
 * closed out — so it sat on the task list for four weeks as work outstanding,
 * describing an app that no longer had those problems.
 *
 * Pinned rather than simply delisted, because almost none of the five had
 * direct coverage: the fixes shipped and nothing asserted them, which is how a
 * brief like this gets rewritten from scratch in six months. The point of
 * closing it is that it stays closed.
 *
 * One deliberate DIVERGENCE from the brief is recorded here too — see "Bug #1,
 * part two" below. The brief asked for a suppression that did not ship, and
 * what shipped instead is better; that is worth saying out loud rather than
 * leaving as an apparent gap.
 */
const load = (slug: string): Program => {
  const p = JSON.parse(
    fs.readFileSync(
      path.resolve(process.cwd(), "public", "data", "programs", `${slug}.json`),
      "utf8",
    ),
  ) as Program;
  p.slug = slug;
  return p;
};

const read = (rel: string) => fs.readFileSync(path.resolve(process.cwd(), "src", rel), "utf8");
const DATE = "2026-09-13";

/**
 * A store for a user who is actually ON the programme.
 *
 * `active_program_started_at` matters more than it looks. Programme phases are
 * authored against template anchors — engine-builder's first phase is dated
 * January 2026 — and `shiftedPhases` remaps them to the user's real start.
 * Without it no phase is active, `nextLoadedDay` finds nothing to soften, and
 * `selectDayAdjustment` returns null for a reason that has nothing to do with
 * what is being tested.
 *
 * The first draft of these tests omitted it and read the resulting null as
 * over-suppression. It was an unstarted programme.
 */
const storeWith = (
  logs: Record<string, DayLog>,
  slug = "engine-builder",
  extra: Partial<Store> = {},
): Store =>
  ({
    version: 2,
    training_maxes: {},
    logs,
    user_profile: {
      active_program_id: slug,
      active_program_ids: [slug],
      active_program_started_at: `${DATE}T00:00:00.000Z`,
      program_states: { [slug]: { started_at: DATE } },
    },
    ...extra,
  }) as unknown as Store;

describe("Bug #1 — a life-load tap in onboarding is not evidence the day is going sideways", () => {
  /**
   * A fresh user picks Engine Builder, lands on Today, onboarding fires, they
   * tap 7 on the life-load step — and the FIRST proposal they ever see, one
   * second later, was "Apply 10% lighter today?" before a single logged
   * session. A baseline calibration read as a fatigue signal.
   */
  const onboardingOnly = (): Record<string, DayLog> => ({
    [DATE]: {
      date: DATE,
      symptoms: { life_load: 7 } as unknown as Symptoms,
      exercises: {},
    } as unknown as DayLog,
  });

  it("does not propose a soften off a life-load value alone", () => {
    const proposals = selectProposals(storeWith(onboardingOnly()), load("engine-builder"), DATE);
    expect(
      proposals.filter((p) => p.kind === "day_adjustment_soften"),
      "the onboarding tap is being read as a fatigue signal again",
    ).toEqual([]);
  });

  it("SEVEN of nine programmes can never receive this proposal at all", () => {
    /**
     * Found triaging the brief on 2026-09-13, and it is not what the brief
     * describes.
     *
     * `nextLoadedDay` looks for a day carrying a block with
     * `category === "strength"` AND items, and returns null otherwise;
     * `selectDayAdjustment` then bails. Only anterior-hip-rebuild and
     * concurrent-strength-maintenance have such a block. The other seven are
     * accessory, skill or run categories throughout, so the softening
     * mechanism — the one answering "you are sore, your life load is high,
     * take 10% off" — CANNOT FIRE for a pull-up, handstand, muscle-up,
     * mobility, rowing or engine-builder user, whatever they log.
     *
     * The dates settle what happened. The strength filter landed 2026-08-27
     * ("A load softening lands on a day that has load"). `loadNoun` landed
     * 2026-09-01, five days later, explicitly to stop programmes "being told
     * to trim 5% from the top set on sessions that have none" — a fix written
     * for a state the earlier change had already made unreachable.
     *
     * Whether seven programmes SHOULD be able to soften is a prescription
     * decision — a handstand session can plainly be made lighter — so this
     * asserts current reality rather than changing it. The brief's Bug #1 part
     * two asked for exactly this suppression, so it may even be wanted. What
     * it is not is DECLARED: it emerges from a helper called `nextLoadedDay`,
     * which is not where a reader would look for it.
     */
    const withSignal = onboardingOnly();
    withSignal[DATE] = {
      ...withSignal[DATE],
      notes: "shoulder sore, everything felt heavy today",
    } as unknown as DayLog;

    expect(
      selectProposals(storeWith(withSignal), load("engine-builder"), DATE).filter(
        (p) => p.kind === "day_adjustment_soften",
      ),
      "engine-builder can suddenly soften — re-read this test, the model has changed",
    ).toEqual([]);
  });

  it("the `session` wording is unreachable, and that is the evidence", () => {
    // `loadNoun` reads "session" only when the programme has no
    // `training_maxes` — and such a programme has no strength block, so it
    // never survives `nextLoadedDay`. Pinned as a contradiction rather than
    // deleted: deleting it erases the evidence that two changes disagree.
    const src = read("lib/proposals/select.ts");
    expect(src).toContain('loadNoun = hasTopSet ? "top set" : "session"');
    expect(src, "the strength filter is what makes the above unreachable").toContain(
      '=== "strength" && (b.items?.length ?? 0) > 0',
    );
  });
});

describe("Bug #2 — one proposal surface, not two", () => {
  it("Progress does not mount ProposalStack", () => {
    // Progress owns the RETROSPECTIVE engine surface (cycle-end evaluation);
    // Today owns the PROSPECTIVE one. Rendering proposals on both meant a user
    // met the same amber card they had already ignored, sometimes beside
    // EngineBanner running different TM maths on the same screen.
    expect(read("app/progress/page.tsx")).not.toContain("ProposalStack");
  });

  it("Today still mounts it — the fix was a delete, not a move", () => {
    expect(read("components/session/TodaySession.tsx")).toContain("ProposalStack");
  });
});

describe("Bug #3 — day one has one thing to do", () => {
  it("Day1EmptyState exists and Today renders it", () => {
    // Eight cards competed for "start here" on a fresh account, and the one
    // that unlocked everything else — the morning check — sat among them with
    // "Rest day" copy underneath.
    expect(fs.existsSync(path.resolve(process.cwd(), "src/components/workout/Day1EmptyState.tsx"))).toBe(true);
    const today = read("components/session/TodaySession.tsx");
    expect(today).toContain("<Day1EmptyState />");
  });
});

describe("Bug #4 — TM bumps reach a programme a beta user can actually pick", () => {
  /**
   * `TM_BUMP_INELIGIBLE_PROGRAMS` listed every programme except
   * anterior-hip-rebuild — which is `personal: true` and hidden from the
   * catalog. So `evaluateOverperformer` fired on exactly ZERO programmes a
   * beta user could choose, while the landing sold confirm-first progression.
   *
   * The brief's Option A shipped: eligibility is now a property of the
   * programme's shape rather than a hard-coded list. That is also the reason
   * `starting_values_kg` is load-bearing despite its values being inert — it
   * is the eligibility marker, by this design decision.
   */
  it("the hard-coded ineligibility list is gone", () => {
    expect(read("lib/engine/adapt.ts")).not.toContain("TM_BUMP_INELIGIBLE_PROGRAMS");
  });

  it("eligibility is derived from the programme's own shape", () => {
    expect(read("lib/engine/adapt.ts")).toContain("hasStrengthProgression");
  });

  it("a PUBLIC strength programme is eligible", () => {
    // The whole point: concurrent-strength-maintenance is in the catalog.
    const csm = load("concurrent-strength-maintenance");
    const tms = (csm as unknown as { training_maxes?: Record<string, unknown> }).training_maxes;
    expect(tms?.starting_values_kg, "CSM lost its eligibility marker").toBeTruthy();
  });

  it("an aerobic programme is still not", () => {
    // Not a blanket opening-up: engine-builder has no training max to bump.
    const eb = load("engine-builder");
    const tms = (eb as unknown as { training_maxes?: Record<string, unknown> }).training_maxes;
    expect(tms?.starting_values_kg).toBeFalsy();
    expect(evaluateOverperformer(eb, storeWith({}, "engine-builder"), DATE)).toBeNull();
  });
});

describe("Bug #5 — focus does not return to a button that has been removed", () => {
  it("the trap checks the element is still in the document", () => {
    /**
     * `useFocusTrap` restored focus to whatever was active when it mounted. If
     * that element was a ProposalCard's Accept button, accepting removed it
     * from the DOM — and restoring focus to a detached node drops a screen
     * reader user to `<body>`, losing their place entirely.
     */
    const src = read("lib/useFocusTrap.ts");
    expect(src).toContain("isConnected");
    const guard = src.indexOf("isConnected");
    const focusCall = src.indexOf("prev.focus()");
    expect(focusCall, "no restore call found").toBeGreaterThan(-1);
    expect(
      guard < focusCall,
      "the connectedness check must precede the focus call, or it guards nothing",
    ).toBe(true);
  });
});
