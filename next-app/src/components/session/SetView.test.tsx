import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { SetView } from "./SetView";
import type { RailExercise } from "./DaySession";
import type { Exercise } from "@/lib/schemas";

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
