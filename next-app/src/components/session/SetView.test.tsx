import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { SetView } from "./SetView";
import type { RailExercise } from "./DaySession";
import type { Exercise, Store } from "@/lib/schemas";
import { useStore } from "@/lib/useStore";

/**
 * The first component tests in this codebase.
 *
 * `@testing-library/react` and `happy-dom` were both installed and neither had
 * ever been used, so every UI affordance shipped guarded only by the persona
 * harness — a 30-minute run against production that cannot cheaply exercise one
 * interaction. Three bugs came through that gap in a week, all in this file's
 * AMRAP branch:
 *
 *   BUG-28  the top set was the one set whose weight could not be changed
 *   BUG-30  per-side hold timers could only ever run once
 *   BUG-32  the rep grid stopped at 9, so an AMRAP could not record 11
 *
 * Each was found by the founder mid-session, and each is trivially assertable
 * here. These tests exist so the fourth one is found by CI instead.
 */
vi.mock("@/lib/sound", () => ({ playTimerComplete: vi.fn(), playConfirm: vi.fn() }));
vi.mock("@/lib/announce", () => ({ announce: vi.fn() }));

const exercise = (over: Partial<Exercise> = {}): Exercise =>
  ({
    id: "block_pull_midshin",
    name: "Block pull (mid-shin)",
    category: "strength",
    targets: ["general"],
    ...over,
  }) as Exercise;

const rail = (over: Partial<RailExercise> = {}): RailExercise =>
  ({
    key: "block_pull_heavy:block_pull_midshin",
    blockId: "block_pull_heavy",
    blockName: "Heavy pull",
    exercise: exercise(),
    item: { exercise_id: "block_pull_midshin", sets: 6 },
    rowCount: 6,
    suggestion: {
      top_set: { kg: 125, reps: "5+" },
      fsl: { kg: 100, sets: 5, reps: 7 },
      reasoning: "",
    },
    isLoadable: true,
    ...over,
  }) as RailExercise;

function renderSet(over: Partial<RailExercise> = {}, setIndex = 0) {
  const active = rail(over);
  const onConfirmed = vi.fn();
  render(
    <SetView
      railExercises={[active]}
      active={active}
      activeSetIndex={setIndex}
      editingLoad={false}
      onEditingLoad={() => {}}
      onSelectExercise={() => {}}
      onSelectSetIndex={() => {}}
      onBackToBrief={() => {}}
      onConfirmed={onConfirmed}
      onEdited={() => {}}
      sheet={null}
      onOpenSheet={() => {}}
      onCloseSheet={() => {}}
      date="2026-09-02"
    />,
  );
  return { onConfirmed };
}

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

describe("AMRAP top set — the reps grid (BUG-32)", () => {
  it("offers a way past 9, because an AMRAP has no ceiling", () => {
    // The founder hit 11 on a 125 kg block pull and had to write it in a note.
    renderSet();
    expect(screen.getByRole("button", { name: /ten or more reps/i })).toBeDefined();
  });

  it("logs a rep count above the grid's highest tile", () => {
    const { onConfirmed } = renderSet();
    fireEvent.click(screen.getByRole("button", { name: /ten or more reps/i }));
    const plus = screen.getAllByRole("button").find((b) => b.textContent?.trim() === "+");
    expect(plus, "stepper + control").toBeDefined();
    fireEvent.click(plus!);
    expect(screen.getByRole("button", { name: /log 11 reps/i })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /log 11 reps/i }));
    expect(onConfirmed).toHaveBeenCalled();
  });

  it("still shows the fast tiles for ordinary counts", () => {
    renderSet();
    for (const n of ["1", "5", "9"]) {
      expect(screen.getAllByRole("button").some((b) => b.textContent?.trim() === n), n).toBe(true);
    }
  });
});

describe("AMRAP top set — the weight (BUG-28)", () => {
  it("lets the top set change its weight, not only the back-offs", () => {
    // The AMRAP is the set most likely to run off prescription — the founder
    // squatted 95 against a prescribed 93.5 and could only record it in prose.
    renderSet();
    expect(screen.getByRole("button", { name: /change the weight/i })).toBeDefined();
  });
});

