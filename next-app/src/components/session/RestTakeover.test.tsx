import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { RestTakeover } from "./RestTakeover";
import type { RailExercise } from "./DaySession";
import type { Exercise } from "@/lib/schemas";

vi.mock("@/lib/sound", () => ({ playTimerComplete: vi.fn(), playConfirm: vi.fn() }));
vi.mock("@/lib/announce", () => ({ announce: vi.fn() }));

const rail = (over: Partial<RailExercise> = {}): RailExercise =>
  ({
    key: "b:back_squat_highbar",
    blockId: "b",
    blockName: "Heavy",
    exercise: { id: "back_squat_highbar", name: "Back squat", category: "strength", targets: ["general"] } as Exercise,
    item: { exercise_id: "back_squat_highbar" },
    rowCount: 5,
    suggestion: { top_set: { kg: 100, reps: "5+" }, fsl: null, reasoning: "" },
    isLoadable: true,
    ...over,
  }) as RailExercise;

function renderRest(over: { upNext?: Parameters<typeof RestTakeover>[0]["upNext"]; effortAnswered?: boolean; onDone?: () => void } = {}) {
  const active = rail();
  const onEffortAnswered = vi.fn();
  render(
    <RestTakeover
      active={active}
      justLoggedSetIndex={0}
      targetSeconds={120}
      railExercises={[active]}
      upNext={over.upNext ?? { kind: "set", setIndex: 1, rail: active }}
      effortAnswered={over.effortAnswered ?? false}
      onEffortAnswered={onEffortAnswered}
      date="2026-09-02"
      onDone={over.onDone ?? (() => {})}
      onJump={() => {}}
      onOpenNoteSheet={() => {}}
    />,
  );
  return { onEffortAnswered };
}

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

describe("the effort picker", () => {
  it("asks in reps-in-reserve, not bare RPE numbers", () => {
    // Rewritten from a 3-option RPE scale: "how many more could you have done"
    // is a question a person can answer honestly mid-session; "rate 1-10" is
    // one they guess at.
    renderRest();
    // Anchored: an unanchored /easy/i matches "Very easy" too.
    for (const label of [/^very easy/i, /^easy/i, /^solid/i, /^grind/i]) {
      expect(screen.getByRole("radio", { name: label }), String(label)).toBeDefined();
    }
  });

  it("exposes the options as a radiogroup with checked state", () => {
    // The options were plain buttons — a screen reader announced four
    // unrelated controls rather than one choice with four answers.
    renderRest();
    expect(screen.getByRole("radiogroup")).toBeDefined();
    const solid = screen.getByRole("radio", { name: /solid/i });
    expect(solid.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(solid);
    expect(screen.getByRole("radio", { name: /solid/i }).getAttribute("aria-checked")).toBe("true");
  });

  it("still asks after the final set of an exercise", () => {
    // The picker sat inside the `upNext.kind !== "done"` branch, so the last
    // set of a session — the one where effort matters most for TM inference —
    // was never asked.
    renderRest({ upNext: { kind: "done" } });
    expect(screen.getByRole("radiogroup")).toBeDefined();
  });

  it("reports the answer upward so the session can move on", () => {
    const { onEffortAnswered } = renderRest();
    fireEvent.click(screen.getByRole("radio", { name: /grind/i }));
    expect(onEffortAnswered).toHaveBeenCalledWith(true);
  });
});

describe("the countdown survives a backgrounded app", () => {
  /**
   * Founder, 2026-09-04: "backgrounding app seems to mess up things,
   * timers, page views reset etc."
   *
   * `elapsed` used to be a counter the interval incremented, which made
   * the interval the clock. iOS suspends intervals in a backgrounded web
   * view, so a three-minute rest taken with the phone in a pocket came
   * back reading a fraction of what had passed and the completion chime
   * never fired.
   *
   * These tests advance the SYSTEM CLOCK without running the intervals in
   * between — which is precisely what a suspended web view does — and then
   * let a single tick through. A tick-counting timer fails all of them.
   */
  const advanceWallClockOnly = async (ms: number) => {
    vi.setSystemTime(new Date(Date.now() + ms));
    // One tick to let the poll observe the new wall clock.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
  };

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    vi.setSystemTime(new Date("2026-09-04T10:00:00.000Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("reads the true remaining time after two minutes away", async () => {
    // 120s target, gone for 90s. A tick-counting timer would still read
    // near 2:00 because its interval never ran.
    renderRest();
    await advanceWallClockOnly(90_000);
    expect(screen.getByText("0:30")).toBeDefined();
  });

  it("fires completion for a rest that expired while the app was away", async () => {
    // The condition is `elapsed >= target`, not `=== target`. Exact
    // equality is unreachable across a jump, and this is the effect the
    // whole session flow hangs off — miss it and the app sits on a dead
    // rest screen until tapped.
    const onDone = vi.fn();
    renderRest({ onDone });
    await advanceWallClockOnly(300_000);
    expect(onDone).toHaveBeenCalled();
  });

  it("does not run past zero into negative time", async () => {
    renderRest();
    await advanceWallClockOnly(600_000);
    expect(screen.getByText("0:00")).toBeDefined();
  });
});
