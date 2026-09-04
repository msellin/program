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

function renderRest(over: { upNext?: Parameters<typeof RestTakeover>[0]["upNext"]; effortAnswered?: boolean; onDone?: () => void; restoredStartedAt?: number; restoredExpired?: boolean } = {}) {
  const active = rail();
  const onEffortAnswered = vi.fn();
  render(
    <RestTakeover
      active={active}
      justLoggedSetIndex={0}
      targetSeconds={120}
      restoredStartedAt={over.restoredStartedAt}
      restoredExpired={over.restoredExpired}
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

  it("snaps to the true time on Android's `resume` event", async () => {
    /**
     * Android Chrome FREEZES a backgrounded tab rather than merely hiding
     * it, then fires the Page Lifecycle `resume` event when it comes back.
     * Frozen means no interval runs at all, so `resume` is the earliest
     * moment the app can learn how much time has passed — and it is the
     * founder's actual platform. Safari fires nothing here, which is why
     * the 250ms poll stays as the floor.
     *
     * The listener was missing until 2026-09-04 because the whole family of
     * backgrounding fixes had been written against an iOS diagnosis
     * inherited from `ResumeLastRoute`.
     *
     * NOTE ON WHAT THIS DOES AND DOES NOT PROVE. It asserts the app's
     * WIRING: that a `resume` event recomputes from the wall clock. It does
     * not prove Chrome freezes, because Chromium cannot be made to freeze a
     * page under Playwright here — `Emulation.setPageVisibilityState` is
     * gone from CDP and `Page.setWebLifecycleState` silently no-ops on a
     * page the browser still considers visible. Chrome's freezing is
     * Chrome's documented behaviour; this is the half that is ours.
     */
    renderRest();
    // Clock moves while no interval runs — exactly a frozen tab.
    vi.setSystemTime(new Date(Date.now() + 45_000));
    await act(async () => {
      document.dispatchEvent(new Event("resume"));
    });
    // 120s rest, 45s frozen → 1:15 left.
    expect(screen.getByText("1:15")).toBeDefined();
  });

  it("does not run past zero into negative time", async () => {
    renderRest();
    await advanceWallClockOnly(600_000);
    expect(screen.getByText("0:00")).toBeDefined();
  });
});

describe("a rest restored after the app was discarded", () => {
  /**
   * The last piece of session state that vanished on an iOS eviction. The
   * countdown is anchored to when the rest ACTUALLY started, so it resumes
   * at the true remaining time rather than restarting.
   */
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    vi.setSystemTime(new Date("2026-09-04T10:05:00.000Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("resumes at the true remaining time, not from the top", () => {
    // 120s rest that started 90s ago. Restarting the clock would hand the
    // user an extra minute and a half of rest they did not take.
    renderRest({ restoredStartedAt: Date.now() - 90_000 });
    expect(screen.getByText("0:30")).toBeDefined();
  });

  it("says a rest is over rather than resurrecting a countdown", () => {
    // Inventing time that has already passed is worse than losing the
    // timer, because the user acts on it.
    renderRest({ restoredStartedAt: Date.now() - 300_000, restoredExpired: true });
    expect(screen.getByText(/rest finished 3 min ago/i)).toBeDefined();
    expect(screen.queryByText("0:00")).toBeNull();
  });

  it("does not fire completion for a rest that ended while away", () => {
    // `onDone` closes the takeover. Firing it on mount would shut the
    // screen before the user saw why it was there — and the effort
    // question, not the clock, is the content of this screen.
    const onDone = vi.fn();
    renderRest({ restoredStartedAt: Date.now() - 300_000, restoredExpired: true, onDone });
    expect(onDone).not.toHaveBeenCalled();
    expect(screen.getByRole("radiogroup")).toBeDefined();
  });

  it("still completes normally for a rest restored while running", () => {
    const onDone = vi.fn();
    renderRest({ restoredStartedAt: Date.now() - 90_000, onDone });
    expect(onDone).not.toHaveBeenCalled();
    act(() => {
      vi.setSystemTime(new Date(Date.now() + 31_000));
      vi.advanceTimersByTime(250);
    });
    expect(onDone).toHaveBeenCalled();
  });
});