describe("per-side hold timer (BUG-30)", () => {
  // The dose comes from `exercise.default`, not the block item — worth stating,
  // because getting that wrong makes the hold branch silently not render and
  // the test look like a component failure.
  const holdRail = () =>
    rail({
      exercise: exercise({
        id: "single_leg_rdl",
        name: "Single-leg RDL",
        category: "unilateral",
        default: { sets: 3, hold_seconds: 30, per_side: true },
      } as Partial<Exercise>),
      rowCount: 3,
      suggestion: null,
      isLoadable: false,
    });

  it("says which side you are on, so a two-sided set is not silent about it", () => {
    // `per_side` was read in exactly one place — a summary string — and the
    // timer UI was otherwise side-blind: it never said a second side existed.
    renderSet(holdRail());
    expect(screen.getByText(/side 1 of 2/i)).toBeDefined();
  });

  it("offers the other side when the clock hits zero, not just Done", () => {
    vi.useFakeTimers();
    try {
      renderSet(holdRail());
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: /start the hold/i }));
      });
      act(() => {
        vi.advanceTimersByTime(31_000);
      });
      // Before the fix the only action here was "Done", which logs the set and
      // advances — so the second side was unreachable without logging the first.
      expect(screen.getByRole("button", { name: /other side/i })).toBeDefined();
      expect(screen.getByText(/first side done/i)).toBeDefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it("restarts the clock for side two rather than logging", () => {
    vi.useFakeTimers();
    try {
      const { onConfirmed } = renderSet(holdRail());
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: /start the hold/i }));
      });
      act(() => {
        vi.advanceTimersByTime(31_000);
      });
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: /other side/i }));
      });
      expect(screen.getByText(/side 2 of 2/i)).toBeDefined();
      expect(onConfirmed, "tapping the other side must not log the set").not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});

// The counter renders as several text nodes ("6", " sets left"), so match on
// the element's normalised text rather than an exact-string query.
function setsLeftText(): string {
  const el = screen.getByText((_content, node) => {
    const t = node?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    return /^\d+ sets? left$/.test(t) && !node?.querySelector("*");
  });
  return el.textContent!.replace(/\s+/g, " ").trim();
}

describe("\"sets left\" counts required work only (2026-09-03)", () => {
  // Earlier tests in this file log sets against the same rail key and date,
  // and the zustand store is module state that outlives `cleanup()`. Reset
  // it so these assert absolute counts rather than whatever ran before.
  beforeEach(() => {
    useStore.getState().replaceStore({ version: 2, logs: {}, training_maxes: {} } as Store);
  });

  it("an ordinary heavy day counts every set", () => {
    renderSet();
    expect(setsLeftText()).toBe("6 sets left");
  });

  it("a taper day counts the top set, not the optional backoff", () => {
    // rowCount 6 = top set + 5 FSL. On a taper day the five are optional,
    // so one set stands between the user and a finished session.
    renderSet({ optionalRows: 5 });
    expect(setsLeftText()).toBe("1 set left");
  });

  it("the optional rows are still THERE — reachable, loggable, six pips", () => {
    renderSet({ optionalRows: 5 });
    expect(screen.getByRole("button", { name: /Set 6, optional, not logged yet/i })).toBeTruthy();
  });

  it("labels the current row optional when you opt into it", () => {
    renderSet({ optionalRows: 5 }, 3);
    expect(screen.getByText(/set 4 of 6 · optional/i)).toBeTruthy();
  });

  it("does not label the required top set optional", () => {
    renderSet({ optionalRows: 5 }, 0);
    expect(screen.queryByText(/· optional/i)).toBeNull();
  });
});

describe("recording a missed attempt", () => {
  /**
   * Task A from the 2026-09-03 handover. The founder made 115×1 on front
   * squat and failed 122. The 122 is the only number in that session that
   * bounds his one-rep max from above — it is what settles his training max —
   * and it lived in a free-text note nothing read.
   */
  const seed = (tms: Record<string, number>) =>
    useStore.getState().replaceStore({ version: 2, logs: {}, training_maxes: tms } as Store);

  const frontSquat = (over: Partial<RailExercise> = {}) =>
    rail({
      key: "b:front_squat",
      blockId: "b",
      exercise: exercise({ id: "front_squat", name: "Front squat" }),
      item: { exercise_id: "front_squat", sets: 1 },
      rowCount: 1,
      ...over,
    });

  it("offers the miss on a lift that has a training max", () => {
    seed({ front_squat: 110 });
    renderSet(frontSquat());
    expect(screen.getByRole("button", { name: /missed 125 kg/i })).toBeDefined();
  });

  it("writes weight, zero reps and the flag", () => {
    seed({ front_squat: 110 });
    renderSet(frontSquat());
    fireEvent.click(screen.getByRole("button", { name: /missed 125 kg/i }));
    const set = useStore.getState().store.logs["2026-09-02"].exercises["b:front_squat"].sets![0];
    expect(set).toMatchObject({ weight_kg: 125, reps: 0, failed: true });
  });

  it("clears the flag when a miss is corrected back to a made set", () => {
    // `updateSet` MERGES, so writing `failed` only on the miss path would
    // leave a stale `true` on a set the user has just fixed — and the engine
    // would go on treating a made lift as a ceiling.
    seed({ front_squat: 110 });
    renderSet(frontSquat());
    fireEvent.click(screen.getByRole("button", { name: /missed 125 kg/i }));
    cleanup();
    renderSet(frontSquat());
    // This rail's top set is an AMRAP, so the confirm is a rep tile.
    fireEvent.click(screen.getAllByRole("button").find((b) => b.textContent?.trim() === "5")!);
    const set = useStore.getState().store.logs["2026-09-02"].exercises["b:front_squat"].sets![0];
    expect(set.failed).toBe(false);
    expect(set.reps).toBeGreaterThan(0);
  });

  it("does NOT offer the miss on a lift with no training max", () => {
    // The gate that keeps this off the off-plan rail. `SetView` is shared
    // with `OffPlanSession`, whose rail runs to 34 items of accessory and
    // cardio work; a miss is only worth capturing where it moves a
    // prescription. Founder's objection, 2026-09-03.
    seed({});
    renderSet(frontSquat());
    expect(screen.queryByRole("button", { name: /missed/i })).toBeNull();
  });

  it("does NOT offer the miss on non-loadable work", () => {
    seed({ single_leg_rdl: 40 });
    renderSet(
      frontSquat({
        exercise: exercise({ id: "single_leg_rdl", name: "Single-leg RDL", category: "unilateral" }),
        isLoadable: false,
        suggestion: null,
      }),
    );
    expect(screen.queryByRole("button", { name: /missed/i })).toBeNull();
  });
});

describe("the hold timer survives a backgrounded app", () => {
  /**
   * Third of the three timers. The rest takeover has the fuller set of
   * backgrounding tests; this one exists so the hold timer cannot quietly
   * regress to counting ticks while its siblings stay correct — which is
   * exactly how all three came to ship the same bug.
   */
  const holdRail = () =>
    rail({
      exercise: exercise({
        id: "hip_flexor_iso_seated",
        name: "Seated hip flexor iso",
        category: "mobility",
        default: { sets: 5, hold_seconds: 30 },
      } as Partial<Exercise>),
      rowCount: 5,
      suggestion: null,
      isLoadable: false,
    });

  it("completes a hold that expired while the app was away", () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    vi.setSystemTime(new Date("2026-09-04T10:00:00.000Z"));
    try {
      renderSet(holdRail());
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: /start the hold/i }));
      });
      // Wall clock moves; the interval does not run in between. A
      // tick-counting timer comes back still holding at 0:30.
      act(() => {
        vi.setSystemTime(new Date(Date.now() + 45_000));
        vi.advanceTimersByTime(250);
      });
      expect(screen.getByText("0:00")).toBeDefined();
      expect(screen.getByRole("button", { name: /done — set 1/i })).toBeDefined();
    } finally {
      vi.useRealTimers();
    }
  });
});
